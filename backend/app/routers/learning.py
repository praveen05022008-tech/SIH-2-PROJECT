from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.audit import log_audit
from app.core.deps import get_current_user, require_role
from app.database import get_db
from app.models.learning import LearningProgram
from app.models.user import User
from app.schemas.learning import LearningProgramCreate, LearningProgramResponse

router = APIRouter(prefix="/learning-programs", tags=["Learning Programs Marketplace"])


@router.get("", response_model=List[LearningProgramResponse])
def get_learning_programs(
    program_type: Optional[str] = None,
    learning_mode: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(LearningProgram)
    if program_type:
        query = query.filter(LearningProgram.program_type == program_type)
    if learning_mode:
        query = query.filter(LearningProgram.learning_mode == learning_mode)
    if search:
        s = f"%{search}%"
        query = query.filter(
            (LearningProgram.title.ilike(s))
            | (LearningProgram.skills_covered.ilike(s))
            | (LearningProgram.provider_name.ilike(s))
        )
    return query.order_by(LearningProgram.created_at.desc()).all()


@router.post("", response_model=LearningProgramResponse, status_code=status.HTTP_201_CREATED)
def create_learning_program(
    data: LearningProgramCreate,
    current_user: User = Depends(require_role(["industry", "institution", "admin"])),
    db: Session = Depends(get_db),
):
    prog = LearningProgram(**data.dict())
    db.add(prog)
    db.commit()
    db.refresh(prog)

    log_audit(
        db=db,
        action="CREATE_LEARNING_PROGRAM",
        user_id=current_user.id,
        resource_type="LEARNING_PROGRAM",
        resource_id=str(prog.id),
        details={"title": prog.title, "type": prog.program_type},
    )
    return prog
