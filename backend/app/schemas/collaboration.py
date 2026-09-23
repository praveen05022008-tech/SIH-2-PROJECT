from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class CollaborationBase(BaseModel):
    partner_institution_id: Optional[int] = None
    partner_industry_id: Optional[int] = None
    collaboration_type: (
        str  # live_project, fdp, research, consultancy, workshop, guest_lecture, challenge, industrial_visit
    )
    title: str
    description: str
    terms: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class CollaborationCreate(CollaborationBase):
    pass


class CollaborationStatusUpdate(BaseModel):
    status: str  # draft, proposed, accepted, in_progress, completed, declined


class CollaborationResponse(CollaborationBase):
    id: int
    initiator_user_id: int
    status: str
    created_at: datetime
    updated_at: datetime
    initiator_name: Optional[str] = None
    partner_institution_name: Optional[str] = None
    partner_company_name: Optional[str] = None

    class Config:
        from_attributes = True
