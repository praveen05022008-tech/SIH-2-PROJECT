from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_role
from app.database import get_db
from app.models.user import User
from app.schemas.analytics import (
    AdminAnalyticsResponse,
    IndustryAnalyticsResponse,
    InstitutionAnalyticsResponse,
    StudentAnalyticsResponse,
)
from app.services.analytics import (
    get_admin_analytics,
    get_industry_analytics,
    get_institution_analytics,
    get_student_analytics,
)

router = APIRouter(prefix="/analytics", tags=["Real-time Analytics"])


@router.get("/admin", response_model=AdminAnalyticsResponse)
def get_admin_dashboard_metrics(current_user: User = Depends(require_role(["admin"])), db: Session = Depends(get_db)):
    return get_admin_analytics(db=db)


@router.get("/institution", response_model=InstitutionAnalyticsResponse)
def get_institution_dashboard_metrics(
    department_id: Optional[int] = Query(None, description="Filter metrics by department ID"),
    graduation_year: Optional[int] = Query(None, description="Filter metrics by graduation year"),
    period: Optional[str] = Query("30d", description="Time window: 7d, 30d, 90d, all"),
    current_user: User = Depends(require_role(["institution", "admin"])),
    db: Session = Depends(get_db),
):
    inst_id = current_user.institution_id
    if not inst_id and current_user.role != "admin":
        raise HTTPException(status_code=400, detail="Institution profile not linked")
    inst_id = inst_id or 1
    return get_institution_analytics(
        db=db,
        institution_id=inst_id,
        department_id=department_id,
        graduation_year=graduation_year,
        period=period,
    )


@router.get("/industry", response_model=IndustryAnalyticsResponse)
def get_industry_dashboard_metrics(
    opportunity_id: Optional[int] = Query(None, description="Filter metrics by specific opportunity ID"),
    period: Optional[str] = Query("30d", description="Time window: 7d, 30d, 90d, all"),
    current_user: User = Depends(require_role(["industry", "admin"])),
    db: Session = Depends(get_db),
):
    return get_industry_analytics(
        db=db,
        user_id=current_user.id,
        opportunity_id=opportunity_id,
        period=period,
    )


@router.get("/student", response_model=StudentAnalyticsResponse)
def get_student_dashboard_metrics(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_student_analytics(db=db, user_id=current_user.id)
