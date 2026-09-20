from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.audit import AuditLog
from app.schemas.user import UserResponse
from app.core.deps import require_role

router = APIRouter(prefix="/admin", tags=["System Administration"])

@router.get("/audit-logs")
def get_audit_logs(
    limit: int = 50,
    action: Optional[str] = None,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    query = db.query(AuditLog)
    if action:
        query = query.filter(AuditLog.action == action)
    logs = query.order_by(AuditLog.created_at.desc()).limit(limit).all()
    return logs

@router.get("/pending-approvals", response_model=List[UserResponse])
def get_pending_approvals(
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    return db.query(User).filter(User.is_approved == False).order_by(User.created_at.desc()).all()
