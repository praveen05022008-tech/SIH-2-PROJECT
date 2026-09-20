from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Role(Base):
    __tablename__ = "roles"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(String(255), nullable=True)

class Institution(Base):
    __tablename__ = "institutions"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    address = Column(Text, nullable=True)
    contact_email = Column(String(100), nullable=True)
    contact_phone = Column(String(20), nullable=True)
    website = Column(String(255), nullable=True)
    verification_status = Column(String(50), default="verified")  # verified, pending, rejected
    created_at = Column(DateTime, default=datetime.utcnow)
    
    departments = relationship("Department", back_populates="institution", cascade="all, delete-orphan")
    users = relationship("User", back_populates="institution")

class Department(Base):
    __tablename__ = "departments"
    
    id = Column(Integer, primary_key=True, index=True)
    institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=False)
    name = Column(String(255), nullable=False)
    code = Column(String(50), nullable=False)
    
    institution = relationship("Institution", back_populates="departments")

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, index=True)  # student, faculty, industry, institution, admin
    is_approved = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    institution = relationship("Institution", back_populates="users")
    student_profile = relationship("StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    faculty_profile = relationship("FacultyProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    industry_profile = relationship("IndustryProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="owner", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user")
