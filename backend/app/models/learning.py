from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class LearningProgram(Base):
    __tablename__ = "learning_programs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    provider_name = Column(String(255), nullable=False)
    provider_type = Column(String(50), default="industry")  # industry, institution, platform
    program_type = Column(String(50), nullable=False, index=True)  # course, workshop, fdp, bootcamp, certification
    description = Column(Text, nullable=False)
    skills_covered = Column(Text, nullable=True)  # Comma-separated or keywords
    duration = Column(String(100), nullable=True)  # e.g. "4 Weeks", "30 Hours"
    eligibility = Column(String(255), nullable=True)
    registration_deadline = Column(DateTime, nullable=True)
    certificate_available = Column(Boolean, default=True)
    learning_mode = Column(String(50), default="online")  # online, offline, hybrid, self_paced
    external_link = Column(String(500), nullable=True)
    fee_amount = Column(Float, default=0.0)  # 0 for free
    created_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    modules_json = Column(Text, nullable=True)  # JSON array of modules
    quiz_json = Column(Text, nullable=True)  # JSON array of assessment questions
    passing_score = Column(Float, default=60.0)  # Minimum percentage required for certificate
    auto_certify = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    enrollments = relationship("ProgramEnrollment", back_populates="program", cascade="all, delete-orphan")
    certificates = relationship("Certificate", back_populates="program")


class ProgramEnrollment(Base):
    __tablename__ = "program_enrollments"

    id = Column(Integer, primary_key=True, index=True)
    program_id = Column(Integer, ForeignKey("learning_programs.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    enrolled_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String(50), default="enrolled")  # enrolled, in_progress, completed
    progress_percent = Column(Float, default=0.0)
    completed_modules = Column(Text, default="[]")  # JSON string of completed module IDs
    completed_at = Column(DateTime, nullable=True)
    quiz_score = Column(Float, nullable=True)  # Latest quiz score %
    quiz_passed = Column(Boolean, default=False)
    quiz_attempts = Column(Integer, default=0)
    certificate_issued = Column(Boolean, default=False)
    certificate_id = Column(Integer, ForeignKey("certificates.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    program = relationship("LearningProgram", back_populates="enrollments")
    student = relationship("User")
    certificate = relationship("Certificate", foreign_keys=[certificate_id])


class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True, index=True)
    certificate_number = Column(String(100), unique=True, index=True, nullable=False)
    program_id = Column(Integer, ForeignKey("learning_programs.id", ondelete="SET NULL"), nullable=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    student_name = Column(String(255), nullable=False)
    student_email = Column(String(255), nullable=False)
    program_title = Column(String(255), nullable=False)
    program_type = Column(String(50), default="course")
    issuer_name = Column(String(255), nullable=False)
    issue_date = Column(DateTime, default=datetime.utcnow)
    skills = Column(Text, nullable=True)
    verification_hash = Column(String(255), nullable=False, unique=True, index=True)
    status = Column(String(50), default="valid")  # valid, revoked

    # Relationships
    program = relationship("LearningProgram", back_populates="certificates")
    student = relationship("User")
