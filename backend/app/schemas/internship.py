from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None

class TaskSubmit(BaseModel):
    submission_url: str
    submission_notes: Optional[str] = None

class TaskReview(BaseModel):
    grade: str
    feedback: Optional[str] = None
    status: str = "reviewed"

class TaskResponse(BaseModel):
    id: int
    internship_id: int
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    status: str
    submission_url: Optional[str] = None
    submission_notes: Optional[str] = None
    grade: Optional[str] = None
    feedback: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

class MentorFeedbackCreate(BaseModel):
    feedback_text: str
    rating_technical: float = 4.0
    rating_soft_skills: float = 4.0
    rating_punctuality: float = 4.0

class MentorFeedbackResponse(BaseModel):
    id: int
    internship_id: int
    feedback_text: str
    rating_technical: float
    rating_soft_skills: float
    rating_punctuality: float
    created_at: datetime
    class Config:
        from_attributes = True

class InternshipResponse(BaseModel):
    id: int
    application_id: int
    student_id: int
    industry_id: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    mentor_name: Optional[str] = None
    mentor_email: Optional[str] = None
    status: str
    final_grade: Optional[str] = None
    completion_certificate_url: Optional[str] = None
    created_at: datetime
    opportunity_title: Optional[str] = None
    company_name: Optional[str] = None
    student_name: Optional[str] = None
    tasks: List[TaskResponse] = []
    feedbacks: List[MentorFeedbackResponse] = []
    class Config:
        from_attributes = True
