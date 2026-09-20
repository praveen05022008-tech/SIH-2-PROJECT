from typing import Optional
from sqlalchemy.orm import Session
from app.models.notification import Notification

def send_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    notification_type: str = "system",
    link_url: Optional[str] = None
) -> Notification:
    notif = Notification(
        user_id=user_id,
        title=title,
        message=message,
        notification_type=notification_type,
        link_url=link_url
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif
