from app.database import Base
from app.models.user import Role, Institution, Department, User
from app.models.profile import StudentProfile, FacultyProfile, IndustryProfile
from app.models.skill import SkillCategory, Skill, StudentSkill, CareerRole, CareerRoleSkill
from app.models.assessment import Assessment, AssessmentQuestion, AssessmentResult
from app.models.opportunity import Opportunity, OpportunitySkill, Application
from app.models.internship import Internship, InternshipTask, MentorFeedback
from app.models.portfolio import Portfolio, Project, Certification
from app.models.collaboration import Collaboration
from app.models.learning import LearningProgram
from app.models.document import Document, DocumentVerification
from app.models.notification import Notification
from app.models.audit import AuditLog

__all__ = [
    "Base",
    "Role",
    "Institution",
    "Department",
    "User",
    "StudentProfile",
    "FacultyProfile",
    "IndustryProfile",
    "SkillCategory",
    "Skill",
    "StudentSkill",
    "CareerRole",
    "CareerRoleSkill",
    "Assessment",
    "AssessmentQuestion",
    "AssessmentResult",
    "Opportunity",
    "OpportunitySkill",
    "Application",
    "Internship",
    "InternshipTask",
    "MentorFeedback",
    "Portfolio",
    "Project",
    "Certification",
    "Collaboration",
    "LearningProgram",
    "Document",
    "DocumentVerification",
    "Notification",
    "AuditLog"
]
