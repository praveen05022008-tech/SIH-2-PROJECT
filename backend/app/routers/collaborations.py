from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.collaboration import Collaboration
from app.schemas.collaboration import CollaborationCreate, CollaborationStatusUpdate, CollaborationResponse
from app.core.deps import get_current_user, require_role
from app.core.audit import log_audit
from app.services.notification import send_notification

router = APIRouter(prefix="/collaborations", tags=["Academia-Industry Collaboration"])

@router.get("", response_model=List[CollaborationResponse])
def get_collaborations(
    collaboration_type: Optional[str] = None,
    status_filter: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Collaboration)
    
    if current_user.role == "institution" and current_user.institution_id:
        query = query.filter(
            (Collaboration.initiator_user_id == current_user.id) |
            (Collaboration.partner_institution_id == current_user.institution_id)
        )
    elif current_user.role == "industry":
        ind_id = current_user.industry_profile.id if current_user.industry_profile else None
        query = query.filter(
            (Collaboration.initiator_user_id == current_user.id) |
            (Collaboration.partner_industry_id == ind_id)
        )
    elif current_user.role == "faculty":
        query = query.filter(
            (Collaboration.initiator_user_id == current_user.id) |
            (Collaboration.partner_institution_id == current_user.institution_id)
        )
        
    if collaboration_type:
        query = query.filter(Collaboration.collaboration_type == collaboration_type)
    if status_filter:
        query = query.filter(Collaboration.status == status_filter)
        
    collabs = query.order_by(Collaboration.created_at.desc()).all()
    results = []
    for c in collabs:
        init_name = c.initiator.username if c.initiator else "User"
        inst_name = c.partner_institution.name if c.partner_institution else None
        comp_name = c.partner_industry.company_name if c.partner_industry else None
        results.append({
            "id": c.id,
            "initiator_user_id": c.initiator_user_id,
            "partner_institution_id": c.partner_institution_id,
            "partner_industry_id": c.partner_industry_id,
            "collaboration_type": c.collaboration_type,
            "title": c.title,
            "description": c.description,
            "status": c.status,
            "terms": c.terms,
            "start_date": c.start_date,
            "end_date": c.end_date,
            "created_at": c.created_at,
            "updated_at": c.updated_at,
            "initiator_name": init_name,
            "partner_institution_name": inst_name,
            "partner_company_name": comp_name
        })
    return results

@router.post("", response_model=CollaborationResponse, status_code=status.HTTP_201_CREATED)
def create_collaboration_proposal(
    data: CollaborationCreate,
    current_user: User = Depends(require_role(["industry", "institution", "faculty", "admin"])),
    db: Session = Depends(get_db)
):
    collab = Collaboration(**data.dict(), initiator_user_id=current_user.id, status="proposed")
    db.add(collab)
    db.commit()
    db.refresh(collab)
    
    # Notify partner institution if targeted
    if collab.partner_institution_id:
        inst_users = db.query(User).filter(
            User.institution_id == collab.partner_institution_id,
            User.role == "institution"
        ).all()
        for u in inst_users:
            send_notification(
                db=db,
                user_id=u.id,
                title="New Collaboration Proposal",
                message=f"Received a new collaboration proposal: '{collab.title}'.",
                notification_type="collaboration",
                link_url="/institution/collaborations"
            )
            
    log_audit(
        db=db,
        action="CREATE_COLLABORATION",
        user_id=current_user.id,
        resource_type="COLLABORATION",
        resource_id=str(collab.id),
        details={"title": collab.title, "type": collab.collaboration_type}
    )
    
    return {
        "id": collab.id,
        "initiator_user_id": collab.initiator_user_id,
        "partner_institution_id": collab.partner_institution_id,
        "partner_industry_id": collab.partner_industry_id,
        "collaboration_type": collab.collaboration_type,
        "title": collab.title,
        "description": collab.description,
        "status": collab.status,
        "terms": collab.terms,
        "start_date": collab.start_date,
        "end_date": collab.end_date,
        "created_at": collab.created_at,
        "updated_at": collab.updated_at,
        "initiator_name": current_user.username
    }

@router.put("/{collaboration_id}/status", response_model=CollaborationResponse)
def update_collaboration_status(
    collaboration_id: int,
    data: CollaborationStatusUpdate,
    current_user: User = Depends(require_role(["industry", "institution", "admin"])),
    db: Session = Depends(get_db)
):
    c = db.query(Collaboration).filter(Collaboration.id == collaboration_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Collaboration not found")
        
    c.status = data.status
    db.commit()
    db.refresh(c)
    
    send_notification(
        db=db,
        user_id=c.initiator_user_id,
        title=f"Collaboration Proposal {data.status.capitalize()}",
        message=f"Your collaboration proposal '{c.title}' status was updated to '{data.status}'.",
        notification_type="collaboration"
    )
    
    return {
        "id": c.id,
        "initiator_user_id": c.initiator_user_id,
        "partner_institution_id": c.partner_institution_id,
        "partner_industry_id": c.partner_industry_id,
        "collaboration_type": c.collaboration_type,
        "title": c.title,
        "description": c.description,
        "status": c.status,
        "terms": c.terms,
        "start_date": c.start_date,
        "end_date": c.end_date,
        "created_at": c.created_at,
        "updated_at": c.updated_at
    }
