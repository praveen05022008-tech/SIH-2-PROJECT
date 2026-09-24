from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class OpportunitySkillBase(BaseModel):
    skill_id: int
    minimum_level: str = "intermediate"
    is_mandatory: bool = True


class OpportunitySkillResponse(OpportunitySkillBase):
    id: int
    skill_name: Optional[str] = None

    class Config:
        from_attributes = True


class OpportunityBase(BaseModel):
    title: str
    company_name: str
    type: str  # internship, job, apprenticeship, live_project, faculty_internship, industrial_training
    description: str
    responsibilities: Optional[str] = None
    required_qualifications: Optional[str] = None
    eligibility_cgpa: Optional[float] = 0.0
    eligibility_year: Optional[int] = None
    target_departments: Optional[str] = None
    min_experience_years: Optional[int] = None
    academic_qualification: Optional[str] = None
    location: str
    work_mode: str = "remote"  # remote, on-site, hybrid
    duration: Optional[str] = None
    stipend_salary: Optional[str] = None
    openings_count: Optional[int] = 1
    deadline: Optional[datetime] = None


class OpportunityCreate(OpportunityBase):
    skills: List[OpportunitySkillBase] = []


class OpportunityUpdate(BaseModel):
    title: Optional[str] = None
    company_name: Optional[str] = None
    type: Optional[str] = None
    description: Optional[str] = None
    responsibilities: Optional[str] = None
    required_qualifications: Optional[str] = None
    eligibility_cgpa: Optional[float] = None
    eligibility_year: Optional[int] = None
    target_departments: Optional[str] = None
    min_experience_years: Optional[int] = None
    academic_qualification: Optional[str] = None
    location: Optional[str] = None
    work_mode: Optional[str] = None
    duration: Optional[str] = None
    stipend_salary: Optional[str] = None
    openings_count: Optional[int] = None
    deadline: Optional[datetime] = None
    status: Optional[str] = None
    skills: Optional[List[OpportunitySkillBase]] = None


class OpportunityResponse(OpportunityBase):
    id: int
    posted_by_user_id: int
    status: str
    created_at: datetime
    skills: List[OpportunitySkillResponse] = []
    applications_count: Optional[int] = 0
    match_score: Optional[float] = None
    match_reasons: Optional[List[str]] = None
    missing_skills: Optional[List[str]] = None
    is_eligible: Optional[bool] = None
    recommended_programs: Optional[List[dict]] = None

    class Config:
        from_attributes = True
