from typing import List, Optional

from app.core.audit import log_audit
from app.core.deps import get_current_user, require_role
from app.database import get_db
from app.models.profile import FacultyProfile, StudentProfile
from app.models.user import Department, Institution, User
from app.schemas.user import (
    DepartmentCreate,
    DepartmentResponse,
    InstitutionCreate,
    InstitutionResponse,
    UserApprovalUpdate,
    UserResponse,
)
from app.services.email_service import send_approval_status_email
from app.services.notification import send_notification
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

router = APIRouter(prefix="/users", tags=["Users & Organizations"])


@router.get("", response_model=List[UserResponse])
def get_users(
    role: Optional[str] = None,
    is_approved: Optional[bool] = None,
    is_active: Optional[bool] = None,
    institution_id: Optional[int] = None,
    current_user: User = Depends(require_role(["admin", "institution"])),
    db: Session = Depends(get_db),
):
    query = db.query(User)

    # Institution ABAC restriction: Institution can only view users in their institution
    if current_user.role == "institution":
        if not current_user.institution_id:
            return []
        query = query.filter(User.institution_id == current_user.institution_id)
    elif institution_id:
        query = query.filter(User.institution_id == institution_id)

    if role:
        query = query.filter(User.role == role)
    if is_approved is not None:
        query = query.filter(User.is_approved == is_approved)
    if is_active is not None:
        query = query.filter(User.is_active == is_active)

    return query.order_by(User.created_at.desc()).all()


@router.put("/{user_id}/approval", response_model=UserResponse)
def update_user_approval(
    user_id: int,
    data: UserApprovalUpdate,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_approved = data.is_approved
    if data.is_active is not None:
        user.is_active = data.is_active
    elif not data.is_approved:
        # If rejecting approval, default is_active to False to remove from active pending queue
        user.is_active = False

    db.commit()
    db.refresh(user)

    status_str = "approved" if user.is_approved else ("rejected" if not user.is_active else "pending")
    send_notification(
        db=db,
        user_id=user.id,
        title=f"Account Registration {status_str.capitalize()}",
        message=f"Your account registration has been {status_str} by the platform administrator.",
        notification_type="approval",
    )

    # Trigger transactional email
    full_name = user.username
    if user.student_profile and user.student_profile.full_name:
        full_name = user.student_profile.full_name
    elif user.faculty_profile and user.faculty_profile.full_name:
        full_name = user.faculty_profile.full_name
    elif user.industry_profile and (user.industry_profile.company_name or user.industry_profile.contact_person):
        full_name = user.industry_profile.company_name or user.industry_profile.contact_person

    send_approval_status_email(
        to_email=user.email,
        full_name=full_name,
        is_approved=user.is_approved,
    )

    log_audit(
        db=db,
        action="APPROVE_USER" if user.is_approved else "REJECT_USER",
        user_id=current_user.id,
        resource_type="USER",
        resource_id=str(user.id),
        details={"approved": user.is_approved, "active": user.is_active},
    )

    return user


@router.delete("/{user_id}")
def delete_user(user_id: int, current_user: User = Depends(require_role(["admin"])), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own administrator account")

    db.delete(user)
    db.commit()

    log_audit(
        db=db,
        action="DELETE_USER",
        user_id=current_user.id,
        resource_type="USER",
        resource_id=str(user_id),
        details={"deleted_user": user.username},
    )

    return {"message": "User account deleted successfully"}


@router.get("/institutions", response_model=List[InstitutionResponse])
def get_institutions(db: Session = Depends(get_db)):
    return db.query(Institution).all()


@router.post("/institutions", response_model=InstitutionResponse, status_code=status.HTTP_201_CREATED)
def create_institution(
    data: InstitutionCreate, current_user: User = Depends(require_role(["admin"])), db: Session = Depends(get_db)
):
    existing = db.query(Institution).filter((Institution.name == data.name) | (Institution.code == data.code)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Institution name or code already exists")

    inst = Institution(**data.dict())
    db.add(inst)
    db.commit()
    db.refresh(inst)
    return inst


@router.get("/institutions/{institution_id}/departments", response_model=List[DepartmentResponse])
def get_departments(institution_id: int, db: Session = Depends(get_db)):
    return db.query(Department).filter(Department.institution_id == institution_id).all()


@router.post(
    "/institutions/{institution_id}/departments", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED
)
def create_department(
    institution_id: int,
    data: DepartmentCreate,
    current_user: User = Depends(require_role(["admin", "institution"])),
    db: Session = Depends(get_db),
):
    if current_user.role == "institution" and current_user.institution_id != institution_id:
        raise HTTPException(status_code=403, detail="Cannot manage departments of another institution")

    dept = Department(institution_id=institution_id, name=data.name, code=data.code)
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return dept
