from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr


class DepartmentBase(BaseModel):
    name: str
    code: str


class DepartmentCreate(DepartmentBase):
    institution_id: Optional[int] = None


class DepartmentResponse(DepartmentBase):
    id: int
    institution_id: int

    class Config:
        from_attributes = True


class InstitutionBase(BaseModel):
    name: str
    code: str
    address: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    website: Optional[str] = None


class InstitutionCreate(InstitutionBase):
    pass


class InstitutionResponse(InstitutionBase):
    id: int
    verification_status: str
    created_at: datetime
    departments: List[DepartmentResponse] = []

    class Config:
        from_attributes = True


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    username: str
    role: str
    is_approved: bool
    is_active: bool
    institution_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class UserApprovalUpdate(BaseModel):
    is_approved: bool
    is_active: Optional[bool] = None
