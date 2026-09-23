from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import foreign, relationship

from app.database import Base


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    address = Column(Text, nullable=True)
    institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    course = Column(String(100), nullable=True)
    year_of_study = Column(Integer, nullable=True)  # 1, 2, 3, 4
    cgpa = Column(Float, nullable=True)
    graduation_year = Column(Integer, nullable=True)
    career_interests = Column(Text, nullable=True)  # JSON or comma-separated
    preferred_roles = Column(Text, nullable=True)
    preferred_locations = Column(Text, nullable=True)
    skills = Column(Text, nullable=True)  # Extracted / technical skills mapped from resume
    resume_url = Column(String(500), nullable=True)
    profile_photo_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="student_profile")
    institution = relationship("Institution")
    department = relationship("Department")
    student_skills = relationship(
        "StudentSkill",
        primaryjoin="StudentProfile.id == foreign(StudentSkill.student_id)",
        back_populates="student",
        cascade="all, delete-orphan",
    )
    assessment_results = relationship("AssessmentResult", back_populates="student", cascade="all, delete-orphan")
    portfolio = relationship("Portfolio", back_populates="student", uselist=False, cascade="all, delete-orphan")


class FacultyProfile(Base):
    __tablename__ = "faculty_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    designation = Column(String(100), nullable=True)  # Professor, Associate Professor, Asst Professor
    qualification = Column(String(100), nullable=True)  # Ph.D, M.Tech, M.S.
    specialization = Column(String(255), nullable=True)
    experience_years = Column(Integer, nullable=True)
    research_areas = Column(Text, nullable=True)
    cv_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="faculty_profile")
    institution = relationship("Institution")
    department = relationship("Department")


class IndustryProfile(Base):
    __tablename__ = "industry_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    company_name = Column(String(255), nullable=False, index=True)
    logo_url = Column(String(500), nullable=True)
    sector = Column(String(100), nullable=True, index=True)  # Healthcare, Tech, Pharma, Manufacturing
    description = Column(Text, nullable=True)
    website = Column(String(255), nullable=True)
    location = Column(String(255), nullable=True)
    contact_person = Column(String(255), nullable=True)
    contact_email = Column(String(100), nullable=True)
    contact_phone = Column(String(20), nullable=True)
    verification_status = Column(String(50), default="pending")  # pending, verified, rejected
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="industry_profile")
