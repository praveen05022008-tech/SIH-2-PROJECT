from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Assessment(Base):
    __tablename__ = "assessments"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    category_id = Column(Integer, ForeignKey("skill_categories.id"), nullable=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=True)
    assessment_type = Column(String(50), default="technical")  # technical, programming, aptitude, soft_skill, communication
    time_limit_minutes = Column(Integer, default=30)
    passing_marks = Column(Float, default=50.0)
    total_marks = Column(Float, default=100.0)
    is_published = Column(Boolean, default=False)
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    questions = relationship("AssessmentQuestion", back_populates="assessment", cascade="all, delete-orphan")
    results = relationship("AssessmentResult", back_populates="assessment", cascade="all, delete-orphan")
    category = relationship("SkillCategory")
    skill = relationship("Skill")

class AssessmentQuestion(Base):
    __tablename__ = "assessment_questions"
    
    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    question_type = Column(String(50), default="mcq")  # mcq, code_output, scenario
    options_json = Column(Text, nullable=False)  # JSON array of options e.g. ["Option A", "Option B", ...]
    correct_answer = Column(String(255), nullable=False)
    marks = Column(Float, default=10.0)
    difficulty = Column(String(50), default="medium")  # easy, medium, hard
    explanation = Column(Text, nullable=True)
    
    assessment = relationship("Assessment", back_populates="questions")

class AssessmentResult(Base):
    __tablename__ = "assessment_results"
    
    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("student_profiles.id"), nullable=False)
    score = Column(Float, nullable=False)
    percentage = Column(Float, nullable=False)
    status = Column(String(50), default="passed")  # passed, failed
    detailed_answers_json = Column(Text, nullable=True)  # JSON representation of answers given
    completed_at = Column(DateTime, default=datetime.utcnow)
    
    assessment = relationship("Assessment", back_populates="results")
    student = relationship("StudentProfile", back_populates="assessment_results")
