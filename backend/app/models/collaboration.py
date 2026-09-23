from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class Collaboration(Base):
    __tablename__ = "collaborations"

    id = Column(Integer, primary_key=True, index=True)
    initiator_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    partner_institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=True)
    partner_industry_id = Column(Integer, ForeignKey("industry_profiles.id"), nullable=True)
    collaboration_type = Column(
        String(50), nullable=False, index=True
    )  # live_project, fdp, research, consultancy, workshop, guest_lecture, challenge, industrial_visit
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(
        String(50), default="proposed", index=True
    )  # draft, proposed, accepted, in_progress, completed, declined
    terms = Column(Text, nullable=True)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    initiator = relationship("User")
    partner_institution = relationship("Institution")
    partner_industry = relationship("IndustryProfile")
