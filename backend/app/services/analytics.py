from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.assessment import AssessmentResult
from app.models.audit import AuditLog
from app.models.collaboration import Collaboration
from app.models.document import Document
from app.models.internship import Internship
from app.models.opportunity import Application, Opportunity, OpportunitySkill
from app.models.profile import FacultyProfile, IndustryProfile, StudentProfile
from app.models.user import Department, Institution, User


def get_industry_analytics(
    db: Session,
    user_id: int,
    opportunity_id: Optional[int] = None,
    period: Optional[str] = "30d",
) -> Dict[str, Any]:
    profile = db.query(IndustryProfile).filter(IndustryProfile.user_id == user_id).first()
    user_obj = db.query(User).filter(User.id == user_id).first()
    company_name = (
        (profile.company_name if profile and profile.company_name else None)
        or (user_obj.organization_name if user_obj and user_obj.organization_name else None)
        or (user_obj.full_name if user_obj and user_obj.full_name else "Organization")
    )

    # Base opportunities query
    opp_query = db.query(Opportunity).filter(Opportunity.posted_by_user_id == user_id)
    if opportunity_id:
        opp_query = opp_query.filter(Opportunity.id == opportunity_id)
    all_opportunities = opp_query.all()
    opp_ids = [o.id for o in all_opportunities]

    active_opps = len([o for o in all_opportunities if o.status == "open"])

    # Date threshold calculation
    now = datetime.utcnow()
    date_filter = None
    if period == "7d":
        date_filter = now - timedelta(days=7)
    elif period == "30d":
        date_filter = now - timedelta(days=30)
    elif period == "90d":
        date_filter = now - timedelta(days=90)

    all_apps = []
    if opp_ids:
        app_q = db.query(Application).filter(Application.opportunity_id.in_(opp_ids))
        if date_filter:
            app_q = app_q.filter(Application.applied_at >= date_filter)
        all_apps = app_q.all()

    applications_received = len(all_apps)
    shortlisted = 0
    selected = 0
    under_review = 0
    interview_scheduled = 0
    rejected = 0
    in_progress = 0
    completed = 0

    for a in all_apps:
        st = (a.status or "").lower()
        if st == "shortlisted":
            shortlisted += 1
        elif st == "selected":
            selected += 1
        elif st == "under_review":
            under_review += 1
        elif st == "interview_scheduled":
            interview_scheduled += 1
        elif st == "rejected":
            rejected += 1
        elif st == "in_progress":
            in_progress += 1
        elif st == "completed":
            completed += 1

    active_interns = 0
    if profile:
        active_interns = (
            db.query(Internship).filter(Internship.industry_id == profile.id, Internship.status == "active").count()
        )

    # Placement rate & match score & time to hire
    placement_rate = round((selected / applications_received * 100.0), 1) if applications_received > 0 else 0.0

    match_scores = [a.match_score for a in all_apps if a.match_score is not None]
    avg_match_score = round(sum(match_scores) / len(match_scores), 1) if match_scores else 0.0

    # Average time to hire (days from application to selection)
    hire_times = []
    for a in all_apps:
        if a.status == "selected" and a.applied_at and a.updated_at:
            delta = (a.updated_at - a.applied_at).total_seconds() / 86400.0
            if delta >= 0:
                hire_times.append(delta)
    avg_time_to_hire = round(sum(hire_times) / len(hire_times), 1) if hire_times else 0.0

    # Recruitment Funnel Stages
    screened_count = len([a for a in all_apps if (a.status or "").lower() != "applied"])
    shortlisted_funnel = len(
        [
            a
            for a in all_apps
            if (a.status or "").lower()
            in ["shortlisted", "interview_scheduled", "selected", "in_progress", "completed"]
        ]
    )
    interview_funnel = len(
        [
            a
            for a in all_apps
            if (a.status or "").lower() in ["interview_scheduled", "selected", "in_progress", "completed"]
        ]
    )
    hired_funnel = selected + completed

    def pct(num, total):
        return round((num / total * 100.0), 1) if total > 0 else 0.0

    recruitment_funnel = [
        {
            "stage_key": "applied",
            "stage_name": "Applications Received",
            "count": applications_received,
            "percentage": 100.0 if applications_received > 0 else 0.0,
            "drop_off_pct": 0.0,
        },
        {
            "stage_key": "screened",
            "stage_name": "Profile Screening & Review",
            "count": screened_count,
            "percentage": pct(screened_count, applications_received),
            "drop_off_pct": (
                round(100.0 - pct(screened_count, applications_received), 1) if applications_received > 0 else 0.0
            ),
        },
        {
            "stage_key": "shortlisted",
            "stage_name": "Shortlisted Candidates",
            "count": shortlisted_funnel,
            "percentage": pct(shortlisted_funnel, applications_received),
            "drop_off_pct": round(
                max(0.0, pct(screened_count, applications_received) - pct(shortlisted_funnel, applications_received)), 1
            ),
        },
        {
            "stage_key": "interview",
            "stage_name": "Technical / HR Interviews",
            "count": interview_funnel,
            "percentage": pct(interview_funnel, applications_received),
            "drop_off_pct": round(
                max(0.0, pct(shortlisted_funnel, applications_received) - pct(interview_funnel, applications_received)),
                1,
            ),
        },
        {
            "stage_key": "selected",
            "stage_name": "Offered & Hired",
            "count": hired_funnel,
            "percentage": pct(hired_funnel, applications_received),
            "drop_off_pct": round(
                max(0.0, pct(interview_funnel, applications_received) - pct(hired_funnel, applications_received)), 1
            ),
        },
    ]

    # Pipeline Distribution
    pipeline_distribution = [
        {
            "status": "applied",
            "label": "New / Pending",
            "count": max(0, applications_received - screened_count),
            "color": "#3B82F6",
        },
        {"status": "under_review", "label": "In Review", "count": under_review, "color": "#F59E0B"},
        {"status": "shortlisted", "label": "Shortlisted", "count": shortlisted, "color": "#8B5CF6"},
        {
            "status": "interview_scheduled",
            "label": "Interview Scheduled",
            "count": interview_scheduled,
            "color": "#06B6D4",
        },
        {"status": "selected", "label": "Selected / Placed", "count": selected, "color": "#10B981"},
        {"status": "rejected", "label": "Archived / Rejected", "count": rejected, "color": "#EF4444"},
    ]

    # Skill Demand vs. Talent Supply Gap Matrix
    required_skills_freq = {}
    for opp in all_opportunities:
        for opp_skill in opp.skills or []:
            if opp_skill.skill:
                s_name = opp_skill.skill.name.strip()
                required_skills_freq[s_name] = required_skills_freq.get(s_name, 0) + 1
        if opp.required_qualifications:
            for piece in opp.required_qualifications.split(","):
                p_clean = piece.strip()
                if 1 < len(p_clean) < 30:
                    required_skills_freq[p_clean] = required_skills_freq.get(p_clean, 0) + 1

    applicant_skills_freq = {}
    applicant_user_ids = [a.applicant_user_id for a in all_apps]
    if applicant_user_ids:
        profiles = db.query(StudentProfile).filter(StudentProfile.user_id.in_(applicant_user_ids)).all()
        for sp in profiles:
            if sp.skills:
                for s in sp.skills.split(","):
                    s_clean = s.strip()
                    if s_clean:
                        matched_key = next((k for k in required_skills_freq if k.lower() == s_clean.lower()), s_clean)
                        applicant_skills_freq[matched_key] = applicant_skills_freq.get(matched_key, 0) + 1

    skill_demand_trends = []
    for skill_name, req_cnt in sorted(required_skills_freq.items(), key=lambda x: x[1], reverse=True)[:10]:
        supp_cnt = applicant_skills_freq.get(skill_name, 0)
        coverage = (
            min(100.0, round((supp_cnt / max(1, req_cnt)) * 100.0, 1))
            if (applications_received > 0 and req_cnt > 0)
            else 0.0
        )
        status_label = (
            "Surplus Talent" if coverage >= 85 else ("Balanced Supply" if coverage >= 50 else "Talent Deficit")
        )

        skill_demand_trends.append(
            {
                "skill": skill_name,
                "postings_count": req_cnt,
                "applicant_supply_count": supp_cnt,
                "coverage_pct": coverage,
                "demand_level": "High" if req_cnt >= 3 else "Moderate",
                "gap_status": status_label,
            }
        )

    # Institutional Talent Sourcing Performance
    institution_map = {}
    if applicant_user_ids:
        st_profiles = db.query(StudentProfile).filter(StudentProfile.user_id.in_(applicant_user_ids)).all()
        for sp in st_profiles:
            inst_name = sp.institution.name if sp.institution else "Affiliated College"
            if inst_name not in institution_map:
                institution_map[inst_name] = {
                    "institution_name": inst_name,
                    "applicant_count": 0,
                    "shortlisted_count": 0,
                    "selected_count": 0,
                    "cgpas": [],
                }
            institution_map[inst_name]["applicant_count"] += 1
            if sp.cgpa:
                institution_map[inst_name]["cgpas"].append(sp.cgpa)

        for a in all_apps:
            st_prof = next((p for p in st_profiles if p.user_id == a.applicant_user_id), None)
            if st_prof:
                i_name = st_prof.institution.name if st_prof.institution else "Affiliated College"
                if i_name in institution_map:
                    if a.status in ["shortlisted", "interview_scheduled", "selected"]:
                        institution_map[i_name]["shortlisted_count"] += 1
                    if a.status == "selected":
                        institution_map[i_name]["selected_count"] += 1

    institution_sourcing = []
    for inst_name, data in sorted(institution_map.items(), key=lambda x: x[1]["applicant_count"], reverse=True)[:8]:
        avg_cgpa = round(sum(data["cgpas"]) / len(data["cgpas"]), 2) if data["cgpas"] else 0.0
        conv_rate = round((data["selected_count"] / max(1, data["applicant_count"])) * 100.0, 1)
        institution_sourcing.append(
            {
                "institution_name": inst_name,
                "applicant_count": data["applicant_count"],
                "shortlisted_count": data["shortlisted_count"],
                "selected_count": data["selected_count"],
                "conversion_rate": conv_rate,
                "avg_cgpa": avg_cgpa,
            }
        )

    # Time-series trend (applications & hires over the past 6 weeks)
    applications_time_trend = []
    for i in range(5, -1, -1):
        start_w = now - timedelta(days=(i + 1) * 7)
        end_w = now - timedelta(days=i * 7)
        w_apps = [a for a in all_apps if a.applied_at and start_w <= a.applied_at < end_w]
        w_hires = [a for a in w_apps if a.status == "selected"]
        applications_time_trend.append(
            {
                "period_label": f"Week {6 - i}",
                "date_range": f"{start_w.strftime('%b %d')} - {end_w.strftime('%b %d')}",
                "applications_count": len(w_apps),
                "hires_count": len(w_hires),
            }
        )

    opportunities_breakdown = [
        {
            "id": o.id,
            "title": o.title,
            "type": o.type,
            "status": o.status,
            "openings": o.openings_count,
            "applications_count": len([a for a in all_apps if a.opportunity_id == o.id]),
            "hired_count": len([a for a in all_apps if a.opportunity_id == o.id and a.status == "selected"]),
        }
        for o in all_opportunities[:15]
    ]

    return {
        "company_name": company_name,
        "active_opportunities": active_opps,
        "applications_received": applications_received,
        "shortlisted_candidates": shortlisted,
        "selected_candidates": selected,
        "active_interns": active_interns,
        "placement_rate": placement_rate,
        "average_time_to_hire_days": avg_time_to_hire,
        "average_match_score": avg_match_score,
        "recruitment_funnel": recruitment_funnel,
        "pipeline_distribution": pipeline_distribution,
        "skill_demand_trends": skill_demand_trends,
        "institution_sourcing": institution_sourcing,
        "applications_time_trend": applications_time_trend,
        "opportunities_breakdown": opportunities_breakdown,
    }


def get_admin_analytics(db: Session) -> Dict[str, Any]:
    total_students = db.query(User).filter(User.role == "student").count()
    total_faculty = db.query(User).filter(User.role == "faculty").count()
    total_industries = db.query(User).filter(User.role == "industry").count()
    total_institutions = db.query(User).filter(User.role == "institution").count()
    pending_registrations = db.query(User).filter(User.is_approved.is_(False)).count()

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
            "timestamp": log.created_at.isoformat() if log.created_at else None,
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
        "recent_activity": activity,
    }


def get_institution_analytics(
    db: Session,
    institution_id: int,
    department_id: Optional[int] = None,
    graduation_year: Optional[int] = None,
    period: Optional[str] = "30d",
) -> Dict[str, Any]:
    inst = db.query(Institution).filter(Institution.id == institution_id).first()
    inst_name = inst.name if inst else "Institution"

    # Base student query
    stu_q = db.query(StudentProfile).filter(StudentProfile.institution_id == institution_id)
    if department_id:
        stu_q = stu_q.filter(StudentProfile.department_id == department_id)
    if graduation_year:
        stu_q = stu_q.filter(StudentProfile.graduation_year == graduation_year)

    students = stu_q.all()
    students_count = len(students)
    student_ids = [s.id for s in students]
    user_ids = [s.user_id for s in students]

    faculty_count = db.query(FacultyProfile).filter(FacultyProfile.institution_id == institution_id).count()

    # Active internships & applications
    active_internships = 0
    total_applications = 0
    students_placed = 0
    selected_apps = []

    if student_ids:
        active_internships = (
            db.query(Internship).filter(Internship.student_id.in_(student_ids), Internship.status == "active").count()
        )

    if user_ids:
        all_inst_apps = db.query(Application).filter(Application.applicant_user_id.in_(user_ids)).all()
        total_applications = len(all_inst_apps)
        selected_apps = [a for a in all_inst_apps if (a.status or "").lower() == "selected"]
        placed_user_ids = set([a.applicant_user_id for a in selected_apps])
        students_placed = len(placed_user_ids)
    else:
        all_inst_apps = []

    collab_count = db.query(Collaboration).filter(Collaboration.partner_institution_id == institution_id).count()

    # Eligible students (Final / Pre-final years or CGPA >= 6.0)
    eligible_students = [s for s in students if (s.cgpa or 0) >= 6.0]
    total_eligible = len(eligible_students)
    placement_rate = round((students_placed / total_eligible) * 100.0, 1) if total_eligible > 0 else 0.0

    # Calculate Student Placement Readiness Index for each student
    readiness_scores = []
    ready_count = 0
    near_ready_count = 0
    needs_training_count = 0

    for s in students:
        cgpa_component = (min(10.0, float(s.cgpa or 7.0)) / 10.0) * 40.0  # 40% weight
        skill_count = len([x for x in (s.skills or "").split(",") if x.strip()])
        skill_component = min(35.0, skill_count * 7.0)  # 35% weight
        verified_component = 25.0 if s.verified_skills_count and s.verified_skills_count > 0 else 15.0  # 25% weight
        score = min(100.0, round(cgpa_component + skill_component + verified_component, 1))
        readiness_scores.append(score)

        if score >= 80.0:
            ready_count += 1
        elif score >= 60.0:
            near_ready_count += 1
        else:
            needs_training_count += 1

    avg_readiness = round(sum(readiness_scores) / len(readiness_scores), 1) if readiness_scores else 0.0
    denom_st = max(1, students_count)

    readiness_distribution = [
        {
            "tier": "Placement-Ready (80-100%)",
            "tier_key": "ready",
            "count": ready_count,
            "percentage": round((ready_count / denom_st) * 100.0, 1) if students_count > 0 else 0.0,
            "color": "#10B981",
        },
        {
            "tier": "Near-Ready (60-79%)",
            "tier_key": "near_ready",
            "count": near_ready_count,
            "percentage": round((near_ready_count / denom_st) * 100.0, 1) if students_count > 0 else 0.0,
            "color": "#F59E0B",
        },
        {
            "tier": "Needs Skill Training (<60%)",
            "tier_key": "needs_training",
            "count": needs_training_count,
            "percentage": round((needs_training_count / denom_st) * 100.0, 1) if students_count > 0 else 0.0,
            "color": "#EF4444",
        },
    ]

    # Department breakdown & metrics
    depts = db.query(Department).filter(Department.institution_id == institution_id).all()

    dept_breakdown = []
    department_metrics = []

    for d in depts:
        d_students = (
            db.query(StudentProfile)
            .filter(StudentProfile.institution_id == institution_id, StudentProfile.department_id == d.id)
            .all()
        )
        d_count = len(d_students)
        d_user_ids = [ds.user_id for ds in d_students]
        d_placed = (
            db.query(Application)
            .filter(Application.applicant_user_id.in_(d_user_ids), Application.status == "selected")
            .distinct(Application.applicant_user_id)
            .count()
            if d_user_ids
            else 0
        )
        d_cgpas = [ds.cgpa for ds in d_students if ds.cgpa]
        d_avg_cgpa = round(sum(d_cgpas) / len(d_cgpas), 2) if d_cgpas else 0.0
        d_rate = round((d_placed / max(1, d_count)) * 100.0, 1) if d_count > 0 else 0.0

        dept_breakdown.append({"department_name": d.name, "student_count": d_count})
        department_metrics.append(
            {
                "department_id": d.id,
                "department_name": d.name,
                "total_students": d_count,
                "placed_count": d_placed,
                "placement_rate": d_rate,
                "avg_cgpa": d_avg_cgpa,
                "avg_readiness": min(95.0, round(d_avg_cgpa * 9.5 + 4, 1)) if d_avg_cgpa > 0 else 0.0,
            }
        )

    # Top Hiring Companies strictly computed from actual selected applications
    company_hires = {}
    for a in selected_apps:
        opp = a.opportunity
        if opp and opp.posted_by:
            c_name = opp.posted_by.organization_name or opp.posted_by.full_name or "Industry Partner"
            if c_name not in company_hires:
                company_hires[c_name] = {
                    "company_name": c_name,
                    "hires_count": 0,
                    "domain": opp.type.title() if opp.type else "Corporate",
                    "avg_package": "Competitive",
                }
            company_hires[c_name]["hires_count"] += 1
    top_hiring_companies = list(sorted(company_hires.values(), key=lambda x: x["hires_count"], reverse=True))[:6]

    # In-Demand Skills vs. Institutional Talent Coverage computed from live market openings
    all_market_skills = {}
    active_market_opps = db.query(Opportunity).filter(Opportunity.status == "open").all()
    for mo in active_market_opps:
        for sk in mo.skills or []:
            if sk.skill:
                s_name = sk.skill.name.strip()
                all_market_skills[s_name] = all_market_skills.get(s_name, 0) + 1
        if mo.required_qualifications:
            for piece in mo.required_qualifications.split(","):
                p_clean = piece.strip()
                if 1 < len(p_clean) < 30:
                    all_market_skills[p_clean] = all_market_skills.get(p_clean, 0) + 1

    student_skills_pool = []
    for s in students:
        if s.skills:
            student_skills_pool.extend([x.strip().lower() for x in s.skills.split(",") if x.strip()])

    in_demand_skills = []
    for s_name, demand_cnt in sorted(all_market_skills.items(), key=lambda x: x[1], reverse=True)[:8]:
        has_cnt = student_skills_pool.count(s_name.lower())
        cov_pct = min(100.0, round((has_cnt / max(1, students_count)) * 100.0, 1)) if students_count > 0 else 0.0
        in_demand_skills.append(
            {
                "skill": s_name,
                "industry_demand_count": demand_cnt,
                "student_coverage_pct": cov_pct,
                "status": (
                    "Strong Alignment" if cov_pct >= 60 else ("Curriculum Gap" if cov_pct >= 30 else "High Deficit")
                ),
            }
        )

    # Timeline of placements strictly derived from application timestamps
    now = datetime.utcnow()
    placements_timeline = []
    for i in range(3, -1, -1):
        start_p = now - timedelta(days=(i + 1) * 30)
        end_p = now - timedelta(days=i * 30)
        p_apps = [a for a in all_inst_apps if a.applied_at and start_p <= a.applied_at < end_p] if user_ids else []
        p_offers = [a for a in p_apps if (a.status or "").lower() == "selected"]
        placements_timeline.append(
            {
                "month": (now - timedelta(days=i * 30)).strftime("%b %Y"),
                "offers_count": len(p_offers),
                "applications_count": len(p_apps),
            }
        )

    # Individual Student Placement Records from genuine selections
    placement_records = []
    for a in selected_apps[:12]:
        st_prof = next((p for p in students if p.user_id == a.applicant_user_id), None)
        opp = a.opportunity
        dept_name = st_prof.department.name if st_prof and st_prof.department else "Engineering"
        st_name = st_prof.user.full_name if st_prof and st_prof.user else "Student Candidate"
        comp_name = (
            opp.posted_by.organization_name
            if opp and opp.posted_by and opp.posted_by.organization_name
            else (opp.posted_by.full_name if opp and opp.posted_by else "Industry Partner")
        )

        placement_records.append(
            {
                "student_id": st_prof.id if st_prof else a.applicant_user_id,
                "student_name": st_name,
                "department": dept_name,
                "opportunity_title": opp.title if opp else "Opportunity Role",
                "company_name": comp_name,
                "type": opp.type if opp else "internship",
                "status": "Selected / Placed",
                "cgpa": st_prof.cgpa if st_prof and st_prof.cgpa else 0.0,
                "applied_date": a.applied_at.strftime("%b %d, %Y") if a.applied_at else "Recently",
            }
        )

    return {
        "institution_name": inst_name,
        "total_students": students_count,
        "total_faculty": faculty_count,
        "active_internships": active_internships,
        "total_applications": total_applications,
        "students_placed": students_placed,
        "collaboration_count": collab_count,
        "placement_rate": placement_rate,
        "average_readiness_score": avg_readiness,
        "total_eligible_students": total_eligible,
        "readiness_distribution": readiness_distribution,
        "department_breakdown": dept_breakdown,
        "department_metrics": department_metrics,
        "top_hiring_companies": top_hiring_companies,
        "top_skills": in_demand_skills,
        "in_demand_skills": in_demand_skills,
        "placements_timeline": placements_timeline,
        "placement_records": placement_records,
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
            "verified_documents_count": 0,
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

    verified_docs = (
        db.query(Document)
        .filter(Document.owner_user_id == user_id)
        .join(Document.verifications)
        .filter(Document.verifications.any(verification_status="verified"))
        .count()
    )

    return {
        "assessed_skills_count": assessed_count,
        "average_assessment_score": avg_score,
        "applications_submitted": submitted,
        "applications_shortlisted": shortlisted,
        "active_internships": active_interns,
        "completed_internships": completed_interns,
        "verified_documents_count": verified_docs,
    }
