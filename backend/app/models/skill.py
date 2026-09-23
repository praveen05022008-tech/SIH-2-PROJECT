from sqlalchemy import Boolean, Column, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import foreign, relationship

from app.database import Base


class SkillCategory(Base):
    __tablename__ = "skill_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)

    skills = relationship("Skill", back_populates="category", cascade="all, delete-orphan")


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("skill_categories.id"), nullable=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    industry_relevance = Column(String(50), default="high")  # high, medium, emerging

    category = relationship("SkillCategory", back_populates="skills")
    student_skills = relationship(
        "StudentSkill",
        primaryjoin="Skill.id == foreign(StudentSkill.skill_id)",
        back_populates="skill",
    )
    opportunity_skills = relationship("OpportunitySkill", back_populates="skill")
    career_role_skills = relationship("CareerRoleSkill", back_populates="skill")


class StudentSkill(Base):
    __tablename__ = "student_skills"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, nullable=False, index=True)
    skill_id = Column(Integer, nullable=False, index=True)
    skill_level = Column(String(50), default="beginner")  # beginner, intermediate, advanced, expert
    verified_by_assessment = Column(Boolean, default=False)
    score = Column(Float, nullable=True)  # Assessment score percentage

    student = relationship(
        "StudentProfile",
        primaryjoin="foreign(StudentSkill.student_id) == StudentProfile.id",
        back_populates="student_skills",
    )
    skill = relationship(
        "Skill",
        primaryjoin="foreign(StudentSkill.skill_id) == Skill.id",
        back_populates="student_skills",
    )


class CareerRole(Base):
    __tablename__ = "career_roles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), unique=True, nullable=False, index=True)
    sector = Column(String(100), nullable=True, index=True)
    description = Column(Text, nullable=True)

    required_skills = relationship("CareerRoleSkill", back_populates="career_role", cascade="all, delete-orphan")


class CareerRoleSkill(Base):
    __tablename__ = "career_role_skills"

    id = Column(Integer, primary_key=True, index=True)
    career_role_id = Column(Integer, ForeignKey("career_roles.id"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    required_level = Column(String(50), default="intermediate")
    is_mandatory = Column(Boolean, default=True)

    career_role = relationship("CareerRole", back_populates="required_skills")
    skill = relationship("Skill", back_populates="career_role_skills")
