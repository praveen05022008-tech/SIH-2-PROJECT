from app.database import Base
from app.models.assessment import Assessment, AssessmentQuestion, AssessmentResult
from app.models.audit import AuditLog
from app.models.collaboration import Collaboration
from app.models.document import Document, DocumentVerification
from app.models.internship import Internship, InternshipTask, MentorFeedback
from app.models.issue import IssueReport
from app.models.learning import LearningProgram
from app.models.notification import Notification
from app.models.opportunity import Application, Opportunity, OpportunitySkill
from app.models.portfolio import Certification, Portfolio, Project
from app.models.profile import FacultyProfile, IndustryProfile, StudentProfile
from app.models.skill import CareerRole, CareerRoleSkill, Skill, SkillCategory, StudentSkill
from app.models.user import Department, Institution, Role, User

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
    "AuditLog",
    "IssueReport",
]
