from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.schemas.opportunity import OpportunityResponse


class ApplicationCreate(BaseModel):
    opportunity_id: int
    resume_url: Optional[str] = None
    cover_note: Optional[str] = None
    noc_document_url: Optional[str] = None


class ApplicationStatusUpdate(BaseModel):
    status: str  # applied, under_review, shortlisted, selected, rejected, in_progress, completed
    reviewer_notes: Optional[str] = None


class ApplicantInfo(BaseModel):
    user_id: int
    full_name: str
    email: str
    applicant_role: Optional[str] = "student"
    course: Optional[str] = None
    cgpa: Optional[float] = None
    institution_name: Optional[str] = None
    department_name: Optional[str] = None
    designation: Optional[str] = None
    qualification: Optional[str] = None
    specialization: Optional[str] = None
    experience_years: Optional[int] = None
    research_areas: Optional[str] = None
    cv_url: Optional[str] = None
    noc_document_url: Optional[str] = None


class ApplicationResponse(BaseModel):
    id: int
    opportunity_id: int
    applicant_user_id: int
    applicant_role: str
    status: str
    resume_url: Optional[str] = None
    noc_document_url: Optional[str] = None
    cover_note: Optional[str] = None
    reviewer_notes: Optional[str] = None
    match_score: Optional[float] = None
    applied_at: datetime
    updated_at: datetime
    opportunity: Optional[OpportunityResponse] = None
    applicant: Optional[ApplicantInfo] = None

    class Config:
        from_attributes = True
