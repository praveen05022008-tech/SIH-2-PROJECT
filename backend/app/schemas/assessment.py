from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class AssessmentQuestionBase(BaseModel):
    question_text: str
    question_type: str = "mcq"
    options: List[str]
    marks: float = 10.0
    difficulty: str = "medium"
    explanation: Optional[str] = None


class AssessmentQuestionCreate(AssessmentQuestionBase):
    correct_answer: str


class AssessmentQuestionResponse(AssessmentQuestionBase):
    id: int
    assessment_id: int

    class Config:
        from_attributes = True


class AssessmentBase(BaseModel):
    title: str
    category_id: Optional[int] = None
    skill_id: Optional[int] = None
    assessment_type: str = "technical"
    time_limit_minutes: int = 30
    passing_marks: float = 50.0
    total_marks: float = 100.0


class AssessmentCreate(AssessmentBase):
    is_published: bool = True


class AssessmentResponse(AssessmentBase):
    id: int
    is_published: bool
    created_at: datetime
    questions: List[AssessmentQuestionResponse] = []

    class Config:
        from_attributes = True


class AssessmentSubmitRequest(BaseModel):
    # Mapping of question_id -> student's selected answer string
    answers: Dict[int, str]


class AssessmentResultResponse(BaseModel):
    id: int
    assessment_id: int
    student_id: int
    score: float
    percentage: float
    status: str
    detailed_answers: Optional[Dict[str, Any]] = None
    completed_at: datetime
    assessment_title: Optional[str] = None

    class Config:
        from_attributes = True
