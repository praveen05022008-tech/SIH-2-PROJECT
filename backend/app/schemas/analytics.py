from typing import Any, Dict, List, Optional

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
    placement_rate: float = 0.0
    average_readiness_score: float = 0.0
    total_eligible_students: int = 0
    readiness_distribution: List[Dict[str, Any]] = []
    department_breakdown: List[Dict[str, Any]] = []
    department_metrics: List[Dict[str, Any]] = []
    top_hiring_companies: List[Dict[str, Any]] = []
    top_skills: List[Dict[str, Any]] = []
    in_demand_skills: List[Dict[str, Any]] = []
    placements_timeline: List[Dict[str, Any]] = []
    placement_records: List[Dict[str, Any]] = []


class IndustryAnalyticsResponse(BaseModel):
    company_name: str
    active_opportunities: int
    applications_received: int
    shortlisted_candidates: int
    selected_candidates: int
    active_interns: int
    placement_rate: float = 0.0
    average_time_to_hire_days: float = 0.0
    average_match_score: float = 0.0
    recruitment_funnel: List[Dict[str, Any]] = []
    pipeline_distribution: List[Dict[str, Any]] = []
    skill_demand_trends: List[Dict[str, Any]] = []
    institution_sourcing: List[Dict[str, Any]] = []
    applications_time_trend: List[Dict[str, Any]] = []
    opportunities_breakdown: List[Dict[str, Any]] = []


class StudentAnalyticsResponse(BaseModel):
    assessed_skills_count: int
    average_assessment_score: float
    applications_submitted: int
    applications_shortlisted: int
    active_internships: int
    completed_internships: int
    verified_documents_count: int
