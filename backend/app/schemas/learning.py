from datetime import datetime
from typing import Optional

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
    learning_mode: str = "online"  # online, offline, hybrid
    external_link: Optional[str] = None
    fee_amount: float = 0.0


class LearningProgramCreate(LearningProgramBase):
    pass


class LearningProgramResponse(LearningProgramBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
