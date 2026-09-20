from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.profile import StudentProfile
from app.models.portfolio import Portfolio, Project, Certification
from app.schemas.portfolio import (
    PortfolioResponse, PortfolioUpdate,
    ProjectCreate, ProjectResponse,
    CertificationCreate, CertificationResponse
)
from app.core.deps import get_current_user
from app.core.audit import log_audit

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
    data: PortfolioUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
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
def add_project(
    data: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
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
def delete_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not student or not student.portfolio:
        raise HTTPException(status_code=400, detail="Not authorized")
        
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.portfolio_id == student.portfolio.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    db.delete(project)
    db.commit()
    return {"message": "Project deleted successfully"}

@router.post("/certifications", response_model=CertificationResponse, status_code=status.HTTP_201_CREATED)
def add_certification(
    data: CertificationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
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
