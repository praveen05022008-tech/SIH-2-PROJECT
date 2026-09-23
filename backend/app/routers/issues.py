from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_role
from app.database import get_db
from app.models.issue import IssueReport
from app.models.user import User
from app.services.email_service import send_issue_status_update_email
from app.services.notification import send_notification

router = APIRouter(prefix="/issues", tags=["Issue Reporting & Triage Governance"])


class IssueCreateRequest(BaseModel):
    title: str
    category: str = "bug"  # bug, feature_request, access_issue, data_correction, other
    severity: str = "medium"  # low, medium, high, critical
    description: str


class IssueUpdateRequest(BaseModel):
    status: Optional[str] = None  # open, triage, assigned, in_progress, resolved, closed
    severity: Optional[str] = None
    admin_notes: Optional[str] = None
    assigned_to: Optional[str] = None


class IssueResponse(BaseModel):
    id: int
    user_id: int
    title: str
    category: str
    severity: str
    description: str
    status: str
    admin_notes: Optional[str] = None
    assigned_to: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    reporter_username: Optional[str] = None
    reporter_email: Optional[str] = None
    reporter_role: Optional[str] = None

    class Config:
        from_attributes = True


@router.post("", response_model=IssueResponse, status_code=status.HTTP_201_CREATED)
def submit_issue(
    data: IssueCreateRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    issue = IssueReport(
        user_id=current_user.id,
        title=data.title,
        category=data.category,
        severity=data.severity,
        description=data.description,
        status="open",
    )
    db.add(issue)
    db.commit()
    db.refresh(issue)

    # Notify admins about newly reported issue
    admins = db.query(User).filter(User.role == "admin").all()
    for adm in admins:
        send_notification(
            db=db,
            user_id=adm.id,
            title=f"New Platform Issue: [{issue.severity.upper()}] {issue.title}",
            message=f"Reported by {current_user.username} ({current_user.email}): {issue.description[:100]}...",
            notification_type="system",
            link_url="/admin/issues",
        )

    res = IssueResponse.from_orm(issue)
    res.reporter_username = current_user.username
    res.reporter_email = current_user.email
    res.reporter_role = current_user.role
    return res


@router.get("/my-issues", response_model=List[IssueResponse])
def get_my_issues(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    issues = (
        db.query(IssueReport)
        .filter(IssueReport.user_id == current_user.id)
        .order_by(IssueReport.created_at.desc())
        .all()
    )
    results = []
    for iss in issues:
        r = IssueResponse.from_orm(iss)
        r.reporter_username = current_user.username
        r.reporter_email = current_user.email
        r.reporter_role = current_user.role
        results.append(r)
    return results


@router.get("", response_model=List[IssueResponse])
def get_all_issues(
    status: Optional[str] = None,
    category: Optional[str] = None,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    query = db.query(IssueReport)
    if status:
        query = query.filter(IssueReport.status == status)
    if category:
        query = query.filter(IssueReport.category == category)
    issues = query.order_by(IssueReport.created_at.desc()).all()

    results = []
    for iss in issues:
        r = IssueResponse.from_orm(iss)
        if iss.user:
            r.reporter_username = iss.user.username
            r.reporter_email = iss.user.email
            r.reporter_role = iss.user.role
        results.append(r)
    return results


@router.patch("/{issue_id}", response_model=IssueResponse)
def update_issue_status(
    issue_id: int,
    data: IssueUpdateRequest,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    issue = db.query(IssueReport).filter(IssueReport.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue report not found")

    if data.status is not None:
        issue.status = data.status
    if data.severity is not None:
        issue.severity = data.severity
    if data.admin_notes is not None:
        issue.admin_notes = data.admin_notes
    if data.assigned_to is not None:
        issue.assigned_to = data.assigned_to

    issue.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(issue)

    # If issue has a reporter user, notify them of status update
    if issue.user:
        send_notification(
            db=db,
            user_id=issue.user_id,
            title=f"Support Ticket Updated: #{issue.id} {issue.title}",
            message=f"Status: {issue.status.capitalize()} | Notes: {issue.admin_notes or 'Updated by administrator'}",
            notification_type="system",
        )
        if issue.user.email:
            reporter_name = issue.user.username
            if issue.user.student_profile and issue.user.student_profile.full_name:
                reporter_name = issue.user.student_profile.full_name
            elif issue.user.faculty_profile and issue.user.faculty_profile.full_name:
                reporter_name = issue.user.faculty_profile.full_name

            send_issue_status_update_email(
                to_email=issue.user.email,
                reporter_name=reporter_name,
                issue_title=issue.title,
                issue_status=issue.status,
                admin_notes=issue.admin_notes,
            )

    r = IssueResponse.from_orm(issue)
    if issue.user:
        r.reporter_username = issue.user.username
        r.reporter_email = issue.user.email
        r.reporter_role = issue.user.role
    return r
