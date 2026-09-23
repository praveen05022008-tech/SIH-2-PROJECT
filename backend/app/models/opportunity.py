from datetime import datetime

from app.database import Base
from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import relationship


class Opportunity(Base):
    __tablename__ = "opportunities"

    id = Column(Integer, primary_key=True, index=True)
    posted_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    company_name = Column(String(255), nullable=False)
    type = Column(
        String(50), nullable=False, index=True
    )  # internship, job, apprenticeship, live_project, faculty_internship, industrial_training
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=False)
    responsibilities = Column(Text, nullable=True)
    required_qualifications = Column(String(255), nullable=True)
    eligibility_cgpa = Column(Float, default=0.0)
    eligibility_year = Column(Integer, nullable=True)
    location = Column(String(255), nullable=False)
    work_mode = Column(String(50), default="remote")  # remote, on-site, hybrid
    duration = Column(String(100), nullable=True)  # e.g. "3 months", "6 months", "Full-time"
    stipend_salary = Column(String(100), nullable=True)  # e.g. "Rs. 25,000 / month", "12 LPA"
    openings_count = Column(Integer, default=1)
    deadline = Column(DateTime, nullable=True)
    status = Column(String(50), default="open", index=True)  # open, closed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    poster = relationship("User")
    skills = relationship("OpportunitySkill", back_populates="opportunity", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="opportunity", cascade="all, delete-orphan")


class OpportunitySkill(Base):
    __tablename__ = "opportunity_skills"

    id = Column(Integer, primary_key=True, index=True)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    minimum_level = Column(String(50), default="intermediate")  # beginner, intermediate, advanced, expert
    is_mandatory = Column(Boolean, default=True)

    opportunity = relationship("Opportunity", back_populates="skills")
    skill = relationship("Skill", back_populates="opportunity_skills")


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id"), nullable=False)
    applicant_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    applicant_role = Column(String(50), default="student")  # student, faculty
    status = Column(
        String(50), default="applied", index=True
    )  # applied, under_review, shortlisted, selected, rejected, in_progress, completed
    resume_url = Column(String(500), nullable=True)
    cover_note = Column(Text, nullable=True)
    reviewer_notes = Column(Text, nullable=True)
    match_score = Column(Float, nullable=True)
    applied_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (UniqueConstraint("opportunity_id", "applicant_user_id", name="uq_user_opportunity_application"),)

    opportunity = relationship("Opportunity", back_populates="applications")
    applicant = relationship("User")
    internship = relationship("Internship", back_populates="application", uselist=False)
