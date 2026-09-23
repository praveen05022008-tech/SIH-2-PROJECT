from typing import List, Optional

from pydantic import BaseModel


class StudentProfileBase(BaseModel):
    full_name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    institution_id: Optional[int] = None
    department_id: Optional[int] = None
    course: Optional[str] = None
    year_of_study: Optional[int] = None
    cgpa: Optional[float] = None
    graduation_year: Optional[int] = None
    career_interests: Optional[str] = None
    preferred_roles: Optional[str] = None
    preferred_locations: Optional[str] = None
    resume_url: Optional[str] = None
    profile_photo_url: Optional[str] = None


class StudentProfileCreate(StudentProfileBase):
    pass


class StudentProfileUpdate(StudentProfileBase):
    pass


class StudentProfileResponse(StudentProfileBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True


class FacultyProfileBase(BaseModel):
    full_name: str
    phone: Optional[str] = None
    institution_id: Optional[int] = None
    department_id: Optional[int] = None
    designation: Optional[str] = None
    qualification: Optional[str] = None
    specialization: Optional[str] = None
    experience_years: Optional[int] = None
    research_areas: Optional[str] = None
    cv_url: Optional[str] = None


class FacultyProfileCreate(FacultyProfileBase):
    pass


class FacultyProfileUpdate(FacultyProfileBase):
    pass


class FacultyProfileResponse(FacultyProfileBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True


class IndustryProfileBase(BaseModel):
    company_name: str
    logo_url: Optional[str] = None
    sector: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None
    location: Optional[str] = None
    contact_person: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None


class IndustryProfileCreate(IndustryProfileBase):
    pass


class IndustryProfileUpdate(IndustryProfileBase):
    pass


class IndustryProfileResponse(IndustryProfileBase):
    id: int
    user_id: int
    verification_status: str

    class Config:
        from_attributes = True
