from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.audit import log_audit
from app.core.deps import get_current_user
from app.database import get_db
from app.models.profile import FacultyProfile, IndustryProfile, StudentProfile
from app.models.user import User
from app.schemas.profile import (
    FacultyProfileResponse,
    FacultyProfileUpdate,
    IndustryProfileResponse,
    IndustryProfileUpdate,
    StudentProfileResponse,
    StudentProfileUpdate,
)

router = APIRouter(prefix="/profiles", tags=["Profiles"])


@router.get("/student", response_model=StudentProfileResponse)
def get_student_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return profile


@router.put("/student", response_model=StudentProfileResponse)
def update_student_profile(
    data: StudentProfileUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        profile = StudentProfile(user_id=current_user.id, **data.dict())
        db.add(profile)
    else:
        for k, v in data.dict(exclude_unset=True).items():
            setattr(profile, k, v)

    db.commit()
    db.refresh(profile)
    log_audit(db=db, action="UPDATE_PROFILE", user_id=current_user.id, resource_type="STUDENT_PROFILE")
    return profile


@router.get("/faculty", response_model=FacultyProfileResponse)
def get_faculty_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(FacultyProfile).filter(FacultyProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Faculty profile not found")
    return profile


@router.put("/faculty", response_model=FacultyProfileResponse)
def update_faculty_profile(
    data: FacultyProfileUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    profile = db.query(FacultyProfile).filter(FacultyProfile.user_id == current_user.id).first()
    if not profile:
        profile = FacultyProfile(user_id=current_user.id, **data.dict())
        db.add(profile)
    else:
        for k, v in data.dict(exclude_unset=True).items():
            setattr(profile, k, v)

    db.commit()
    db.refresh(profile)
    log_audit(db=db, action="UPDATE_PROFILE", user_id=current_user.id, resource_type="FACULTY_PROFILE")
    return profile


@router.get("/industry", response_model=IndustryProfileResponse)
def get_industry_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(IndustryProfile).filter(IndustryProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Industry profile not found")
    return profile


@router.put("/industry", response_model=IndustryProfileResponse)
def update_industry_profile(
    data: IndustryProfileUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    profile = db.query(IndustryProfile).filter(IndustryProfile.user_id == current_user.id).first()
    if not profile:
        profile = IndustryProfile(user_id=current_user.id, **data.dict())
        db.add(profile)
    else:
        for k, v in data.dict(exclude_unset=True).items():
            setattr(profile, k, v)

    db.commit()
    db.refresh(profile)
    log_audit(db=db, action="UPDATE_PROFILE", user_id=current_user.id, resource_type="INDUSTRY_PROFILE")
    return profile
