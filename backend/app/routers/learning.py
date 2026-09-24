import json
import uuid
from datetime import datetime
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.core.audit import log_audit
from app.core.deps import get_current_user, get_optional_current_user, require_role
from app.database import get_db
from app.models.learning import Certificate, LearningProgram, ProgramEnrollment
from app.models.portfolio import Certification, Portfolio
from app.models.profile import StudentProfile
from app.models.user import User
from app.schemas.learning import (
    AIGenerateSyllabusRequest,
    CertificateResponse,
    IssueCertificateRequest,
    LearningProgramCreate,
    LearningProgramResponse,
    LearningProgramUpdate,
    ProgramEnrollmentResponse,
    StudentEnrollmentDetail,
    UpdateProgressRequest,
)
from app.services.email_service import send_course_certificate_email
from app.services.groq_service import generate_learning_syllabus

router = APIRouter(prefix="/learning-programs", tags=["Learning Programs Marketplace"])


def _generate_certificate_for_enrollment(enrollment: ProgramEnrollment, db: Session) -> Certificate:
    """Internal helper to create a certificate, link to portfolio, and trigger email."""
    if enrollment.certificate_issued and enrollment.certificate_id:
        existing = db.query(Certificate).filter(Certificate.id == enrollment.certificate_id).first()
        if existing:
            return existing

    student = db.query(User).filter(User.id == enrollment.student_id).first()
    prog = db.query(LearningProgram).filter(LearningProgram.id == enrollment.program_id).first()
    if not student or not prog:
        raise HTTPException(status_code=400, detail="Student or program data missing.")

    # Determine student full name
    student_profile = db.query(StudentProfile).filter(StudentProfile.user_id == student.id).first()
    student_name = ""
    if student_profile and student_profile.full_name:
        student_name = student_profile.full_name
    elif student.full_name:
        student_name = student.full_name
    else:
        student_name = student.username.title()

    cert_num = f"AIC-CERT-{datetime.utcnow().year}-{uuid.uuid4().hex[:8].upper()}"
    v_hash = uuid.uuid4().hex

    cert = Certificate(
        certificate_number=cert_num,
        program_id=prog.id,
        student_id=student.id,
        student_name=student_name,
        student_email=student.email,
        program_title=prog.title,
        program_type=prog.program_type,
        issuer_name=prog.provider_name,
        issue_date=datetime.utcnow(),
        skills=prog.skills_covered,
        verification_hash=v_hash,
        status="valid",
    )
    db.add(cert)
    db.flush()

    enrollment.certificate_issued = True
    enrollment.certificate_id = cert.id
    enrollment.status = "completed"
    enrollment.completed_at = datetime.utcnow()
    enrollment.progress_percent = 100.0

    # Auto-add to student portfolio if student profile exists
    if student_profile:
        portfolio = db.query(Portfolio).filter(Portfolio.student_id == student_profile.id).first()
        if not portfolio:
            portfolio = Portfolio(student_id=student_profile.id, is_public=True)
            db.add(portfolio)
            db.flush()

        # Check if already added
        existing_cert = (
            db.query(Certification)
            .filter(
                Certification.portfolio_id == portfolio.id,
                Certification.title == prog.title,
            )
            .first()
        )
        if not existing_cert:
            new_port_cert = Certification(
                portfolio_id=portfolio.id,
                title=prog.title,
                issuing_organization=prog.provider_name,
                issue_date=datetime.utcnow(),
                credential_id=cert.certificate_number,
                credential_url=f"/verify-certificate/{cert.verification_hash}",
                verification_status="verified",
            )
            db.add(new_port_cert)

    db.commit()
    db.refresh(cert)

    # Trigger Async Email Delivery to Student
    try:
        send_course_certificate_email(
            to_email=student.email,
            student_name=student_name,
            course_title=prog.title,
            provider_name=prog.provider_name,
            certificate_number=cert.certificate_number,
            verification_hash=cert.verification_hash,
        )
    except Exception:
        pass

    return cert


@router.get("", response_model=List[LearningProgramResponse])
def get_learning_programs(
    program_type: Optional[str] = None,
    learning_mode: Optional[str] = None,
    search: Optional[str] = None,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(LearningProgram)
    if program_type:
        query = query.filter(LearningProgram.program_type == program_type)
    if learning_mode:
        query = query.filter(LearningProgram.learning_mode == learning_mode)
    if search:
        s = f"%{search}%"
        query = query.filter(
            (LearningProgram.title.ilike(s))
            | (LearningProgram.skills_covered.ilike(s))
            | (LearningProgram.provider_name.ilike(s))
            | (LearningProgram.description.ilike(s))
        )

    programs = query.order_by(LearningProgram.created_at.desc()).all()

    # Pre-fetch user enrollments if authenticated
    user_enrollment_map = {}
    if current_user and hasattr(current_user, "role") and current_user.role == "student":
        enrollments = db.query(ProgramEnrollment).filter(ProgramEnrollment.student_id == current_user.id).all()
        for enr in enrollments:
            user_enrollment_map[enr.program_id] = enr

    results = []
    for p in programs:
        enroll_count = db.query(ProgramEnrollment).filter(ProgramEnrollment.program_id == p.id).count()
        comp_count = (
            db.query(ProgramEnrollment)
            .filter(
                ProgramEnrollment.program_id == p.id,
                ProgramEnrollment.status == "completed",
            )
            .count()
        )

        my_enr = user_enrollment_map.get(p.id)
        v_hash = None
        if my_enr and my_enr.certificate_id:
            c = db.query(Certificate).filter(Certificate.id == my_enr.certificate_id).first()
            if c:
                v_hash = c.verification_hash

        res = LearningProgramResponse(
            id=p.id,
            title=p.title,
            provider_name=p.provider_name,
            provider_type=p.provider_type or "industry",
            program_type=p.program_type,
            description=p.description,
            skills_covered=p.skills_covered,
            duration=p.duration,
            eligibility=p.eligibility,
            registration_deadline=p.registration_deadline,
            certificate_available=p.certificate_available,
            learning_mode=p.learning_mode or "online",
            external_link=p.external_link,
            fee_amount=p.fee_amount or 0.0,
            modules_json=p.modules_json,
            auto_certify=p.auto_certify if p.auto_certify is not None else True,
            created_by_user_id=p.created_by_user_id,
            created_at=p.created_at,
            enrollments_count=enroll_count,
            completed_count=comp_count,
            is_enrolled=bool(my_enr),
            my_progress=my_enr.progress_percent if my_enr else 0.0,
            my_status=my_enr.status if my_enr else None,
            my_certificate_id=my_enr.certificate_id if my_enr else None,
            my_verification_hash=v_hash,
        )
        results.append(res)

    return results


@router.post("", response_model=LearningProgramResponse, status_code=status.HTTP_201_CREATED)
def create_learning_program(
    data: LearningProgramCreate,
    current_user: User = Depends(require_role(["industry", "institution", "admin"])),
    db: Session = Depends(get_db),
):
    prog_data = data.dict()
    prog_data["created_by_user_id"] = current_user.id

    # If modules_json not provided, automatically generate a structured 4-module syllabus
    if not prog_data.get("modules_json"):
        clean_topic = prog_data.get("title", "Technical Mastery")
        default_modules = [
            {
                "id": 1,
                "title": f"Module 1: Orientation & Foundations of {clean_topic}",
                "duration": "2 Hours",
                "description": "Foundational architectural concepts, prerequisites, and modern developer setup.",
                "topics": ["Architecture Overview", "Environment Setup", "Core Syntax & Tools"],
                "reading_time": "20 mins",
                "video_url": "",
            },
            {
                "id": 2,
                "title": "Module 2: Practical Industry Workflows & Implementation",
                "duration": "3 Hours",
                "description": "Deep-dive implementation with standard design patterns and real-time data handling.",
                "topics": ["Implementation Deep Dive", "Data Management", "Error Handling"],
                "reading_time": "30 mins",
                "video_url": "",
            },
            {
                "id": 3,
                "title": "Module 3: Security, Optimization & Production Readiness",
                "duration": "2.5 Hours",
                "description": "Enterprise performance, testing workflows, and defensive programming standards.",
                "topics": ["Optimization & Latency", "Automated Testing", "Security Best Practices"],
                "reading_time": "25 mins",
                "video_url": "",
            },
            {
                "id": 4,
                "title": "Module 4: Capstone Evaluation & Verified Certification",
                "duration": "2 Hours",
                "description": "Demonstrate mastery through practical deliverables to earn certified industry credentials.",
                "topics": ["Capstone Review", "Project Validation", "Credential Issuance"],
                "reading_time": "30 mins",
                "video_url": "",
            },
        ]
        prog_data["modules_json"] = json.dumps(default_modules)

    prog = LearningProgram(**prog_data)
    db.add(prog)
    db.commit()
    db.refresh(prog)

    log_audit(
        db=db,
        action="CREATE_LEARNING_PROGRAM",
        user_id=current_user.id,
        resource_type="LEARNING_PROGRAM",
        resource_id=str(prog.id),
        details={"title": prog.title, "type": prog.program_type},
    )
    return prog


@router.put("/{program_id}", response_model=LearningProgramResponse)
def update_learning_program(
    program_id: int,
    data: LearningProgramUpdate,
    current_user: User = Depends(require_role(["industry", "institution", "admin"])),
    db: Session = Depends(get_db),
):
    prog = db.query(LearningProgram).filter(LearningProgram.id == program_id).first()
    if not prog:
        raise HTTPException(status_code=404, detail="Program not found.")

    if current_user.role != "admin" and prog.created_by_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this program.")

    for k, v in data.dict(exclude_unset=True).items():
        setattr(prog, k, v)

    db.commit()
    db.refresh(prog)
    return prog


@router.delete("/{program_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_learning_program(
    program_id: int,
    current_user: User = Depends(require_role(["industry", "institution", "admin"])),
    db: Session = Depends(get_db),
):
    prog = db.query(LearningProgram).filter(LearningProgram.id == program_id).first()
    if not prog:
        raise HTTPException(status_code=404, detail="Program not found.")

    if current_user.role != "admin" and prog.created_by_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this program.")

    db.delete(prog)
    db.commit()
    return None


@router.post("/ai-generate-syllabus")
def ai_generate_syllabus_endpoint(
    req: AIGenerateSyllabusRequest,
    current_user: User = Depends(require_role(["industry", "institution", "admin"])),
):
    """Uses multi-tier AI to draft complete syllabus, module breakdown, and skills in seconds."""
    result = generate_learning_syllabus(
        topic=req.topic,
        program_type=req.program_type,
        duration=req.duration,
        skill_level=req.skill_level,
    )
    return result


@router.post("/{program_id}/enroll", response_model=ProgramEnrollmentResponse)
def enroll_in_program(
    program_id: int,
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db),
):
    prog = db.query(LearningProgram).filter(LearningProgram.id == program_id).first()
    if not prog:
        raise HTTPException(status_code=404, detail="Program not found.")

    existing = (
        db.query(ProgramEnrollment)
        .filter(
            ProgramEnrollment.program_id == program_id,
            ProgramEnrollment.student_id == current_user.id,
        )
        .first()
    )
    if existing:
        return existing

    enrollment = ProgramEnrollment(
        program_id=program_id,
        student_id=current_user.id,
        enrolled_at=datetime.utcnow(),
        status="enrolled",
        progress_percent=0.0,
        completed_modules="[]",
        certificate_issued=False,
    )
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return enrollment


@router.get("/my-enrollments", response_model=List[ProgramEnrollmentResponse])
def get_my_enrollments(
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db),
):
    enrollments = (
        db.query(ProgramEnrollment)
        .options(
            joinedload(ProgramEnrollment.program),
            joinedload(ProgramEnrollment.certificate),
        )
        .filter(ProgramEnrollment.student_id == current_user.id)
        .order_by(ProgramEnrollment.enrolled_at.desc())
        .all()
    )
    return enrollments


@router.post("/enrollments/{enrollment_id}/progress")
def update_enrollment_progress(
    enrollment_id: int,
    req: UpdateProgressRequest,
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db),
):
    enrollment = (
        db.query(ProgramEnrollment)
        .filter(
            ProgramEnrollment.id == enrollment_id,
            ProgramEnrollment.student_id == current_user.id,
        )
        .first()
    )
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found.")

    prog = db.query(LearningProgram).filter(LearningProgram.id == enrollment.program_id).first()
    if not prog:
        raise HTTPException(status_code=404, detail="Program not found.")

    # Parse modules list
    try:
        modules = json.loads(prog.modules_json or "[]")
    except Exception:
        modules = []

    total_modules = max(len(modules), 1)

    try:
        completed_set = set(json.loads(enrollment.completed_modules or "[]"))
    except Exception:
        completed_set = set()

    if req.completed:
        completed_set.add(req.module_id)
    else:
        completed_set.discard(req.module_id)

    enrollment.completed_modules = json.dumps(list(completed_set))
    calc_percent = round((len(completed_set) / total_modules) * 100.0, 1)
    enrollment.progress_percent = min(calc_percent, 100.0)

    if enrollment.progress_percent > 0 and enrollment.status == "enrolled":
        enrollment.status = "in_progress"

    certificate_data = None
    # Auto-certify trigger if 100% completed
    if enrollment.progress_percent >= 100.0 and prog.auto_certify and not enrollment.certificate_issued:
        cert = _generate_certificate_for_enrollment(enrollment, db)
        certificate_data = {
            "certificate_number": cert.certificate_number,
            "verification_hash": cert.verification_hash,
            "issue_date": cert.issue_date.isoformat(),
        }
    else:
        db.commit()

    return {
        "success": True,
        "progress_percent": enrollment.progress_percent,
        "status": enrollment.status,
        "completed_modules": list(completed_set),
        "certificate_issued": enrollment.certificate_issued,
        "certificate": certificate_data,
    }


@router.get("/industry/manage", response_model=List[LearningProgramResponse])
def get_industry_published_programs(
    current_user: User = Depends(require_role(["industry", "institution", "admin"])),
    db: Session = Depends(get_db),
):
    query = db.query(LearningProgram)
    if current_user.role != "admin":
        query = query.filter(LearningProgram.created_by_user_id == current_user.id)

    programs = query.order_by(LearningProgram.created_at.desc()).all()

    results = []
    for p in programs:
        enroll_count = db.query(ProgramEnrollment).filter(ProgramEnrollment.program_id == p.id).count()
        comp_count = (
            db.query(ProgramEnrollment)
            .filter(
                ProgramEnrollment.program_id == p.id,
                ProgramEnrollment.status == "completed",
            )
            .count()
        )
        res = LearningProgramResponse(
            id=p.id,
            title=p.title,
            provider_name=p.provider_name,
            provider_type=p.provider_type or "industry",
            program_type=p.program_type,
            description=p.description,
            skills_covered=p.skills_covered,
            duration=p.duration,
            eligibility=p.eligibility,
            registration_deadline=p.registration_deadline,
            certificate_available=p.certificate_available,
            learning_mode=p.learning_mode or "online",
            external_link=p.external_link,
            fee_amount=p.fee_amount or 0.0,
            modules_json=p.modules_json,
            auto_certify=p.auto_certify if p.auto_certify is not None else True,
            created_by_user_id=p.created_by_user_id,
            created_at=p.created_at,
            enrollments_count=enroll_count,
            completed_count=comp_count,
        )
        results.append(res)
    return results


@router.get("/{program_id}/students", response_model=List[StudentEnrollmentDetail])
def get_program_enrolled_students(
    program_id: int,
    current_user: User = Depends(require_role(["industry", "institution", "admin"])),
    db: Session = Depends(get_db),
):
    prog = db.query(LearningProgram).filter(LearningProgram.id == program_id).first()
    if not prog:
        raise HTTPException(status_code=404, detail="Program not found.")

    if current_user.role != "admin" and prog.created_by_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view participant roster.")

    enrollments = (
        db.query(ProgramEnrollment)
        .filter(ProgramEnrollment.program_id == program_id)
        .order_by(ProgramEnrollment.enrolled_at.desc())
        .all()
    )

    details = []
    for enr in enrollments:
        student = db.query(User).filter(User.id == enr.student_id).first()
        if not student:
            continue

        sp = db.query(StudentProfile).filter(StudentProfile.user_id == student.id).first()
        student_name = sp.full_name if sp and sp.full_name else (student.full_name or student.username.title())
        dept = sp.department.name if sp and sp.department else None
        inst = sp.institution.name if sp and sp.institution else None

        cert_num = None
        v_hash = None
        if enr.certificate_id:
            c = db.query(Certificate).filter(Certificate.id == enr.certificate_id).first()
            if c:
                cert_num = c.certificate_number
                v_hash = c.verification_hash

        details.append(
            StudentEnrollmentDetail(
                enrollment_id=enr.id,
                student_id=student.id,
                student_name=student_name,
                student_email=student.email,
                student_department=dept,
                student_institution=inst,
                enrolled_at=enr.enrolled_at,
                status=enr.status,
                progress_percent=enr.progress_percent,
                completed_modules=enr.completed_modules,
                completed_at=enr.completed_at,
                certificate_issued=enr.certificate_issued,
                certificate_number=cert_num,
                verification_hash=v_hash,
            )
        )
    return details


@router.post("/enrollments/{enrollment_id}/issue-certificate", response_model=CertificateResponse)
def issue_certificate_endpoint(
    enrollment_id: int,
    current_user: User = Depends(require_role(["industry", "institution", "admin"])),
    db: Session = Depends(get_db),
):
    """Explicitly generates/dispatches certificate to student."""
    enrollment = db.query(ProgramEnrollment).filter(ProgramEnrollment.id == enrollment_id).first()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found.")

    prog = db.query(LearningProgram).filter(LearningProgram.id == enrollment.program_id).first()
    if not prog:
        raise HTTPException(status_code=404, detail="Program not found.")

    if current_user.role != "admin" and prog.created_by_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to issue certificate for this program.")

    cert = _generate_certificate_for_enrollment(enrollment, db)
    return cert


@router.get("/certificates/{verification_hash}", response_model=CertificateResponse)
def verify_certificate_public(
    verification_hash: str,
    db: Session = Depends(get_db),
):
    """Public tamper-proof verification endpoint for certificates."""
    cert = db.query(Certificate).filter(Certificate.verification_hash == verification_hash).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found or verification hash invalid.")
    return cert
