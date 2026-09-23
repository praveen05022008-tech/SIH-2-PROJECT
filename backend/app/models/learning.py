from datetime import datetime

from app.database import Base
from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String, Text


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
    learning_mode = Column(String(50), default="online")  # online, offline, hybrid
    external_link = Column(String(500), nullable=True)
    fee_amount = Column(Float, default=0.0)  # 0 for free
    created_at = Column(DateTime, default=datetime.utcnow)
