from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.audit import log_audit
from app.core.deps import get_current_user, require_role
from app.database import get_db
from app.models.opportunity import Application, Opportunity, OpportunitySkill
from app.models.profile import IndustryProfile, StudentProfile
from app.models.skill import Skill
from app.models.user import User
from app.schemas.opportunity import OpportunityCreate, OpportunityResponse, OpportunitySkillBase, OpportunityUpdate
from app.services.matching import evaluate_student_opportunity_match

router = APIRouter(prefix="/opportunities", tags=["Opportunities (Internships & Jobs)"])


@router.get("", response_model=List[OpportunityResponse])
def get_opportunities(
    type: Optional[str] = None,
    work_mode: Optional[str] = None,
    search: Optional[str] = None,
    status_filter: Optional[str] = "open",
    my_only: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Opportunity)

    if my_only and current_user.role in ["industry", "admin"]:
        query = query.filter(Opportunity.posted_by_user_id == current_user.id)
    elif status_filter:
        query = query.filter(Opportunity.status == status_filter)

    if type:
        query = query.filter(Opportunity.type == type)
    if work_mode:
        query = query.filter(Opportunity.work_mode == work_mode)
    if search:
        s = f"%{search}%"
        query = query.filter(
            (Opportunity.title.ilike(s)) | (Opportunity.company_name.ilike(s)) | (Opportunity.description.ilike(s))
        )

    opps = query.order_by(Opportunity.created_at.desc()).all()

    student = None
    if current_user.role == "student":
        student = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()

    results = []
    for opp in opps:
        skills_resp = []
        for s in opp.skills:
            sk_obj = db.query(Skill).filter(Skill.id == s.skill_id).first()
            skills_resp.append(
                {
                    "id": s.id,
                    "skill_id": s.skill_id,
                    "skill_name": sk_obj.name if sk_obj else f"Skill #{s.skill_id}",
                    "minimum_level": s.minimum_level,
                    "is_mandatory": s.is_mandatory,
                }
            )

        apps_count = db.query(Application).filter(Application.opportunity_id == opp.id).count()

        match_data = {}
        if student:
            match_res = evaluate_student_opportunity_match(student=student, opportunity=opp, db=db)
            match_data = {
                "match_score": match_res["match_score"],
                "match_reasons": match_res["match_reasons"],
                "missing_skills": match_res["missing_skills"],
                "is_eligible": match_res["is_eligible"],
                "recommended_programs": match_res.get("recommended_programs", []),
            }

        results.append(
            {
                "id": opp.id,
                "posted_by_user_id": opp.posted_by_user_id,
                "company_name": opp.company_name,
                "type": opp.type,
                "title": opp.title,
                "description": opp.description,
                "responsibilities": opp.responsibilities,
                "required_qualifications": opp.required_qualifications,
                "eligibility_cgpa": opp.eligibility_cgpa,
                "eligibility_year": opp.eligibility_year,
                "target_departments": opp.target_departments,
                "min_experience_years": opp.min_experience_years,
                "academic_qualification": opp.academic_qualification,
                "location": opp.location,
                "work_mode": opp.work_mode,
                "duration": opp.duration,
                "stipend_salary": opp.stipend_salary,
                "openings_count": opp.openings_count,
                "deadline": opp.deadline,
                "status": opp.status,
                "created_at": opp.created_at,
                "skills": skills_resp,
                "applications_count": apps_count,
                **match_data,
            }
        )

    return results


@router.get("/{opportunity_id}", response_model=OpportunityResponse)
def get_opportunity(opportunity_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    opp = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    skills_resp = []
    for s in opp.skills:
        sk_obj = db.query(Skill).filter(Skill.id == s.skill_id).first()
        skills_resp.append(
            {
                "id": s.id,
                "skill_id": s.skill_id,
                "skill_name": sk_obj.name if sk_obj else f"Skill #{s.skill_id}",
                "minimum_level": s.minimum_level,
                "is_mandatory": s.is_mandatory,
            }
        )

    apps_count = db.query(Application).filter(Application.opportunity_id == opp.id).count()

    match_data = {}
    if current_user.role == "student":
        student = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
        if student:
            match_res = evaluate_student_opportunity_match(student=student, opportunity=opp, db=db)
            match_data = {
                "match_score": match_res["match_score"],
                "match_reasons": match_res["match_reasons"],
                "missing_skills": match_res["missing_skills"],
                "is_eligible": match_res["is_eligible"],
                "recommended_programs": match_res.get("recommended_programs", []),
            }

    return {
        "id": opp.id,
        "posted_by_user_id": opp.posted_by_user_id,
        "company_name": opp.company_name,
        "type": opp.type,
        "title": opp.title,
        "description": opp.description,
        "responsibilities": opp.responsibilities,
        "required_qualifications": opp.required_qualifications,
        "eligibility_cgpa": opp.eligibility_cgpa,
        "eligibility_year": opp.eligibility_year,
        "target_departments": opp.target_departments,
        "min_experience_years": opp.min_experience_years,
        "academic_qualification": opp.academic_qualification,
        "location": opp.location,
        "work_mode": opp.work_mode,
        "duration": opp.duration,
        "stipend_salary": opp.stipend_salary,
        "openings_count": opp.openings_count,
        "deadline": opp.deadline,
        "status": opp.status,
        "created_at": opp.created_at,
        "skills": skills_resp,
        "applications_count": apps_count,
        **match_data,
    }


@router.post("", response_model=OpportunityResponse, status_code=status.HTTP_201_CREATED)
def create_opportunity(
    data: OpportunityCreate,
    current_user: User = Depends(require_role(["industry", "admin"])),
    db: Session = Depends(get_db),
):
    opp_dict = data.dict(exclude={"skills"})

    # If industry, auto-set company name from profile if available
    if current_user.role == "industry" and current_user.industry_profile:
        opp_dict["company_name"] = current_user.industry_profile.company_name

    opp = Opportunity(**opp_dict, posted_by_user_id=current_user.id)
    db.add(opp)
    db.commit()
    db.refresh(opp)

    # Add skills
    for sk in data.skills:
        op_skill = OpportunitySkill(
            opportunity_id=opp.id, skill_id=sk.skill_id, minimum_level=sk.minimum_level, is_mandatory=sk.is_mandatory
        )
        db.add(op_skill)

    db.commit()
    db.refresh(opp)

    log_audit(
        db=db,
        action="POST_OPPORTUNITY",
        user_id=current_user.id,
        resource_type="OPPORTUNITY",
        resource_id=str(opp.id),
        details={"title": opp.title, "type": opp.type},
    )

    skills_resp = []
    for s in opp.skills:
        sk_obj = db.query(Skill).filter(Skill.id == s.skill_id).first()
        skills_resp.append(
            {
                "id": s.id,
                "skill_id": s.skill_id,
                "skill_name": sk_obj.name if sk_obj else f"Skill #{s.skill_id}",
                "minimum_level": s.minimum_level,
                "is_mandatory": s.is_mandatory,
            }
        )

    return {
        "id": opp.id,
        "posted_by_user_id": opp.posted_by_user_id,
        "company_name": opp.company_name,
        "type": opp.type,
        "title": opp.title,
        "description": opp.description,
        "responsibilities": opp.responsibilities,
        "required_qualifications": opp.required_qualifications,
        "eligibility_cgpa": opp.eligibility_cgpa,
        "eligibility_year": opp.eligibility_year,
        "target_departments": opp.target_departments,
        "min_experience_years": opp.min_experience_years,
        "academic_qualification": opp.academic_qualification,
        "location": opp.location,
        "work_mode": opp.work_mode,
        "duration": opp.duration,
        "stipend_salary": opp.stipend_salary,
        "openings_count": opp.openings_count,
        "deadline": opp.deadline,
        "status": opp.status,
        "created_at": opp.created_at,
        "skills": skills_resp,
        "applications_count": 0,
    }


@router.put("/{opportunity_id}", response_model=OpportunityResponse)
def update_opportunity(
    opportunity_id: int,
    data: OpportunityUpdate,
    current_user: User = Depends(require_role(["industry", "admin"])),
    db: Session = Depends(get_db),
):
    opp = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    if current_user.role != "admin" and opp.posted_by_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this opportunity")

    update_data = data.dict(exclude_unset=True, exclude={"skills"})
    for field, val in update_data.items():
        setattr(opp, field, val)

    # If skills were provided in the update payload, replace them
    if data.skills is not None:
        db.query(OpportunitySkill).filter(OpportunitySkill.opportunity_id == opp.id).delete()
        for sk in data.skills:
            op_skill = OpportunitySkill(
                opportunity_id=opp.id,
                skill_id=sk.skill_id,
                minimum_level=sk.minimum_level,
                is_mandatory=sk.is_mandatory,
            )
            db.add(op_skill)

    db.commit()
    db.refresh(opp)

    log_audit(
        db=db,
        action="UPDATE_OPPORTUNITY",
        user_id=current_user.id,
        resource_type="OPPORTUNITY",
        resource_id=str(opp.id),
        details={"title": opp.title, "status": opp.status},
    )

    skills_resp = []
    for s in opp.skills:
        sk_obj = db.query(Skill).filter(Skill.id == s.skill_id).first()
        skills_resp.append(
            {
                "id": s.id,
                "skill_id": s.skill_id,
                "skill_name": sk_obj.name if sk_obj else f"Skill #{s.skill_id}",
                "minimum_level": s.minimum_level,
                "is_mandatory": s.is_mandatory,
            }
        )

    apps_count = db.query(Application).filter(Application.opportunity_id == opp.id).count()

    return {
        "id": opp.id,
        "posted_by_user_id": opp.posted_by_user_id,
        "company_name": opp.company_name,
        "type": opp.type,
        "title": opp.title,
        "description": opp.description,
        "responsibilities": opp.responsibilities,
        "required_qualifications": opp.required_qualifications,
        "eligibility_cgpa": opp.eligibility_cgpa,
        "eligibility_year": opp.eligibility_year,
        "target_departments": opp.target_departments,
        "min_experience_years": opp.min_experience_years,
        "academic_qualification": opp.academic_qualification,
        "location": opp.location,
        "work_mode": opp.work_mode,
        "duration": opp.duration,
        "stipend_salary": opp.stipend_salary,
        "openings_count": opp.openings_count,
        "deadline": opp.deadline,
        "status": opp.status,
        "created_at": opp.created_at,
        "skills": skills_resp,
        "applications_count": apps_count,
    }


@router.delete("/{opportunity_id}")
def delete_opportunity(
    opportunity_id: int,
    current_user: User = Depends(require_role(["industry", "admin"])),
    db: Session = Depends(get_db),
):
    opp = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    if current_user.role != "admin" and opp.posted_by_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this opportunity")

    # Cleanly remove associated applications and skills
    db.query(Application).filter(Application.opportunity_id == opp.id).delete()
    db.query(OpportunitySkill).filter(OpportunitySkill.opportunity_id == opp.id).delete()
    db.delete(opp)
    db.commit()

    log_audit(
        db=db,
        action="DELETE_OPPORTUNITY",
        user_id=current_user.id,
        resource_type="OPPORTUNITY",
        resource_id=str(opportunity_id),
        details={"title": opp.title},
    )

    return {"message": "Opportunity deleted successfully", "id": opportunity_id}
