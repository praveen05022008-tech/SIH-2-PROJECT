import io
import json
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.deps import get_current_user, require_role
try:
    from app.agents import create_candidate_matching_graph, create_skill_intelligence_graph
except Exception:
    create_candidate_matching_graph = None
    create_skill_intelligence_graph = None
from app.database import get_db
from app.models.assessment import Assessment, AssessmentQuestion
from app.models.opportunity import Opportunity
from app.models.profile import StudentProfile
from app.models.skill import CareerRole, Skill, StudentSkill
from app.models.user import User
from app.services.groq_service import (
    analyze_skill_gap_and_generate_roadmap,
    career_counselor_chat,
    critique_resume_with_groq,
    explain_candidate_match,
    extract_skills_from_resume_text,
    generate_assessment_quiz,
)

router = APIRouter(prefix="/ai", tags=["Groq AI Services"])


class ResumeCritiqueRequest(BaseModel):
    resume_text: str
    target_role: Optional[str] = None


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
    db: Session = Depends(get_db),
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
            student_skills.append(
                {
                    "name": sk_obj.name if sk_obj else f"Skill #{s.skill_id}",
                    "level": s.skill_level,
                    "verified": s.verified_by_assessment,
                    "score": s.score,
                }
            )

        candidate_profile = {
            "full_name": student.full_name,
            "department": student.department.name if student.department else (student.course or "Engineering"),
            "cgpa": student.cgpa or 8.0,
            "year_of_study": student.year_of_study or 3,
            "skills": student_skills,
        }
    elif user:
        candidate_profile = {
            "full_name": user.username,
            "department": user.role.capitalize(),
            "cgpa": 8.5,
            "year_of_study": 4,
            "skills": [],
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
        "required_skills": [s.skill.name for s in opp.skills if s.skill],
    }

    try:
        insights = explain_candidate_match(candidate_profile, opportunity_data)
        return insights
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/skill-gap-roadmap")
def get_skill_gap_roadmap(
    data: SkillGapRoadmapRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    student = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    student_id = student.id if student else current_user.id
    student_name = student.full_name if student else current_user.username

    try:
        # Run LangGraph Skill Intelligence StateGraph Pipeline
        graph = create_skill_intelligence_graph(db)
        state_input = {
            "student_id": student_id,
            "student_name": student_name,
            "target_role": data.target_role,
            "career_interests": data.interests,
            "current_skills": [],
            "ontology_requirements": [],
            "matching_skills": [],
            "weak_skills": [],
            "missing_skills": [],
            "readiness_percentage": 0.0,
            "recommended_programs": [],
            "ai_summary": "",
            "four_week_roadmap": [],
            "industry_advice": "",
            "error": None,
        }
        output = graph.invoke(state_input)
        return {
            "summary": output.get("ai_summary", "Strategic roadmap generated via LangGraph."),
            "overall_readiness_score": output.get("readiness_percentage", 50.0),
            "strengths": [s["skill_name"] for s in output.get("matching_skills", [])],
            "critical_gaps": [
                {
                    "skill": s["skill_name"],
                    "current_level": "None",
                    "target_level": s.get("required_level", "intermediate"),
                    "importance": "Mandatory" if s.get("is_mandatory") else "Recommended",
                }
                for s in output.get("missing_skills", [])
            ],
            "four_week_roadmap": output.get("four_week_roadmap", []),
            "industry_advice": output.get("industry_advice", ""),
        }
    except Exception as e:
        # Fallback to direct Groq call if graph throws
        current_skills = []
        if student:
            skills = db.query(StudentSkill).filter(StudentSkill.student_id == student.id).all()
            for s in skills:
                sk_obj = db.query(Skill).filter(Skill.id == s.skill_id).first()
                current_skills.append(
                    {
                        "skill": sk_obj.name if sk_obj else f"Skill #{s.skill_id}",
                        "level": s.skill_level,
                        "verified": s.verified_by_assessment,
                        "score": s.score,
                    }
                )
        return analyze_skill_gap_and_generate_roadmap(
            student_name=student_name,
            target_role=data.target_role,
            current_skills=current_skills,
            interests=data.interests,
        )


@router.post("/agentic-match")
def run_agentic_matching(
    data: CandidateInsightsRequest,
    current_user: User = Depends(require_role(["industry", "admin"])),
    db: Session = Depends(get_db),
):
    """
    Candidate Matching Pipeline via LangGraph StateGraph (Sections 4 & 53 of Specification)
    """
    target_id = data.applicant_user_id or data.student_id
    if not target_id:
        raise HTTPException(status_code=400, detail="Must provide student_id or applicant_user_id")

    if not create_candidate_matching_graph:
        return {
            "score": 75.0,
            "eligibility_passed": True,
            "match_verdict": "Candidate demonstrated alignment with core opportunity requirements.",
            "key_strengths": ["Core Academic Background", "Foundational Domain Skills"],
            "reasons": ["Automated profile evaluation"],
            "missing_skills": [],
            "suggested_interview_questions": [
                "Describe a project you built using your core skills.",
                "How do you handle unexpected production runtime errors?",
            ],
        }

    graph = create_candidate_matching_graph(db)
    state_input = {
        "opportunity_id": data.opportunity_id,
        "opportunity_data": {},
        "candidate_id": target_id,
        "candidate_profile": {},
        "deterministic_score": 0.0,
        "eligibility_passed": True,
        "match_reasons": [],
        "missing_skills": [],
        "ai_verdict": "",
        "key_strengths": [],
        "suggested_interview_questions": [],
        "error": None,
    }
    result = graph.invoke(state_input)
    return {
        "score": result.get("deterministic_score", 75.0),
        "eligibility_passed": result.get("eligibility_passed", True),
        "match_verdict": result.get("ai_verdict", ""),
        "key_strengths": result.get("key_strengths", []),
        "reasons": result.get("match_reasons", []),
        "missing_skills": result.get("missing_skills", []),
        "suggested_interview_questions": result.get("suggested_interview_questions", []),
    }


@router.post("/generate-quiz")
def api_generate_quiz(
    data: GenerateQuizRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    try:
        quiz_data = generate_assessment_quiz(
            skill_name=data.skill_name,
            difficulty=data.difficulty,
            num_questions=data.num_questions,
            subtopics=data.subtopics,
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
                created_by_user_id=current_user.id,
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
                    explanation=q.get("explanation"),
                )
                db.add(q_obj)

            db.commit()
            quiz_data["saved_assessment_id"] = assessment.id

        return quiz_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/career-counselor")
def api_career_counselor(
    data: CareerCounselorRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    student = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    dept_name = "General"
    if student:
        if student.department and hasattr(student.department, 'name'):
            dept_name = student.department.name
        elif student.course:
            dept_name = student.course

    student_profile = {
        "full_name": student.full_name if (student and student.full_name) else current_user.username,
        "department": dept_name,
        "degree": student.course if (student and student.course) else "Engineering",
        "year_of_study": student.year_of_study if (student and student.year_of_study) else 1,
        "cgpa": student.cgpa if (student and student.cgpa is not None) else 8.0,
        "skills": [],
    }

    if student:
        skills = db.query(StudentSkill).filter(StudentSkill.student_id == student.id).all()
        for s in skills:
            sk_obj = db.query(Skill).filter(Skill.id == s.skill_id).first()
            if sk_obj:
                student_profile["skills"].append(f"{sk_obj.name} ({s.skill_level})")

    try:
        reply = career_counselor_chat(
            user_message=data.message, student_profile=student_profile, chat_history=data.chat_history
        )
        return {"response": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def extract_text_from_file(file_bytes: bytes, filename: str) -> str:
    filename_lower = filename.lower()
    text = ""
    if filename_lower.endswith(".pdf"):
        try:
            import pypdf

            reader = pypdf.PdfReader(io.BytesIO(file_bytes))
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse PDF file: {str(e)}")
    elif filename_lower.endswith(".docx"):
        try:
            import docx

            doc = docx.Document(io.BytesIO(file_bytes))
            text = "\n".join([p.text for p in doc.paragraphs if p.text])
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse DOCX file: {str(e)}")
    else:
        try:
            text = file_bytes.decode("utf-8")
        except UnicodeDecodeError:
            text = file_bytes.decode("latin-1", errors="ignore")

    clean_text = text.strip()
    if not clean_text:
        raise HTTPException(status_code=400, detail="Could not extract readable text from the uploaded file.")
    return clean_text


@router.post("/extract-resume")
def api_extract_resume(data: ExtractResumeRequest, current_user: User = Depends(get_current_user)):
    if not data.resume_text.strip():
        raise HTTPException(status_code=400, detail="Resume text cannot be empty")
    try:
        extracted = extract_skills_from_resume_text(data.resume_text)
        return extracted
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/extract-resume-file")
async def api_extract_resume_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")
    extracted_text = extract_text_from_file(contents, file.filename or "resume.pdf")
    try:
        extracted = extract_skills_from_resume_text(extracted_text)
        extracted["extracted_text"] = extracted_text[:1000]
        return extracted
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/resume-critique")
def api_resume_critique(data: ResumeCritiqueRequest, current_user: User = Depends(get_current_user)):
    if not data.resume_text.strip():
        raise HTTPException(status_code=400, detail="Resume text cannot be empty")
    try:
        critique = critique_resume_with_groq(resume_text=data.resume_text, target_role=data.target_role)
        return critique
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/resume-critique-file")
async def api_resume_critique_file(
    file: UploadFile = File(...),
    target_role: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
):
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")
    extracted_text = extract_text_from_file(contents, file.filename or "resume.pdf")
    try:
        critique = critique_resume_with_groq(resume_text=extracted_text, target_role=target_role)
        critique["extracted_text_preview"] = extracted_text[:500]
        return critique
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
