from typing import List, Optional

from app.core.audit import log_audit
from app.core.deps import get_current_user
from app.database import get_db
from app.models.portfolio import Certification, Portfolio, Project
from app.models.profile import StudentProfile
from app.models.user import User
from app.schemas.portfolio import (
    CertificationCreate,
    CertificationResponse,
    PortfolioResponse,
    PortfolioUpdate,
    ProjectCreate,
    ProjectResponse,
)
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

router = APIRouter(prefix="/portfolios", tags=["Digital Portfolios"])


@router.get("/my-portfolio", response_model=PortfolioResponse)
def get_my_portfolio(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    student = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=400, detail="Only students have digital portfolios")

    p = db.query(Portfolio).filter(Portfolio.student_id == student.id).first()
    if not p:
        p = Portfolio(student_id=student.id)
        db.add(p)
        db.commit()
        db.refresh(p)

    return p


@router.put("/my-portfolio", response_model=PortfolioResponse)
def update_my_portfolio(
    data: PortfolioUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    student = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=400, detail="Only students have digital portfolios")

    p = db.query(Portfolio).filter(Portfolio.student_id == student.id).first()
    if not p:
        p = Portfolio(student_id=student.id, **data.dict())
        db.add(p)
    else:
        for k, v in data.dict(exclude_unset=True).items():
            setattr(p, k, v)

    db.commit()
    db.refresh(p)
    return p


@router.post("/projects", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def add_project(data: ProjectCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    student = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=400, detail="Only students can add projects")

    p = db.query(Portfolio).filter(Portfolio.student_id == student.id).first()
    if not p:
        p = Portfolio(student_id=student.id)
        db.add(p)
        db.commit()
        db.refresh(p)

    project = Project(portfolio_id=p.id, **data.dict())
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.delete("/projects/{project_id}")
def delete_project(project_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    student = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not student or not student.portfolio:
        raise HTTPException(status_code=400, detail="Not authorized")

    project = db.query(Project).filter(Project.id == project_id, Project.portfolio_id == student.portfolio.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    db.delete(project)
    db.commit()
    return {"message": "Project deleted successfully"}


@router.post("/certifications", response_model=CertificationResponse, status_code=status.HTTP_201_CREATED)
def add_certification(
    data: CertificationCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    student = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=400, detail="Only students can add certifications")

    p = db.query(Portfolio).filter(Portfolio.student_id == student.id).first()
    if not p:
        p = Portfolio(student_id=student.id)
        db.add(p)
        db.commit()
        db.refresh(p)

    cert = Certification(portfolio_id=p.id, **data.dict(), verification_status="pending")
    db.add(cert)
    db.commit()
    db.refresh(cert)
    return cert


@router.get("/public/{identifier}")
def get_public_verified_portfolio(identifier: str, db: Session = Depends(get_db)):
    """
    Public Verified Employability Portfolio (Section 14 of Specification):
    Allows external recruiters and partners to verify student credentials, verified skills, and projects.
    """
    user = None
    if identifier.isdigit():
        user = db.query(User).filter(User.id == int(identifier)).first()

    if not user:
        user = db.query(User).filter(User.username.ilike(identifier)).first()

    if not user or not user.student_profile:
        raise HTTPException(status_code=404, detail="Student digital portfolio not found")

    student = user.student_profile
    portfolio = db.query(Portfolio).filter(Portfolio.student_id == student.id).first()

    # Extract verified skills
    verified_skills = []
    for ss in student.skills:
        if ss.skill:
            verified_skills.append(
                {
                    "skill_name": ss.skill.name,
                    "level": ss.skill_level,
                    "score": ss.score,
                    "verified": ss.verified_by_assessment,
                }
            )

    # Extract completed assessments
    assessments = []
    for ar in student.assessment_results:
        assessments.append(
            {
                "title": ar.assessment.title if ar.assessment else "Assessment",
                "score": ar.score,
                "percentage": ar.percentage,
                "status": ar.status,
                "completed_at": ar.completed_at.isoformat() if ar.completed_at else None,
            }
        )

    projects = []
    certifications = []
    bio = ""
    github_url = ""
    linkedin_url = ""
    website_url = ""

    if portfolio:
        bio = portfolio.bio or ""
        github_url = portfolio.github_url or ""
        linkedin_url = portfolio.linkedin_url or ""
        website_url = portfolio.website_url or ""
        for pr in portfolio.projects:
            projects.append(
                {
                    "title": pr.title,
                    "technologies": pr.technologies,
                    "description": pr.description,
                    "project_url": pr.project_url,
                    "repo_url": pr.repo_url,
                }
            )
        for c in portfolio.certifications:
            certifications.append(
                {
                    "title": c.title,
                    "issuing_organization": c.issuing_organization,
                    "credential_id": c.credential_id,
                    "verification_status": c.verification_status,
                }
            )

    return {
        "full_name": student.full_name,
        "username": user.username,
        "course": student.course,
        "institution_name": student.institution.name if student.institution else "Academic Institution",
        "graduation_year": student.graduation_year or 2026,
        "cgpa": student.cgpa,
        "bio": bio,
        "github_url": github_url,
        "linkedin_url": linkedin_url,
        "website_url": website_url,
        "verified_skills": verified_skills,
        "assessments": assessments,
        "projects": projects,
        "certifications": certifications,
    }
