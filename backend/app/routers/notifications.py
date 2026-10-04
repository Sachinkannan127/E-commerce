from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from beanie import PydanticObjectId
from app.models.notification import InAppNotification, NotificationType
from app.models.user import User
from app.schemas.common import APIResponse
from app.middlewares.auth_guard import get_current_user
from app.core.exceptions import NotFoundException

router = APIRouter(prefix="/notifications", tags=["Notifications"])


class NotificationResponse(BaseModel):
    id: str
    title: str
    message: str
    notification_type: NotificationType
    link_url: str = None
    is_read: bool
    created_at: str


@router.get("", response_model=APIResponse[List[NotificationResponse]])
async def list_notifications(current_user: User = Depends(get_current_user)):
    notifs = await InAppNotification.find(
        InAppNotification.user_id == current_user.id
    ).sort(-InAppNotification.created_at).limit(30).to_list()

    items = [
        NotificationResponse(
            id=str(n.id),
            title=n.title,
            message=n.message,
            notification_type=n.notification_type,
            link_url=n.link_url,
            is_read=n.is_read,
            created_at=n.created_at.strftime("%d %b, %I:%M %p"),
        )
        for n in notifs
    ]
    return APIResponse(data=items)


@router.put("/{notification_id}/read", response_model=APIResponse[dict])
async def mark_notification_read(
    notification_id: str,
    current_user: User = Depends(get_current_user)
):
    notif = await InAppNotification.get(PydanticObjectId(notification_id))
    if not notif or notif.user_id != current_user.id:
        raise NotFoundException("Notification")

    notif.is_read = True
    await notif.save()
    return APIResponse(message="Notification marked as read", data={"read": True})


@router.put("/read-all", response_model=APIResponse[dict])
async def mark_all_notifications_read(current_user: User = Depends(get_current_user)):
    await InAppNotification.find(
        InAppNotification.user_id == current_user.id,
        InAppNotification.is_read == False
    ).update({"$set": {"is_read": True}})

    return APIResponse(message="All notifications marked as read", data={"read_all": True})
