import json
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.profile import StudentProfile
from app.models.skill import StudentSkill, Skill, CareerRole
from app.models.opportunity import Opportunity
from app.models.assessment import Assessment, AssessmentQuestion
from app.core.deps import get_current_user, require_role
from app.services.groq_service import (
    analyze_skill_gap_and_generate_roadmap,
    generate_assessment_quiz,
    career_counselor_chat,
    extract_skills_from_resume_text,
    explain_candidate_match
)

router = APIRouter(prefix="/ai", tags=["Groq AI Services"])

class SkillGapRoadmapRequest(BaseModel):
    target_role: str
    interests: Optional[str] = None

class GenerateQuizRequest(BaseModel):
    skill_name: str
    difficulty: str = "intermediate"
    num_questions: int = 5
    subtopics: Optional[str] = None
    save_as_assessment: bool = False
    assessment_title: Optional[str] = None

class CareerCounselorRequest(BaseModel):
    message: str
    chat_history: Optional[List[Dict[str, str]]] = []

class ExtractResumeRequest(BaseModel):
    resume_text: str

class CandidateInsightsRequest(BaseModel):
    student_id: Optional[int] = None
    applicant_user_id: Optional[int] = None
    opportunity_id: int

@router.post("/candidate-insights")
def api_candidate_insights(
    data: CandidateInsightsRequest,
    current_user: User = Depends(require_role(["industry", "admin"])),
    db: Session = Depends(get_db)
):
    target_id = data.applicant_user_id or data.student_id
    if not target_id:
        raise HTTPException(status_code=400, detail="Must provide student_id or applicant_user_id")
        
    # Search by StudentProfile.id, StudentProfile.user_id, or User.id
    student = db.query(StudentProfile).filter(StudentProfile.id == target_id).first()
    if not student:
        student = db.query(StudentProfile).filter(StudentProfile.user_id == target_id).first()
        
    user = None
    if not student:
        user = db.query(User).filter(User.id == target_id).first()
        if user and user.student_profile:
            student = user.student_profile
            
    opp = db.query(Opportunity).filter(Opportunity.id == data.opportunity_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity opening not found")
        
    student_skills = []
    if student:
        for s in db.query(StudentSkill).filter(StudentSkill.student_id == student.id).all():
            sk_obj = db.query(Skill).filter(Skill.id == s.skill_id).first()
            student_skills.append({
                "name": sk_obj.name if sk_obj else f"Skill #{s.skill_id}",
                "level": s.skill_level,
                "verified": s.verified_by_assessment,
                "score": s.score
            })
            
        candidate_profile = {
            "full_name": student.full_name,
            "department": student.department.name if student.department else (student.course or "Engineering"),
            "cgpa": student.cgpa or 8.0,
            "year_of_study": student.year_of_study or 3,
            "skills": student_skills
        }
    elif user:
        candidate_profile = {
            "full_name": user.username,
            "department": user.role.capitalize(),
            "cgpa": 8.5,
            "year_of_study": 4,
            "skills": []
        }
    else:
        raise HTTPException(status_code=404, detail="Candidate profile not found")
    
    opportunity_data = {
        "title": opp.title,
        "company_name": opp.company_name,
        "type": opp.type,
        "description": opp.description,
        "required_qualifications": opp.required_qualifications,
        "eligibility_cgpa": opp.eligibility_cgpa,
        "required_skills": [s.skill.name for s in opp.skills if s.skill]
    }
    
    try:
        insights = explain_candidate_match(candidate_profile, opportunity_data)
        return insights
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/skill-gap-roadmap")
def get_skill_gap_roadmap(
    data: SkillGapRoadmapRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    student_name = student.full_name if student else current_user.username
    
    current_skills = []
    if student:
        skills = db.query(StudentSkill).filter(StudentSkill.student_id == student.id).all()
        for s in skills:
            sk_obj = db.query(Skill).filter(Skill.id == s.skill_id).first()
            current_skills.append({
                "skill": sk_obj.name if sk_obj else f"Skill #{s.skill_id}",
                "level": s.skill_level,
                "verified": s.verified_by_assessment,
                "score": s.score
            })
            
    try:
        result = analyze_skill_gap_and_generate_roadmap(
            student_name=student_name,
            target_role=data.target_role,
            current_skills=current_skills,
            interests=data.interests
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-quiz")
def api_generate_quiz(
    data: GenerateQuizRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        quiz_data = generate_assessment_quiz(
            skill_name=data.skill_name,
            difficulty=data.difficulty,
            num_questions=data.num_questions,
            subtopics=data.subtopics
        )
        
        # Optionally auto-persist to Database if requested by admin/industry
        if data.save_as_assessment and current_user.role in ["admin", "industry"]:
            # Find or create skill
            skill = db.query(Skill).filter(Skill.name.ilike(data.skill_name.strip())).first()
            if not skill:
                skill = Skill(name=data.skill_name.strip(), description=f"Skill generated via AI: {data.skill_name}")
                db.add(skill)
                db.commit()
                db.refresh(skill)
                
            title = data.assessment_title or quiz_data.get("title") or f"{data.skill_name} Competency Assessment"
            passing_marks = quiz_data.get("passing_percentage", 70)
            
            assessment = Assessment(
                title=title,
                skill_id=skill.id,
                assessment_type="technical",
                time_limit_minutes=len(quiz_data.get("questions", [])) * 2,
                total_marks=len(quiz_data.get("questions", [])) * 1.0,
                passing_marks=round(len(quiz_data.get("questions", [])) * (passing_marks / 100.0), 1),
                is_published=True,
                created_by_user_id=current_user.id
            )
            db.add(assessment)
            db.commit()
            db.refresh(assessment)
            
            for q in quiz_data.get("questions", []):
                q_obj = AssessmentQuestion(
                    assessment_id=assessment.id,
                    question_text=q.get("question_text"),
                    question_type=q.get("question_type", "mcq"),
                    options_json=json.dumps(q.get("options", [])),
                    correct_answer=q.get("correct_answer"),
                    marks=q.get("marks", 1.0),
                    difficulty=q.get("difficulty", data.difficulty),
                    explanation=q.get("explanation")
                )
                db.add(q_obj)
                
            db.commit()
            quiz_data["saved_assessment_id"] = assessment.id
            
        return quiz_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/career-counselor")
def api_career_counselor(
    data: CareerCounselorRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    dept_name = "General"
    if student:
        if student.department and hasattr(student.department, 'name'):
            dept_name = student.department.name
        elif student.course:
            dept_name = student.course

    student_profile = {
        "full_name": student.full_name if student else current_user.username,
        "department": dept_name,
        "degree": student.course if student and student.course else "Engineering",
        "year_of_study": student.year_of_study if student and student.year_of_study else 1,
        "cgpa": student.cgpa if student and student.cgpa else 8.0,
        "skills": []
    }
    
    if student:
        skills = db.query(StudentSkill).filter(StudentSkill.student_id == student.id).all()
        for s in skills:
            sk_obj = db.query(Skill).filter(Skill.id == s.skill_id).first()
            if sk_obj:
                student_profile["skills"].append(f"{sk_obj.name} ({s.skill_level})")
                
    try:
        reply = career_counselor_chat(
            user_message=data.message,
            student_profile=student_profile,
            chat_history=data.chat_history
        )
        return {"response": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/extract-resume")
def api_extract_resume(
    data: ExtractResumeRequest,
    current_user: User = Depends(get_current_user)
):
    if not data.resume_text.strip():
        raise HTTPException(status_code=400, detail="Resume text cannot be empty")
    try:
        extracted = extract_skills_from_resume_text(data.resume_text)
        return extracted
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

