from typing import Any, Dict, List, Optional

from typing_extensions import TypedDict


class SkillGapState(TypedDict):
    student_id: Optional[int]
    student_name: str
    target_role: str
    career_interests: Optional[str]
    current_skills: List[Dict[str, Any]]
    ontology_requirements: List[Dict[str, Any]]
    matching_skills: List[Dict[str, Any]]
    weak_skills: List[Dict[str, Any]]
    missing_skills: List[Dict[str, Any]]
    readiness_percentage: float
    recommended_programs: List[Dict[str, Any]]
    ai_summary: str
    four_week_roadmap: List[Dict[str, Any]]
    industry_advice: str
    error: Optional[str]


class CandidateMatchState(TypedDict):
    opportunity_id: int
    opportunity_data: Dict[str, Any]
    candidate_id: int
    candidate_profile: Dict[str, Any]
    deterministic_score: float
    eligibility_passed: bool
    match_reasons: List[str]
    missing_skills: List[str]
    ai_verdict: str
    key_strengths: List[str]
    suggested_interview_questions: List[str]
    error: Optional[str]
