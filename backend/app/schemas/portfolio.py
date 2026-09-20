from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None
    technologies: Optional[str] = None
    project_url: Optional[str] = None
    repo_url: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: int
    portfolio_id: int
    created_at: datetime
    class Config:
        from_attributes = True

class CertificationBase(BaseModel):
    title: str
    issuing_organization: str
    issue_date: Optional[datetime] = None
    credential_id: Optional[str] = None
    credential_url: Optional[str] = None
    document_id: Optional[int] = None

class CertificationCreate(CertificationBase):
    pass

class CertificationResponse(CertificationBase):
    id: int
    portfolio_id: int
    verification_status: str
    created_at: datetime
    class Config:
        from_attributes = True

class PortfolioBase(BaseModel):
    bio: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    website_url: Optional[str] = None
    is_public: bool = True

class PortfolioUpdate(PortfolioBase):
    pass

class PortfolioResponse(PortfolioBase):
    id: int
    student_id: int
    projects: List[ProjectResponse] = []
    certifications: List[CertificationResponse] = []
    class Config:
        from_attributes = True
