from typing import List, Optional

from app.core.audit import log_audit
from app.core.deps import get_current_user, require_role
from app.database import get_db
from app.models.internship import Internship
from app.models.opportunity import Application, Opportunity
from app.models.profile import StudentProfile
from app.models.user import User
from app.schemas.application import ApplicationCreate, ApplicationResponse, ApplicationStatusUpdate
from app.services.email_service import (
    send_application_status_update_email,
    send_application_submitted_email,
    send_new_application_received_email,
)
from app.services.matching import evaluate_student_opportunity_match
from app.services.notification import send_notification
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

router = APIRouter(prefix="/applications", tags=["Applications & Recruitment Workflow"])


@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def apply_opportunity(
    data: ApplicationCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    if current_user.role not in ["student", "faculty"]:
        raise HTTPException(status_code=403, detail="Only students or faculty can apply for opportunities")

    opp = db.query(Opportunity).filter(Opportunity.id == data.opportunity_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    if opp.status != "open":
        raise HTTPException(status_code=400, detail="This opportunity is no longer open for applications")

    # Prevent duplicate applications
    existing = (
        db.query(Application)
        .filter(Application.opportunity_id == data.opportunity_id, Application.applicant_user_id == current_user.id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="You have already submitted an application for this opportunity")

    # Calculate match score
    match_score = None
    resume_url = data.resume_url
    if current_user.role == "student":
        student = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
        if student:
            match_res = evaluate_student_opportunity_match(student=student, opportunity=opp, db=db)
            match_score = match_res["match_score"]
            if not resume_url:
                resume_url = student.resume_url

    app_record = Application(
        opportunity_id=opp.id,
        applicant_user_id=current_user.id,
        applicant_role=current_user.role,
        status="applied",
        resume_url=resume_url,
        cover_note=data.cover_note,
        match_score=match_score,
    )
    db.add(app_record)
    db.commit()
    db.refresh(app_record)

    # Notify employer (In-app)
    send_notification(
        db=db,
        user_id=opp.posted_by_user_id,
        title="New Application Received",
        message=f"A new candidate applied for '{opp.title}' (Match Score: {match_score or 'N/A'}%).",
        notification_type="application",
        link_url="/industry/applications",
    )

    # Dispatched transactional emails
    applicant_name = (
        current_user.student_profile.full_name
        if current_user.student_profile and current_user.student_profile.full_name
        else current_user.username
    )
    # Email to applicant
    send_application_submitted_email(
        to_email=current_user.email,
        applicant_name=applicant_name,
        opportunity_title=opp.title,
        company_name=opp.company_name or "Partner Organization",
    )

    # Email to employer
    employer_user = db.query(User).filter(User.id == opp.posted_by_user_id).first()
    if employer_user and employer_user.email:
        employer_name = (
            employer_user.industry_profile.company_name
            if employer_user.industry_profile and employer_user.industry_profile.company_name
            else employer_user.username
        )
        send_new_application_received_email(
            to_email=employer_user.email,
            employer_name=employer_name,
            applicant_name=applicant_name,
            opportunity_title=opp.title,
            match_score=match_score,
        )

    log_audit(
        db=db,
        action="APPLY_OPPORTUNITY",
        user_id=current_user.id,
        resource_type="APPLICATION",
        resource_id=str(app_record.id),
        details={"opportunity_id": opp.id, "match_score": match_score},
    )

    return app_record


@router.get("", response_model=List[ApplicationResponse])
def get_applications(
    opportunity_id: Optional[int] = None,
    status_filter: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Application)

    if current_user.role in ["student", "faculty"]:
        query = query.filter(Application.applicant_user_id == current_user.id)
    elif current_user.role == "industry":
        # Find all opportunities posted by this industry user
        opp_ids = [
            o.id for o in db.query(Opportunity.id).filter(Opportunity.posted_by_user_id == current_user.id).all()
        ]
        query = query.filter(Application.opportunity_id.in_(opp_ids))

    if opportunity_id:
        query = query.filter(Application.opportunity_id == opportunity_id)
    if status_filter:
        query = query.filter(Application.status == status_filter)

    apps = query.order_by(Application.applied_at.desc()).all()
    results = []
    for a in apps:
        opp = a.opportunity
        applicant = a.applicant
        applicant_info = None
        if applicant and applicant.student_profile:
            sp = applicant.student_profile
            applicant_info = {
                "user_id": applicant.id,
                "full_name": sp.full_name,
                "email": applicant.email,
                "course": sp.course,
                "cgpa": sp.cgpa,
                "institution_name": sp.institution.name if sp.institution else None,
                "department_name": sp.department.name if sp.department else None,
            }
        elif applicant:
            applicant_info = {
                "user_id": applicant.id,
                "full_name": applicant.username,
                "email": applicant.email,
                "course": None,
                "cgpa": None,
                "institution_name": None,
                "department_name": None,
            }

        results.append(
            {
                "id": a.id,
                "opportunity_id": a.opportunity_id,
                "applicant_user_id": a.applicant_user_id,
                "applicant_role": a.applicant_role,
                "status": a.status,
                "resume_url": a.resume_url,
                "cover_note": a.cover_note,
                "reviewer_notes": a.reviewer_notes,
                "match_score": a.match_score,
                "applied_at": a.applied_at,
                "updated_at": a.updated_at,
                "opportunity": opp,
                "applicant": applicant_info,
            }
        )
    return results


@router.put("/{application_id}/status", response_model=ApplicationResponse)
def update_application_status(
    application_id: int,
    data: ApplicationStatusUpdate,
    current_user: User = Depends(require_role(["industry", "admin"])),
    db: Session = Depends(get_db),
):
    app_record = db.query(Application).filter(Application.id == application_id).first()
    if not app_record:
        raise HTTPException(status_code=404, detail="Application not found")

    opp = app_record.opportunity
    if current_user.role != "admin" and opp.posted_by_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot manage applications for other companies")

    app_record.status = data.status
    if data.reviewer_notes:
        app_record.reviewer_notes = data.reviewer_notes

    # If selected and is internship, instantiate internship record
    if data.status == "selected" and opp.type in [
        "internship",
        "faculty_internship",
        "industrial_training",
        "live_project",
    ]:
        existing_internship = db.query(Internship).filter(Internship.application_id == app_record.id).first()
        if not existing_internship and app_record.applicant.student_profile:
            student = app_record.applicant.student_profile
            ind_profile = current_user.industry_profile
            new_internship = Internship(
                application_id=app_record.id,
                student_id=student.id,
                industry_id=ind_profile.id if ind_profile else None,
                status="active",
            )
            db.add(new_internship)

    db.commit()
    db.refresh(app_record)

    send_notification(
        db=db,
        user_id=app_record.applicant_user_id,
        title=f"Application Status Updated: {data.status.capitalize()}",
        message=f"Your application for '{opp.title}' at {opp.company_name} is now '{data.status.replace('_', ' ').capitalize()}'.",
        notification_type="application",
        link_url="/student/applications",
    )

    # Trigger transactional status update email
    applicant = app_record.applicant
    if applicant and applicant.email:
        applicant_name = (
            applicant.student_profile.full_name
            if applicant.student_profile and applicant.student_profile.full_name
            else applicant.username
        )
        send_application_status_update_email(
            to_email=applicant.email,
            applicant_name=applicant_name,
            opportunity_title=opp.title,
            company_name=opp.company_name or "Partner Organization",
            status=data.status,
        )

    applicant_info = None
    if applicant and applicant.student_profile:
        sp = applicant.student_profile
        applicant_info = {
            "user_id": applicant.id,
            "full_name": sp.full_name,
            "email": applicant.email,
            "course": sp.course,
            "cgpa": sp.cgpa,
            "institution_name": sp.institution.name if sp.institution else None,
            "department_name": sp.department.name if sp.department else None,
        }
    elif applicant:
        applicant_info = {
            "user_id": applicant.id,
            "full_name": applicant.username,
            "email": applicant.email,
            "course": None,
            "cgpa": None,
            "institution_name": None,
            "department_name": None,
        }

    return {
        "id": app_record.id,
        "opportunity_id": app_record.opportunity_id,
        "applicant_user_id": app_record.applicant_user_id,
        "applicant_role": app_record.applicant_role,
        "status": app_record.status,
        "resume_url": app_record.resume_url,
        "cover_note": app_record.cover_note,
        "reviewer_notes": app_record.reviewer_notes,
        "match_score": app_record.match_score,
        "applied_at": app_record.applied_at,
        "updated_at": app_record.updated_at,
        "opportunity": opp,
        "applicant": applicant_info,
    }
