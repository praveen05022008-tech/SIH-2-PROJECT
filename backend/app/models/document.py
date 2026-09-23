from datetime import datetime

from app.database import Base
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    owner_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    document_type = Column(
        String(50), nullable=False, index=True
    )  # resume, certificate, academic_record, internship_report, mou, other
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, default=0)
    mime_type = Column(String(100), default="application/pdf")
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="documents")
    verifications = relationship("DocumentVerification", back_populates="document", cascade="all, delete-orphan")


class DocumentVerification(Base):
    __tablename__ = "document_verifications"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    verified_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    verification_status = Column(String(50), default="pending", index=True)  # pending, verified, rejected
    remarks = Column(Text, nullable=True)
    verified_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="verifications")
    verifier = relationship("User")
