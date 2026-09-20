from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Internship(Base):
    __tablename__ = "internships"
    
    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), unique=True, nullable=False)
    student_id = Column(Integer, ForeignKey("student_profiles.id"), nullable=False)
    industry_id = Column(Integer, ForeignKey("industry_profiles.id"), nullable=True)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    mentor_name = Column(String(255), nullable=True)
    mentor_email = Column(String(100), nullable=True)
    status = Column(String(50), default="active", index=True)  # active, completed, terminated
    final_grade = Column(String(10), nullable=True)  # e.g. "A+", "A", "Pass"
    completion_certificate_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    application = relationship("Application", back_populates="internship")
    student = relationship("StudentProfile")
    industry = relationship("IndustryProfile")
    tasks = relationship("InternshipTask", back_populates="internship", cascade="all, delete-orphan")
    feedbacks = relationship("MentorFeedback", back_populates="internship", cascade="all, delete-orphan")

class InternshipTask(Base):
    __tablename__ = "internship_tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    internship_id = Column(Integer, ForeignKey("internships.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    due_date = Column(DateTime, nullable=True)
    status = Column(String(50), default="pending")  # pending, submitted, reviewed
    submission_url = Column(String(500), nullable=True)
    submission_notes = Column(Text, nullable=True)
    grade = Column(String(20), nullable=True)
    feedback = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    internship = relationship("Internship", back_populates="tasks")

class MentorFeedback(Base):
    __tablename__ = "mentor_feedback"
    
    id = Column(Integer, primary_key=True, index=True)
    internship_id = Column(Integer, ForeignKey("internships.id"), nullable=False)
    mentor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    feedback_text = Column(Text, nullable=False)
    rating_technical = Column(Float, default=4.0)  # 1-5 scale
    rating_soft_skills = Column(Float, default=4.0)
    rating_punctuality = Column(Float, default=4.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    internship = relationship("Internship", back_populates="feedbacks")
    mentor = relationship("User")
