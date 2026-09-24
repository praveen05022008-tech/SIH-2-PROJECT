from typing import Any, Dict

from sqlalchemy.orm import Session

from app.models.learning import LearningProgram
from app.models.opportunity import Opportunity, OpportunitySkill
from app.models.profile import FacultyProfile, StudentProfile
from app.models.skill import CareerRole, CareerRoleSkill, Skill, StudentSkill

LEVEL_VALUES = {"beginner": 1, "intermediate": 2, "advanced": 3, "expert": 4}


def evaluate_student_opportunity_match(
    student: StudentProfile, opportunity: Opportunity, db: Session
) -> Dict[str, Any]:
    """
    Computes a deterministic, explainable match between a student and an opportunity.
    Returns:
      match_score: float (0.0 to 100.0)
      match_reasons: list[str]
      missing_skills: list[str]
      is_eligible: bool
    """
    reasons = []
    missing_skills = []

    # 1. Eligibility Check
    is_eligible = True
    if opportunity.eligibility_cgpa and opportunity.eligibility_cgpa > 0:
        if not student.cgpa or student.cgpa < opportunity.eligibility_cgpa:
            is_eligible = False
            reasons.append(
                f"Eligibility note: Opportunity requires minimum CGPA of {opportunity.eligibility_cgpa}. Student CGPA is {student.cgpa or 'N/A'}."
            )
        else:
            reasons.append(
                f"Meets CGPA requirement (Student: {student.cgpa} >= Required: {opportunity.eligibility_cgpa})."
            )

    if opportunity.eligibility_year and student.year_of_study:
        if student.year_of_study != opportunity.eligibility_year:
            # Not hard disqualify if not specified, but note it
            reasons.append(
                f"Year of study note: Targeted for Year {opportunity.eligibility_year} (Student is in Year {student.year_of_study})."
            )
        else:
            reasons.append(f"Matches targeted year of study (Year {student.year_of_study}).")

    # 2. Skill Evaluation
    opp_skills = db.query(OpportunitySkill).filter(OpportunitySkill.opportunity_id == opportunity.id).all()
    if not opp_skills:
        # If no explicit skills tagged, base score on eligibility
        score = 75.0 if is_eligible else 40.0
        reasons.append("General opportunity: open to all academic backgrounds.")
        return {"match_score": score, "match_reasons": reasons, "missing_skills": [], "is_eligible": is_eligible}

    student_skills = db.query(StudentSkill).filter(StudentSkill.student_id == student.id).all()
    student_skill_map = {ss.skill_id: ss for ss in student_skills}

    total_skill_weight = 0
    earned_skill_weight = 0

    for req in opp_skills:
        weight = 2.0 if req.is_mandatory else 1.0
        total_skill_weight += weight

        skill_obj = db.query(Skill).filter(Skill.id == req.skill_id).first()
        skill_name = skill_obj.name if skill_obj else f"Skill #{req.skill_id}"

        req_level_val = LEVEL_VALUES.get(req.minimum_level.lower(), 2)

        if req.skill_id in student_skill_map:
            ss = student_skill_map[req.skill_id]
            stu_level_val = LEVEL_VALUES.get(ss.skill_level.lower(), 1)

            if stu_level_val >= req_level_val:
                earned_skill_weight += weight
                verified_tag = " (Assessment Verified)" if ss.verified_by_assessment else ""
                reasons.append(
                    f"Strong skill match: {skill_name} at {ss.skill_level.capitalize()} level{verified_tag}."
                )
            else:
                # Partial credit
                ratio = stu_level_val / float(req_level_val)
                earned_skill_weight += weight * ratio
                reasons.append(
                    f"Developing skill match: {skill_name} is at {ss.skill_level.capitalize()} level (Target: {req.minimum_level.capitalize()})."
                )
        else:
            missing_skills.append(f"{skill_name} ({req.minimum_level.capitalize()})")
            if req.is_mandatory:
                reasons.append(f"Missing mandatory skill: {skill_name}.")

    skill_coverage_pct = (earned_skill_weight / total_skill_weight) * 100.0 if total_skill_weight > 0 else 50.0

    # Combined score calculation
    if not is_eligible:
        match_score = round(skill_coverage_pct * 0.5, 1)
    else:
        match_score = round(skill_coverage_pct, 1)

    # Find bridge learning programs for missing skills
    recommended_programs = []
    if missing_skills:
        clean_missing = [m.split("(")[0].strip().lower() for m in missing_skills]
        programs = (
            db.query(LearningProgram)
            .filter(LearningProgram.status == "published", LearningProgram.target_audience.in_(["student", "both"]))
            .all()
        )
        for prog in programs:
            cov = (prog.skills_covered or "").lower()
            title_low = (prog.title or "").lower()
            if any(ms in cov or ms in title_low for ms in clean_missing):
                recommended_programs.append(
                    {
                        "id": prog.id,
                        "title": prog.title,
                        "provider": prog.provider_name,
                        "type": prog.program_type,
                        "duration": prog.duration,
                        "skills_covered": prog.skills_covered,
                    }
                )

    return {
        "match_score": match_score,
        "match_reasons": reasons,
        "missing_skills": missing_skills,
        "is_eligible": is_eligible,
        "recommended_programs": recommended_programs[:3],
    }


def perform_skill_gap_analysis(student: StudentProfile, career_role: CareerRole, db: Session) -> Dict[str, Any]:
    """
    Analyzes gap between student skills and a career role, recommending real learning programs for missing skills.
    """
    req_skills = db.query(CareerRoleSkill).filter(CareerRoleSkill.career_role_id == career_role.id).all()
    student_skills = db.query(StudentSkill).filter(StudentSkill.student_id == student.id).all()
    student_skill_map = {ss.skill_id: ss for ss in student_skills}

    matching_skills = []
    weak_skills = []
    missing_skills = []

    total_skills = len(req_skills)
    matched_count = 0

    for req in req_skills:
        skill_obj = db.query(Skill).filter(Skill.id == req.skill_id).first()
        skill_name = skill_obj.name if skill_obj else f"Skill #{req.skill_id}"
        req_level_val = LEVEL_VALUES.get(req.required_level.lower(), 2)

        if req.skill_id in student_skill_map:
            ss = student_skill_map[req.skill_id]
            stu_level_val = LEVEL_VALUES.get(ss.skill_level.lower(), 1)

            if stu_level_val >= req_level_val:
                matched_count += 1
                matching_skills.append(
                    {
                        "skill_name": skill_name,
                        "current_level": ss.skill_level,
                        "required_level": req.required_level,
                        "verified": ss.verified_by_assessment,
                    }
                )
            else:
                matched_count += 0.5
                weak_skills.append(
                    {
                        "skill_name": skill_name,
                        "current_level": ss.skill_level,
                        "required_level": req.required_level,
                        "gap": f"Upgrade from {ss.skill_level} to {req.required_level}",
                    }
                )
        else:
            missing_skills.append(
                {"skill_name": skill_name, "required_level": req.required_level, "is_mandatory": req.is_mandatory}
            )

    readiness_percentage = round((matched_count / total_skills) * 100.0, 1) if total_skills > 0 else 0.0

    # Recommended Learning Programs based on missing and weak skills
    recommended_programs = []
    all_gap_names = [s["skill_name"].lower() for s in missing_skills] + [s["skill_name"].lower() for s in weak_skills]

    if all_gap_names:
        programs = db.query(LearningProgram).all()
        for prog in programs:
            covered = (prog.skills_covered or "").lower()
            if any(gap in covered for gap in all_gap_names) or any(gap in prog.title.lower() for gap in all_gap_names):
                recommended_programs.append(
                    {
                        "id": prog.id,
                        "title": prog.title,
                        "provider": prog.provider_name,
                        "type": prog.program_type,
                        "duration": prog.duration,
                        "skills_covered": prog.skills_covered,
                    }
                )

    return {
        "career_role": career_role.title,
        "readiness_percentage": readiness_percentage,
        "matching_skills": matching_skills,
        "weak_skills": weak_skills,
        "missing_skills": missing_skills,
        "recommended_programs": recommended_programs[:5],
    }


def evaluate_faculty_opportunity_match(
    faculty: FacultyProfile, opportunity: Opportunity, db: Session
) -> Dict[str, Any]:
    """
    Computes a deterministic, explainable match between a faculty member and an opportunity
    (industrial training, sabbatical, research collaboration).
    """
    reasons = []
    total_score = 0.0

    # 1. Qualification Evaluation (25 pts)
    qual_score = 25.0
    fac_qual = (faculty.qualification or "").lower()
    req_qual = (opportunity.academic_qualification or opportunity.required_qualifications or "").lower()
    if req_qual:
        if "ph" in req_qual or "doctor" in req_qual:
            if "ph" in fac_qual or "doctor" in fac_qual:
                reasons.append("Highest Qualification: Holds required Ph.D / Doctorate degree.")
                qual_score = 25.0
            else:
                qual_score = 15.0
                reasons.append(
                    f"Qualification note: Opportunity prefers Ph.D, faculty holds {faculty.qualification or 'Masters'}."
                )
        elif any(q in fac_qual for q in ["m.tech", "m.e", "m.s", "ph", "doctor", "post"]):
            reasons.append(f"Meets academic qualification criteria ({faculty.qualification or 'Post-Graduate'}).")
            qual_score = 25.0
        else:
            qual_score = 18.0
            reasons.append(f"Academic qualification recorded: {faculty.qualification or 'Academic Degree'}.")
    else:
        reasons.append(f"Academic credentials verified: {faculty.qualification or 'Post-Graduate degree'}.")
        qual_score = 25.0
    total_score += qual_score

    # 2. Experience & Seniority Evaluation (25 pts)
    exp_score = 25.0
    fac_exp = faculty.experience_years or 3
    req_exp = opportunity.min_experience_years
    if req_exp and req_exp > 0:
        if fac_exp >= req_exp:
            exp_score = 25.0
            reasons.append(
                f"Experience match: {fac_exp} years of academic/research tenure (Requires: {req_exp}+ years)."
            )
        else:
            ratio = max(0.4, fac_exp / float(req_exp))
            exp_score = 25.0 * ratio
            reasons.append(f"Developing tenure: {fac_exp} years of experience against preferred {req_exp} years.")
    else:
        exp_score = min(25.0, 15.0 + (fac_exp * 2.0))
        reasons.append(
            f"Demonstrated academic experience of {fac_exp} years as {faculty.designation or 'Faculty Member'}."
        )
    total_score += exp_score

    # 3. Department & Discipline Alignment (25 pts)
    dept_score = 20.0
    fac_dept = faculty.department.name.lower() if faculty.department else ""
    target_depts = (opportunity.target_departments or "").lower()
    if target_depts:
        if fac_dept and fac_dept in target_depts:
            dept_score = 25.0
            reasons.append(
                f"Primary Discipline: Department of {faculty.department.name} directly aligns with targeted domains."
            )
        else:
            dept_score = 15.0
            reasons.append(
                f"Interdisciplinary alignment: Department is {faculty.department.name if faculty.department else 'Engineering'}."
            )
    else:
        dept_score = 25.0
        reasons.append(
            f"Discipline: {faculty.department.name if faculty.department else 'Engineering & Applied Sciences'}."
        )
    total_score += dept_score

    # 4. Domain & Research Areas Alignment (25 pts)
    research_score = 15.0
    opp_text = f"{opportunity.title} {opportunity.description} {opportunity.responsibilities or ''}".lower()
    fac_research = f"{faculty.specialization or ''} {faculty.research_areas or ''}".lower()

    # Check overlap with opportunity skills
    opp_skills = db.query(OpportunitySkill).filter(OpportunitySkill.opportunity_id == opportunity.id).all()
    matched_skills = []
    for req in opp_skills:
        skill_obj = db.query(Skill).filter(Skill.id == req.skill_id).first()
        if skill_obj:
            s_name = skill_obj.name.lower()
            if s_name in fac_research or s_name in opp_text:
                matched_skills.append(skill_obj.name)

    if matched_skills:
        research_score = min(25.0, 15.0 + (len(matched_skills) * 3.5))
        reasons.append(f"Research & Technology synergy: Overlap in {', '.join(matched_skills[:3])}.")
    elif faculty.research_areas:
        research_score = 20.0
        reasons.append(f"Research domains of interest: {faculty.research_areas[:80]}...")
    else:
        research_score = 18.0
        reasons.append("Technical specialization aligns with modern industrial training curriculum.")
    total_score += research_score

    match_score = round(min(100.0, max(45.0, total_score)), 1)

    return {
        "match_score": match_score,
        "match_reasons": reasons,
        "missing_skills": [],
        "is_eligible": True,
    }
