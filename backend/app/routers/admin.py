import csv
import io
import uuid
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.config import settings
from app.core.deps import require_role
from app.core.security import hash_password
from app.database import get_db
from app.models.audit import AuditLog
from app.models.profile import FacultyProfile, StudentProfile
from app.models.user import Department, Institution, User
from app.schemas.user import UserResponse
from app.services.email_service import _build_html_template, send_bulk_onboarding_email, send_email_sync

router = APIRouter(prefix="/admin", tags=["System Administration"])


class BulkUploadTextRequest(BaseModel):
    csv_content: str
    default_role: Optional[str] = "student"
    institution_id: Optional[int] = None


@router.get("/audit-logs")
def get_audit_logs(
    limit: int = 50,
    action: Optional[str] = None,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    query = db.query(AuditLog)
    if action:
        query = query.filter(AuditLog.action == action)
    logs = query.order_by(AuditLog.created_at.desc()).limit(limit).all()
    return logs


@router.get("/pending-approvals", response_model=List[UserResponse])
def get_pending_approvals(current_user: User = Depends(require_role(["admin"])), db: Session = Depends(get_db)):
    return db.query(User).filter(User.is_approved.is_(False)).order_by(User.created_at.desc()).all()


@router.get("/users")
def get_all_users(
    role: Optional[str] = None,
    is_approved: Optional[bool] = None,
    current_user: User = Depends(require_role(["admin", "institution"])),
    db: Session = Depends(get_db),
):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    if is_approved is not None:
        query = query.filter(User.is_approved == is_approved)
    users = query.order_by(User.created_at.desc()).limit(100).all()
    return [
        {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "role": u.role,
            "is_active": u.is_active,
            "is_approved": u.is_approved,
            "created_at": u.created_at.isoformat() if u.created_at else None,
        }
        for u in users
    ]


@router.post("/bulk-upload")
def bulk_upload_users(
    data: BulkUploadTextRequest,
    current_user: User = Depends(require_role(["admin", "institution"])),
    db: Session = Depends(get_db),
):
    """
    Bulk Onboarding via CSV (Section 18 & 29 of Specification):
    Parses CSV containing Name, Email, Role, Department, Year/Designation, Phone.
    Creates accounts, initializes profiles, and issues secure initial activation passwords.
    """
    lines = data.csv_content.strip().splitlines()
    if not lines:
        raise HTTPException(status_code=400, detail="CSV data cannot be empty")

    reader = csv.DictReader(lines)
    created_count = 0
    skipped_count = 0
    details = []

    # Resolve default institution if current user is institution
    inst_id = data.institution_id
    if current_user.role == "institution":
        if current_user.institution_id:
            inst_id = current_user.institution_id
        else:
            inst_rec = (
                db.query(Institution)
                .filter((Institution.name == current_user.username) | (Institution.contact_email == current_user.email))
                .first()
            )
            if inst_rec:
                inst_id = inst_rec.id
                current_user.institution_id = inst_rec.id
                db.commit()

    for row in reader:
        # Standardize keys (strip whitespace, lowercase, remove dots)
        normalized_row = {k.strip().lower().replace(".", ""): v.strip() for k, v in row.items() if k}

        # Resolve email (accepts 'mail', 'email', 'e-mail')
        email = normalized_row.get("mail") or normalized_row.get("email") or normalized_row.get("e-mail")
        if not email or "@" not in email:
            skipped_count += 1
            details.append({"email": email or "unknown", "status": "skipped", "reason": "Invalid email address"})
            continue

        existing = db.query(User).filter(User.email.ilike(email)).first()
        if existing:
            skipped_count += 1
            details.append({"email": email, "status": "skipped", "reason": "Account with this email already exists"})
            continue

        full_name = (
            normalized_row.get("name")
            or normalized_row.get("fullname")
            or email.split("@")[0].replace(".", " ").title()
        )
        role = (normalized_row.get("role") or data.default_role or "student").lower()
        if role not in ["student", "faculty", "industry", "institution", "admin"]:
            role = "student"

        # Resolve department (accepts 'dept', 'department', 'course')
        dept_name = normalized_row.get("dept") or normalized_row.get("department") or "Computer Science"
        phone = normalized_row.get("phone", "")

        # Generated initial password
        temp_pwd = f"Welcome@{uuid.uuid4().hex[:6].capitalize()}"
        username = email.split("@")[0].lower() + f"{created_count+1}"

        user = User(
            email=email,
            username=username,
            hashed_password=hash_password(temp_pwd),
            role=role,
            is_approved=True,
            is_active=True,
            institution_id=inst_id,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # Create profile:
        # If student: take academic year
        # If faculty: DO NOT take year (as faculty does not study)
        if role == "student":
            raw_year = normalized_row.get("year", "1")
            year = int(raw_year) if raw_year.isdigit() and 1 <= int(raw_year) <= 6 else 1
            sp = StudentProfile(
                user_id=user.id,
                full_name=full_name,
                phone=phone,
                institution_id=inst_id,
                course=dept_name,
                year_of_study=year,
                cgpa=8.0,
            )
            db.add(sp)
        elif role == "faculty":
            # Faculty does not have a year of study; designate academic role and department specialization
            designation = normalized_row.get("designation") or "Faculty / Professor"
            fp = FacultyProfile(
                user_id=user.id,
                full_name=full_name,
                phone=phone,
                institution_id=inst_id,
                designation=designation,
                specialization=dept_name,
            )
            db.add(fp)

        db.commit()
        created_count += 1

        # Dispatch bulk onboarding transactional email with credentials
        send_bulk_onboarding_email(
            to_email=email,
            full_name=full_name,
            username=username,
            temp_password=temp_pwd,
            role=role,
        )

        details.append(
            {
                "email": email,
                "username": username,
                "role": role,
                "full_name": full_name,
                "initial_password": temp_pwd,
                "status": "created",
            }
        )

    return {
        "total_processed": len(details),
        "created_count": created_count,
        "skipped_count": skipped_count,
        "details": details,
    }


class TestEmailRequest(BaseModel):
    recipient_email: str
    subject: Optional[str] = "AIC Portal SMTP Connectivity Test"


@router.post("/test-email")
def test_smtp_email(
    data: TestEmailRequest,
    current_user: User = Depends(require_role(["admin"])),
):
    """
    Diagnostic endpoint to test and verify SMTP email delivery and settings.
    """
    html = _build_html_template(
        title="SMTP Integration Test",
        preheader="This is a test email from your AIC Portal installation.",
        greeting=f"Hello {current_user.username}",
        main_message=(
            "This is a diagnostic test email verifying that your SMTP credentials, "
            "TLS configuration, and responsive HTML email templates are operating properly."
        ),
        details_list=[
            ("SMTP Host", settings.SMTP_HOST),
            ("SMTP Port", str(settings.SMTP_PORT)),
            ("Sender Email", settings.EMAILS_FROM_EMAIL),
            ("TLS Active", str(settings.SMTP_TLS)),
            ("SSL Active", str(settings.SMTP_SSL)),
            ("SMTP Authenticated", "Yes" if bool(settings.SMTP_USER) else "No (Simulation Mode)"),
        ],
        action_url="/admin",
        action_text="Return to Admin Console",
    )

    success = send_email_sync(
        to_email=data.recipient_email,
        subject=data.subject or "AIC Portal SMTP Connectivity Test",
        html_content=html,
    )

    return {
        "success": success,
        "recipient": data.recipient_email,
        "smtp_host": settings.SMTP_HOST,
        "smtp_port": settings.SMTP_PORT,
        "from_email": settings.EMAILS_FROM_EMAIL,
        "configured": bool(settings.SMTP_USER and settings.SMTP_PASSWORD),
        "message": (
            "Email dispatched successfully via configured SMTP server."
            if (settings.SMTP_USER and settings.SMTP_PASSWORD)
            else "Email simulation logged successfully (set SMTP_USER and SMTP_PASSWORD in backend/.env to send real network emails)."
        ),
    }
