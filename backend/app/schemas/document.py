from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

class DocumentResponse(BaseModel):
    id: int
    owner_user_id: int
    title: str
    document_type: str
    file_path: str
    file_size: int
    mime_type: str
    uploaded_at: datetime
    verification_status: Optional[str] = "pending"
    verification_remarks: Optional[str] = None
    owner_name: Optional[str] = None
    class Config:
        from_attributes = True

class DocumentVerificationCreate(BaseModel):
    document_id: int
    verification_status: str  # verified, rejected
    remarks: Optional[str] = None

class DocumentVerificationResponse(BaseModel):
    id: int
    document_id: int
    verified_by_user_id: int
    verification_status: str
    remarks: Optional[str] = None
    verified_at: datetime
    class Config:
        from_attributes = True
