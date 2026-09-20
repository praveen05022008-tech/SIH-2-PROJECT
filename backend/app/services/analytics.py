from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.user import User, Institution, Department
from app.models.profile import StudentProfile, FacultyProfile, IndustryProfile
from app.models.opportunity import Opportunity, Application
from app.models.internship import Internship
from app.models.assessment import AssessmentResult
from app.models.collaboration import Collaboration
from app.models.document import Document
from app.models.audit import AuditLog

def get_admin_analytics(db: Session) -> Dict[str, Any]:
    total_students = db.query(User).filter(User.role == "student").count()
    total_faculty = db.query(User).filter(User.role == "faculty").count()
    total_industries = db.query(User).filter(User.role == "industry").count()
    total_institutions = db.query(User).filter(User.role == "institution").count()
    pending_registrations = db.query(User).filter(User.is_approved == False).count()
    
    total_internships = db.query(Opportunity).filter(Opportunity.type == "internship").count()
    total_jobs = db.query(Opportunity).filter(Opportunity.type == "job").count()
    total_applications = db.query(Application).count()
    selected_candidates = db.query(Application).filter(Application.status == "selected").count()
    
    # Recent activity from audit log
    recent_logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(10).all()
    activity = [
        {
            "id": log.id,
            "action": log.action,
            "user_id": log.user_id,
            "resource": log.resource_type,
            "timestamp": log.created_at.isoformat() if log.created_at else None
        }
        for log in recent_logs
    ]
    
    return {
        "total_students": total_students,
        "total_faculty": total_faculty,
        "total_industries": total_industries,
        "total_institutions": total_institutions,
        "pending_registrations": pending_registrations,
        "total_internships": total_internships,
        "total_jobs": total_jobs,
        "total_applications": total_applications,
        "selected_candidates": selected_candidates,
        "recent_activity": activity
    }

def get_institution_analytics(db: Session, institution_id: int) -> Dict[str, Any]:
    inst = db.query(Institution).filter(Institution.id == institution_id).first()
    inst_name = inst.name if inst else "Institution"
    
    students_count = db.query(StudentProfile).filter(StudentProfile.institution_id == institution_id).count()
    faculty_count = db.query(FacultyProfile).filter(FacultyProfile.institution_id == institution_id).count()
    
    # Student IDs belonging to this institution
    student_ids = [s.id for s in db.query(StudentProfile.id).filter(StudentProfile.institution_id == institution_id).all()]
    user_ids = [s.user_id for s in db.query(StudentProfile.user_id).filter(StudentProfile.institution_id == institution_id).all()]
    
    active_internships = 0
    total_applications = 0
    students_placed = 0
    
    if student_ids:
        active_internships = db.query(Internship).filter(
            Internship.student_id.in_(student_ids),
            Internship.status == "active"
        ).count()
        
    if user_ids:
        total_applications = db.query(Application).filter(Application.applicant_user_id.in_(user_ids)).count()
        students_placed = db.query(Application).filter(
            Application.applicant_user_id.in_(user_ids),
            Application.status == "selected"
        ).count()
        
    collab_count = db.query(Collaboration).filter(Collaboration.partner_institution_id == institution_id).count()
    
    # Department breakdown
    depts = db.query(Department).filter(Department.institution_id == institution_id).all()
    dept_breakdown = []
    for d in depts:
        count = db.query(StudentProfile).filter(StudentProfile.department_id == d.id).count()
        dept_breakdown.append({"department_name": d.name, "student_count": count})
        
    return {
        "institution_name": inst_name,
        "total_students": students_count,
        "total_faculty": faculty_count,
        "active_internships": active_internships,
        "total_applications": total_applications,
        "students_placed": students_placed,
        "collaboration_count": collab_count,
        "department_breakdown": dept_breakdown,
        "top_skills": []
    }

def get_industry_analytics(db: Session, user_id: int) -> Dict[str, Any]:
    profile = db.query(IndustryProfile).filter(IndustryProfile.user_id == user_id).first()
    company_name = profile.company_name if profile else "Company"
    
    opportunities = db.query(Opportunity).filter(Opportunity.posted_by_user_id == user_id).all()
    opp_ids = [o.id for o in opportunities]
    
    active_opps = len([o for o in opportunities if o.status == "open"])
    
    applications_received = 0
    shortlisted = 0
    selected = 0
    
    if opp_ids:
        apps = db.query(Application).filter(Application.opportunity_id.in_(opp_ids)).all()
        applications_received = len(apps)
        shortlisted = len([a for a in apps if a.status == "shortlisted"])
        selected = len([a for a in apps if a.status == "selected"])
        
    active_interns = 0
    if profile:
        active_interns = db.query(Internship).filter(
            Internship.industry_id == profile.id,
            Internship.status == "active"
        ).count()
        
    breakdown = [
        {
            "id": o.id,
            "title": o.title,
            "type": o.type,
            "status": o.status,
            "openings": o.openings_count
        }
        for o in opportunities[:10]
    ]
    
    return {
        "company_name": company_name,
        "active_opportunities": active_opps,
        "applications_received": applications_received,
        "shortlisted_candidates": shortlisted,
        "selected_candidates": selected,
        "active_interns": active_interns,
        "opportunities_breakdown": breakdown
    }

def get_student_analytics(db: Session, user_id: int) -> Dict[str, Any]:
    student = db.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()
    if not student:
        return {
            "assessed_skills_count": 0,
            "average_assessment_score": 0.0,
            "applications_submitted": 0,
            "applications_shortlisted": 0,
            "active_internships": 0,
            "completed_internships": 0,
            "verified_documents_count": 0
        }
        
    results = db.query(AssessmentResult).filter(AssessmentResult.student_id == student.id).all()
    assessed_count = len(results)
    avg_score = round(sum([r.percentage for r in results]) / assessed_count, 1) if assessed_count > 0 else 0.0
    
    apps = db.query(Application).filter(Application.applicant_user_id == user_id).all()
    submitted = len(apps)
    shortlisted = len([a for a in apps if a.status in ["shortlisted", "selected"]])
    
    internships = db.query(Internship).filter(Internship.student_id == student.id).all()
    active_interns = len([i for i in internships if i.status == "active"])
    completed_interns = len([i for i in internships if i.status == "completed"])
    
    verified_docs = db.query(Document).filter(
        Document.owner_user_id == user_id
    ).join(Document.verifications).filter(
        Document.verifications.any(verification_status="verified")
    ).count()
    
    return {
        "assessed_skills_count": assessed_count,
        "average_assessment_score": avg_score,
        "applications_submitted": submitted,
        "applications_shortlisted": shortlisted,
        "active_internships": active_interns,
        "completed_internships": completed_interns,
        "verified_documents_count": verified_docs
    }
