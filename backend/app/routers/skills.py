from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_role
from app.database import get_db
from app.models.profile import StudentProfile
from app.models.skill import CareerRole, Skill, SkillCategory, StudentSkill
from app.models.user import User
from app.schemas.skill import (
    CareerRoleResponse,
    SkillCategoryCreate,
    SkillCategoryResponse,
    SkillCreate,
    SkillResponse,
    StudentSkillCreate,
    StudentSkillResponse,
)
from app.services.matching import perform_skill_gap_analysis

router = APIRouter(prefix="/skills", tags=["Skills & Career Intelligence"])


@router.get("/categories", response_model=List[SkillCategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    return db.query(SkillCategory).all()


@router.post("/categories", response_model=SkillCategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    data: SkillCategoryCreate, current_user: User = Depends(require_role(["admin"])), db: Session = Depends(get_db)
):
    existing = db.query(SkillCategory).filter(SkillCategory.name == data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")
    cat = SkillCategory(**data.dict())
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@router.get("", response_model=List[SkillResponse])
def get_skills(category_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Skill)
    if category_id:
        query = query.filter(Skill.category_id == category_id)
    return query.all()


@router.post("", response_model=SkillResponse, status_code=status.HTTP_201_CREATED)
def create_skill(
    data: SkillCreate, current_user: User = Depends(require_role(["admin"])), db: Session = Depends(get_db)
):
    existing = db.query(Skill).filter(Skill.name == data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Skill already exists")
    skill = Skill(**data.dict())
    db.add(skill)
    db.commit()
    db.refresh(skill)
    return skill


@router.get("/my-skills", response_model=List[StudentSkillResponse])
def get_my_skills(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    student = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not student:
        return []
    return db.query(StudentSkill).filter(StudentSkill.student_id == student.id).all()


@router.post("/my-skills", response_model=StudentSkillResponse)
def add_or_update_my_skill(
    data: StudentSkillCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    student = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=400, detail="Only students can register skills")

    existing = (
        db.query(StudentSkill)
        .filter(StudentSkill.student_id == student.id, StudentSkill.skill_id == data.skill_id)
        .first()
    )

    if existing:
        existing.skill_level = data.skill_level
        db.commit()
        db.refresh(existing)
        return existing

    new_skill = StudentSkill(
        student_id=student.id, skill_id=data.skill_id, skill_level=data.skill_level, verified_by_assessment=False
    )
    db.add(new_skill)
    db.commit()
    db.refresh(new_skill)
    return new_skill


@router.get("/career-roles", response_model=List[CareerRoleResponse])
def get_career_roles(db: Session = Depends(get_db)):
    return db.query(CareerRole).all()


@router.get("/gap-analysis/{career_role_id}")
def get_gap_analysis(
    career_role_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    student = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=400, detail="Only students can perform skill gap analysis")

    career_role = db.query(CareerRole).filter(CareerRole.id == career_role_id).first()
    if not career_role:
        raise HTTPException(status_code=404, detail="Career role not found")

    return perform_skill_gap_analysis(student=student, career_role=career_role, db=db)
