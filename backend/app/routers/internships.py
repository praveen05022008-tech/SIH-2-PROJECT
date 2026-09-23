from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.audit import log_audit
from app.core.deps import get_current_user, require_role
from app.database import get_db
from app.models.internship import Internship, InternshipTask, MentorFeedback
from app.models.profile import IndustryProfile, StudentProfile
from app.models.user import User
from app.schemas.internship import (
    InternshipResponse,
    MentorFeedbackCreate,
    MentorFeedbackResponse,
    TaskCreate,
    TaskResponse,
    TaskReview,
    TaskSubmit,
)
from app.services.notification import send_notification

router = APIRouter(prefix="/internships", tags=["Internship Tracking & Mentorship"])


@router.get("", response_model=List[InternshipResponse])
def get_internships(
    status_filter: Optional[str] = None, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    query = db.query(Internship)

    if current_user.role == "student":
        student = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
        if not student:
            return []
        query = query.filter(Internship.student_id == student.id)
    elif current_user.role == "industry":
        ind = db.query(IndustryProfile).filter(IndustryProfile.user_id == current_user.id).first()
        if not ind:
            return []
        query = query.filter(Internship.industry_id == ind.id)
    elif current_user.role == "institution":
        if not current_user.institution_id:
            return []
        # Find students in this institution
        student_ids = [
            s.id
            for s in db.query(StudentProfile.id)
            .filter(StudentProfile.institution_id == current_user.institution_id)
            .all()
        ]
        query = query.filter(Internship.student_id.in_(student_ids))

    if status_filter:
        query = query.filter(Internship.status == status_filter)

    internships = query.all()
    results = []
    for i in internships:
        opp = i.application.opportunity if i.application else None
        stu = i.student
        results.append(
            {
                "id": i.id,
                "application_id": i.application_id,
                "student_id": i.student_id,
                "industry_id": i.industry_id,
                "start_date": i.start_date,
                "end_date": i.end_date,
                "mentor_name": i.mentor_name,
                "mentor_email": i.mentor_email,
                "status": i.status,
                "final_grade": i.final_grade,
                "completion_certificate_url": i.completion_certificate_url,
                "created_at": i.created_at,
                "opportunity_title": opp.title if opp else "Internship",
                "company_name": opp.company_name if opp else "Industry Partner",
                "student_name": stu.full_name if stu else "Student",
                "tasks": i.tasks,
                "feedbacks": i.feedbacks,
            }
        )
    return results


@router.post("/{internship_id}/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    internship_id: int,
    data: TaskCreate,
    current_user: User = Depends(require_role(["industry", "admin"])),
    db: Session = Depends(get_db),
):
    internship = db.query(Internship).filter(Internship.id == internship_id).first()
    if not internship:
        raise HTTPException(status_code=404, detail="Internship not found")

    task = InternshipTask(
        internship_id=internship.id,
        title=data.title,
        description=data.description,
        due_date=data.due_date,
        status="pending",
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    send_notification(
        db=db,
        user_id=internship.student.user_id,
        title="New Internship Task Assigned",
        message=f"A new task '{task.title}' has been assigned for your internship.",
        notification_type="internship",
        link_url="/student/internship-progress",
    )

    return task


@router.put("/tasks/{task_id}/submit", response_model=TaskResponse)
def submit_task(
    task_id: int, data: TaskSubmit, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    task = db.query(InternshipTask).filter(InternshipTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.submission_url = data.submission_url
    task.submission_notes = data.submission_notes
    task.status = "submitted"
    db.commit()
    db.refresh(task)
    return task


@router.put("/tasks/{task_id}/review", response_model=TaskResponse)
def review_task(
    task_id: int,
    data: TaskReview,
    current_user: User = Depends(require_role(["industry", "admin"])),
    db: Session = Depends(get_db),
):
    task = db.query(InternshipTask).filter(InternshipTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.grade = data.grade
    task.feedback = data.feedback
    task.status = data.status
    db.commit()
    db.refresh(task)
    return task


@router.post("/{internship_id}/feedback", response_model=MentorFeedbackResponse, status_code=status.HTTP_201_CREATED)
def add_mentor_feedback(
    internship_id: int,
    data: MentorFeedbackCreate,
    current_user: User = Depends(require_role(["industry", "admin"])),
    db: Session = Depends(get_db),
):
    internship = db.query(Internship).filter(Internship.id == internship_id).first()
    if not internship:
        raise HTTPException(status_code=404, detail="Internship not found")

    fb = MentorFeedback(
        internship_id=internship.id,
        mentor_id=current_user.id,
        feedback_text=data.feedback_text,
        rating_technical=data.rating_technical,
        rating_soft_skills=data.rating_soft_skills,
        rating_punctuality=data.rating_punctuality,
    )
    db.add(fb)
    db.commit()
    db.refresh(fb)

    send_notification(
        db=db,
        user_id=internship.student.user_id,
        title="Mentor Feedback Added",
        message="Your industry mentor has posted an evaluation report for your internship.",
        notification_type="internship",
        link_url="/student/mentor-feedback",
    )

    return fb
