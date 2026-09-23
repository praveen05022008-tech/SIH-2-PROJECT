import os
import shutil
from typing import List, Optional

from app.config import settings
from app.core.audit import log_audit
from app.core.deps import get_current_user, require_role
from app.database import get_db
from app.models.document import Document, DocumentVerification
from app.models.profile import StudentProfile
from app.models.user import User
from app.schemas.document import DocumentResponse, DocumentVerificationCreate, DocumentVerificationResponse
from app.services.cloudinary_service import upload_file_to_cloudinary
from app.services.notification import send_notification
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import FileResponse, RedirectResponse
from sqlalchemy.orm import Session

router = APIRouter(prefix="/documents", tags=["Document Management & Verification"])

ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg", ".doc", ".docx"}
MAX_FILE_SIZE = 15 * 1024 * 1024  # 15 MB


@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    title: str = Form(...),
    document_type: str = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File extension {ext} not allowed. Supported: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    file_bytes = await file.read()
    file_size = len(file_bytes)
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds maximum permitted 15MB")

    # Always save a local copy in UPLOAD_DIR for instant resilient preview
    safe_filename = f"doc_{current_user.id}_{document_type}_{int(os.times().system)}_{file.filename.replace(' ', '_')}"
    local_file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)
    with open(local_file_path, "wb") as buffer:
        buffer.write(file_bytes)

    # Upload to Cloudinary with user/document namespacing
    folder_name = f"aic_portal/{document_type}s"
    try:
        cloudinary_res = upload_file_to_cloudinary(
            file_bytes_or_buffer=file_bytes, folder=folder_name, resource_type="auto"
        )
        file_url = cloudinary_res["secure_url"]
    except Exception as e:
        file_url = f"/uploads/{safe_filename}"

    doc = Document(
        owner_user_id=current_user.id,
        title=title,
        document_type=document_type,
        file_path=file_url,
        file_size=file_size,
        mime_type=file.content_type or "application/pdf",
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Auto-link to student profile if resume
    if document_type == "resume" and current_user.role == "student":
        student = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
        if student:
            student.resume_url = doc.file_path
            db.commit()

    log_audit(
        db=db,
        action="UPLOAD_DOCUMENT",
        user_id=current_user.id,
        resource_type="DOCUMENT",
        resource_id=str(doc.id),
        details={"filename": file.filename, "type": document_type, "url": doc.file_path},
    )

    return {
        "id": doc.id,
        "owner_user_id": doc.owner_user_id,
        "title": doc.title,
        "document_type": doc.document_type,
        "file_path": doc.file_path,
        "file_size": doc.file_size,
        "mime_type": doc.mime_type,
        "uploaded_at": doc.uploaded_at,
        "verification_status": "pending",
        "verification_remarks": None,
        "owner_name": current_user.username,
    }


@router.get("/{document_id}/file")
def get_document_file(document_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Search if local file exists
    if os.path.exists(settings.UPLOAD_DIR):
        for fname in os.listdir(settings.UPLOAD_DIR):
            if fname.startswith(f"doc_{doc.owner_user_id}_{doc.document_type}") or fname.startswith(
                f"user_{doc.owner_user_id}_"
            ):
                fpath = os.path.join(settings.UPLOAD_DIR, fname)
                if os.path.isfile(fpath):
                    return FileResponse(
                        fpath, media_type=doc.mime_type or "application/pdf", filename=f"{doc.title}.pdf"
                    )

    if doc.file_path.startswith("http"):
        return RedirectResponse(url=doc.file_path)
    elif os.path.exists(os.path.join(settings.UPLOAD_DIR, os.path.basename(doc.file_path))):
        return FileResponse(
            os.path.join(settings.UPLOAD_DIR, os.path.basename(doc.file_path)),
            media_type=doc.mime_type or "application/pdf",
        )
    else:
        raise HTTPException(status_code=404, detail="Document content not available on disk")


@router.get("", response_model=List[DocumentResponse])
def get_documents(
    document_type: Optional[str] = None,
    verification_status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Document)

    if current_user.role == "student":
        query = query.filter(Document.owner_user_id == current_user.id)
    elif current_user.role == "institution":
        # Only students/faculty in their institution
        user_ids = [u.id for u in db.query(User.id).filter(User.institution_id == current_user.institution_id).all()]
        query = query.filter(Document.owner_user_id.in_(user_ids))

    if document_type:
        query = query.filter(Document.document_type == document_type)

    docs = query.order_by(Document.uploaded_at.desc()).all()
    results = []
    for d in docs:
        latest_ver = (
            db.query(DocumentVerification)
            .filter(DocumentVerification.document_id == d.id)
            .order_by(DocumentVerification.verified_at.desc())
            .first()
        )
        v_status = latest_ver.verification_status if latest_ver else "pending"
        v_remarks = latest_ver.remarks if latest_ver else None

        if verification_status and v_status != verification_status:
            continue

        results.append(
            {
                "id": d.id,
                "owner_user_id": d.owner_user_id,
                "title": d.title,
                "document_type": d.document_type,
                "file_path": d.file_path,
                "file_size": d.file_size,
                "mime_type": d.mime_type,
                "uploaded_at": d.uploaded_at,
                "verification_status": v_status,
                "verification_remarks": v_remarks,
                "owner_name": d.owner.username if d.owner else "User",
            }
        )
    return results


@router.post("/verify", response_model=DocumentVerificationResponse)
def verify_document(
    data: DocumentVerificationCreate,
    current_user: User = Depends(require_role(["institution", "admin"])),
    db: Session = Depends(get_db),
):
    doc = db.query(Document).filter(Document.id == data.document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    ver = DocumentVerification(
        document_id=data.document_id,
        verified_by_user_id=current_user.id,
        verification_status=data.verification_status,
        remarks=data.remarks,
    )
    db.add(ver)
    db.commit()
    db.refresh(ver)

    send_notification(
        db=db,
        user_id=doc.owner_user_id,
        title=f"Document Verification: {data.verification_status.capitalize()}",
        message=f"Your document '{doc.title}' has been {data.verification_status}. Remarks: {data.remarks or 'None'}.",
        notification_type="system",
    )

    log_audit(
        db=db,
        action="VERIFY_DOCUMENT",
        user_id=current_user.id,
        resource_type="DOCUMENT",
        resource_id=str(doc.id),
        details={"status": data.verification_status},
    )

    return ver
