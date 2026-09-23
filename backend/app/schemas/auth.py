from typing import Optional

from pydantic import BaseModel, EmailStr


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: int
    username: str
    is_approved: bool


class LoginRequest(BaseModel):
    username_or_email: str
    password: str


class RegisterRequest(BaseModel):
    email: EmailStr
    username: str
    password: str
    role: str  # student, faculty, industry, institution
    full_name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    institution_id: Optional[int] = None
    institution_name: Optional[str] = None
    department_id: Optional[int] = None
    department_name: Optional[str] = None
    # Role-specific fields
    company_name: Optional[str] = None
    sector: Optional[str] = None
    designation: Optional[str] = None
    course: Optional[str] = None
    year_of_study: Optional[int] = None
