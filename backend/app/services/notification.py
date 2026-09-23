import logging
from typing import Optional

from app.models.notification import Notification
from app.models.user import User
from app.services.email_service import send_generic_notification_email
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)


def send_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    notification_type: str = "system",
    link_url: Optional[str] = None,
    send_email: bool = True,
) -> Notification:
    """
    Creates an in-app notification in TiDB and optionally fires a transactional email companion.
    """
    notif = Notification(
        user_id=user_id,
        title=title,
        message=message,
        notification_type=notification_type,
        link_url=link_url,
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)

    if send_email:
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if user and user.email:
                name = user.username
                if user.student_profile and user.student_profile.full_name:
                    name = user.student_profile.full_name
                elif user.faculty_profile and user.faculty_profile.full_name:
                    name = user.faculty_profile.full_name
                elif user.industry_profile and (
                    user.industry_profile.company_name or user.industry_profile.contact_person
                ):
                    name = user.industry_profile.company_name or user.industry_profile.contact_person

                send_generic_notification_email(
                    to_email=user.email,
                    recipient_name=name,
                    title=title,
                    message=message,
                    link_url=link_url,
                )
        except Exception as e:
            logger.warning(f"Failed to dispatch email companion for notification {notif.id}: {e}")

    return notif
