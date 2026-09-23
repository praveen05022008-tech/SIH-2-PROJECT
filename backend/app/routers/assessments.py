import json
from typing import List, Optional

from app.core.audit import log_audit
from app.core.deps import get_current_user, require_role
from app.database import get_db
from app.models.assessment import Assessment, AssessmentQuestion, AssessmentResult
from app.models.profile import StudentProfile
from app.models.skill import StudentSkill
from app.models.user import User
from app.schemas.assessment import (
    AssessmentCreate,
    AssessmentQuestionCreate,
    AssessmentResponse,
    AssessmentResultResponse,
    AssessmentSubmitRequest,
)
from app.services.notification import send_notification
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

router = APIRouter(prefix="/assessments", tags=["Skill Assessments"])


@router.get("", response_model=List[AssessmentResponse])
def get_assessments(
    assessment_type: Optional[str] = None,
    skill_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Assessment)
    if current_user.role != "admin":
        query = query.filter(Assessment.is_published.is_(True))
    if assessment_type:

        query = query.filter(Assessment.assessment_type == assessment_type)
    if skill_id:
        query = query.filter(Assessment.skill_id == skill_id)

    assessments = query.all()
    results = []
    for a in assessments:
        questions_resp = []
        for q in a.questions:
            try:
                opts = json.loads(q.options_json) if isinstance(q.options_json, str) else q.options_json
            except Exception:
                opts = []
            questions_resp.append(
                {
                    "id": q.id,
                    "assessment_id": q.assessment_id,
                    "question_text": q.question_text,
                    "question_type": q.question_type,
                    "options": opts,
                    "marks": q.marks,
                    "difficulty": q.difficulty,
                    "explanation": q.explanation if current_user.role == "admin" else None,
                }
            )

        results.append(
            {
                "id": a.id,
                "title": a.title,
                "category_id": a.category_id,
                "skill_id": a.skill_id,
                "assessment_type": a.assessment_type,
                "time_limit_minutes": a.time_limit_minutes,
                "passing_marks": a.passing_marks,
                "total_marks": a.total_marks,
                "is_published": a.is_published,
                "created_at": a.created_at,
                "questions": questions_resp,
            }
        )
    return results


@router.get("/{assessment_id}", response_model=AssessmentResponse)
def get_assessment(assessment_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    a = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Assessment not found")

    questions_resp = []
    for q in a.questions:
        try:
            opts = json.loads(q.options_json) if isinstance(q.options_json, str) else q.options_json
        except Exception:
            opts = []
        questions_resp.append(
            {
                "id": q.id,
                "assessment_id": q.assessment_id,
                "question_text": q.question_text,
                "question_type": q.question_type,
                "options": opts,
                "marks": q.marks,
                "difficulty": q.difficulty,
                "explanation": q.explanation if current_user.role == "admin" else None,
            }
        )

    return {
        "id": a.id,
        "title": a.title,
        "category_id": a.category_id,
        "skill_id": a.skill_id,
        "assessment_type": a.assessment_type,
        "time_limit_minutes": a.time_limit_minutes,
        "passing_marks": a.passing_marks,
        "total_marks": a.total_marks,
        "is_published": a.is_published,
        "created_at": a.created_at,
        "questions": questions_resp,
    }


@router.post("", response_model=AssessmentResponse, status_code=status.HTTP_201_CREATED)
def create_assessment(
    data: AssessmentCreate, current_user: User = Depends(require_role(["admin"])), db: Session = Depends(get_db)
):
    a = Assessment(**data.dict(), created_by_user_id=current_user.id)
    db.add(a)
    db.commit()
    db.refresh(a)
    return {
        "id": a.id,
        "title": a.title,
        "category_id": a.category_id,
        "skill_id": a.skill_id,
        "assessment_type": a.assessment_type,
        "time_limit_minutes": a.time_limit_minutes,
        "passing_marks": a.passing_marks,
        "total_marks": a.total_marks,
        "is_published": a.is_published,
        "created_at": a.created_at,
        "questions": [],
    }


@router.post("/{assessment_id}/questions", status_code=status.HTTP_201_CREATED)
def add_question(
    assessment_id: int,
    data: AssessmentQuestionCreate,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    a = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Assessment not found")

    q = AssessmentQuestion(
        assessment_id=assessment_id,
        question_text=data.question_text,
        question_type=data.question_type,
        options_json=json.dumps(data.options),
        correct_answer=data.correct_answer,
        marks=data.marks,
        difficulty=data.difficulty,
        explanation=data.explanation,
    )
    db.add(q)
    db.commit()
    db.refresh(q)
    return {"message": "Question added successfully", "question_id": q.id}


@router.post("/{assessment_id}/submit", response_model=AssessmentResultResponse)
def submit_assessment(
    assessment_id: int,
    data: AssessmentSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    student = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=400, detail="Only students can submit assessments")

    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    questions = assessment.questions
    total_marks = 0.0
    earned_marks = 0.0
    detailed_answers = {}

    for q in questions:
        total_marks += q.marks
        student_ans = data.answers.get(q.id, "").strip()
        is_correct = student_ans.lower() == q.correct_answer.strip().lower()

        if is_correct:
            earned_marks += q.marks

        detailed_answers[str(q.id)] = {
            "submitted_answer": student_ans,
            "is_correct": is_correct,
            "marks_earned": q.marks if is_correct else 0.0,
        }

    pct = round((earned_marks / total_marks) * 100.0, 1) if total_marks > 0 else 0.0
    passed = pct >= (assessment.passing_marks / (assessment.total_marks or 100.0)) * 100.0
    status_str = "passed" if passed else "failed"

    result = AssessmentResult(
        assessment_id=assessment.id,
        student_id=student.id,
        score=earned_marks,
        percentage=pct,
        status=status_str,
        detailed_answers_json=json.dumps(detailed_answers),
    )
    db.add(result)

    # If passed and assessment is linked to a skill, update or verify the student skill
    if assessment.skill_id:
        st_skill = (
            db.query(StudentSkill)
            .filter(StudentSkill.student_id == student.id, StudentSkill.skill_id == assessment.skill_id)
            .first()
        )

        level = "beginner"
        if pct >= 85:
            level = "expert"
        elif pct >= 70:
            level = "advanced"
        elif pct >= 50:
            level = "intermediate"

        if not st_skill:
            st_skill = StudentSkill(
                student_id=student.id,
                skill_id=assessment.skill_id,
                skill_level=level,
                verified_by_assessment=passed,
                score=pct,
            )
            db.add(st_skill)
        else:
            if passed:
                st_skill.verified_by_assessment = True
                st_skill.score = pct
                st_skill.skill_level = level

    db.commit()
    db.refresh(result)

    send_notification(
        db=db,
        user_id=current_user.id,
        title="Assessment Completed",
        message=f"You scored {pct}% on '{assessment.title}'. Result: {status_str.upper()}.",
        notification_type="system",
        link_url="/student/assessment-results",
    )

    log_audit(
        db=db,
        action="SUBMIT_ASSESSMENT",
        user_id=current_user.id,
        resource_type="ASSESSMENT",
        resource_id=str(assessment.id),
        details={"score": earned_marks, "percentage": pct, "status": status_str},
    )

    return {
        "id": result.id,
        "assessment_id": result.assessment_id,
        "student_id": result.student_id,
        "score": result.score,
        "percentage": result.percentage,
        "status": result.status,
        "detailed_answers": detailed_answers,
        "completed_at": result.completed_at,
        "assessment_title": assessment.title,
    }


@router.get("/results/my-results", response_model=List[AssessmentResultResponse])
def get_my_results(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    student = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not student:
        return []

    results = (
        db.query(AssessmentResult)
        .filter(AssessmentResult.student_id == student.id)
        .order_by(AssessmentResult.completed_at.desc())
        .all()
    )
    resp = []
    for r in results:
        resp.append(
            {
                "id": r.id,
                "assessment_id": r.assessment_id,
                "student_id": r.student_id,
                "score": r.score,
                "percentage": r.percentage,
                "status": r.status,
                "detailed_answers": json.loads(r.detailed_answers_json) if r.detailed_answers_json else None,
                "completed_at": r.completed_at,
                "assessment_title": r.assessment.title if r.assessment else None,
            }
        )
    return resp
