from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class AdminAnalyticsResponse(BaseModel):
    total_students: int
    total_faculty: int
    total_industries: int
    total_institutions: int
    pending_registrations: int
    total_internships: int
    total_jobs: int
    total_applications: int
    selected_candidates: int
    recent_activity: List[Dict[str, Any]] = []

class InstitutionAnalyticsResponse(BaseModel):
    institution_name: str
    total_students: int
    total_faculty: int
    active_internships: int
    total_applications: int
    students_placed: int
    collaboration_count: int
    department_breakdown: List[Dict[str, Any]] = []
    top_skills: List[Dict[str, Any]] = []

class IndustryAnalyticsResponse(BaseModel):
    company_name: str
    active_opportunities: int
    applications_received: int
    shortlisted_candidates: int
    selected_candidates: int
    active_interns: int
    opportunities_breakdown: List[Dict[str, Any]] = []

class StudentAnalyticsResponse(BaseModel):
    assessed_skills_count: int
    average_assessment_score: float
    applications_submitted: int
    applications_shortlisted: int
    active_internships: int
    completed_internships: int
    verified_documents_count: int
