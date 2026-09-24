from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class LearningProgramBase(BaseModel):
    title: str
    provider_name: str
    provider_type: str = "industry"  # industry, institution, platform
    program_type: str  # course, workshop, fdp, bootcamp, certification
    description: str
    skills_covered: Optional[str] = None
    duration: Optional[str] = None
    eligibility: Optional[str] = None
    registration_deadline: Optional[datetime] = None
    certificate_available: bool = True
    learning_mode: str = "online"  # online, offline, hybrid, self_paced
    external_link: Optional[str] = None
    fee_amount: float = 0.0
    modules_json: Optional[str] = None
    quiz_json: Optional[str] = None
    passing_score: float = 60.0
    auto_certify: bool = True


class LearningProgramCreate(LearningProgramBase):
    pass


class LearningProgramUpdate(BaseModel):
    title: Optional[str] = None
    provider_name: Optional[str] = None
    program_type: Optional[str] = None
    description: Optional[str] = None
    skills_covered: Optional[str] = None
    duration: Optional[str] = None
    eligibility: Optional[str] = None
    learning_mode: Optional[str] = None
    external_link: Optional[str] = None
    fee_amount: Optional[float] = None
    modules_json: Optional[str] = None
    quiz_json: Optional[str] = None
    passing_score: Optional[float] = None
    auto_certify: Optional[bool] = None


class CertificateResponse(BaseModel):
    id: int
    certificate_number: str
    program_id: Optional[int]
    student_id: int
    student_name: str
    student_email: str
    program_title: str
    program_type: str
    issuer_name: str
    issue_date: datetime
    skills: Optional[str]
    verification_hash: str
    status: str

    class Config:
        from_attributes = True


class ProgramEnrollmentResponse(BaseModel):
    id: int
    program_id: int
    student_id: int
    enrolled_at: datetime
    status: str
    progress_percent: float
    completed_modules: Optional[str]
    completed_at: Optional[datetime]
    quiz_score: Optional[float] = None
    quiz_passed: bool = False
    quiz_attempts: int = 0
    certificate_issued: bool
    certificate_id: Optional[int]
    program: Optional[LearningProgramBase] = None
    certificate: Optional[CertificateResponse] = None

    class Config:
        from_attributes = True


class StudentEnrollmentDetail(BaseModel):
    enrollment_id: int
    student_id: int
    student_name: str
    student_email: str
    student_department: Optional[str] = None
    student_institution: Optional[str] = None
    enrolled_at: datetime
    status: str
    progress_percent: float
    completed_modules: Optional[str]
    completed_at: Optional[datetime]
    quiz_score: Optional[float] = None
    quiz_passed: bool = False
    quiz_attempts: int = 0
    certificate_issued: bool
    certificate_number: Optional[str] = None
    verification_hash: Optional[str] = None


class LearningProgramResponse(LearningProgramBase):
    id: int
    created_by_user_id: Optional[int] = None
    created_at: datetime
    enrollments_count: Optional[int] = 0
    completed_count: Optional[int] = 0
    is_enrolled: Optional[bool] = False
    my_progress: Optional[float] = None
    my_status: Optional[str] = None
    my_quiz_score: Optional[float] = None
    my_quiz_passed: Optional[bool] = False
    my_certificate_id: Optional[int] = None
    my_verification_hash: Optional[str] = None

    class Config:
        from_attributes = True


class UpdateProgressRequest(BaseModel):
    module_id: int
    completed: bool = True


class SubmitQuizRequest(BaseModel):
    answers: Dict[str, int]  # { "1": 0, "2": 3 } mapping question_id -> selected_option_index


class SubmitQuizResponse(BaseModel):
    score_percent: float
    total_questions: int
    correct_count: int
    passed: bool
    passing_threshold: float
    attempts: int
    certificate_issued: bool
    certificate: Optional[CertificateResponse] = None
    detailed_results: List[Dict[str, Any]]


class IssueCertificateRequest(BaseModel):
    enrollment_id: int


class AIGenerateSyllabusRequest(BaseModel):
    topic: str
    program_type: str = "course"
    duration: str = "4 Weeks"
    skill_level: str = "Intermediate"
