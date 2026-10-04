from datetime import datetime, timezone
from enum import Enum
from typing import Optional, Dict, Any
from beanie import Document, Indexed, PydanticObjectId
from pydantic import Field


class NotificationType(str, Enum):
    ORDER_STATUS = "ORDER_STATUS"
    PRICE_DROP = "PRICE_DROP"
    PROMOTION = "PROMOTION"
    WALLET = "WALLET"
    SYSTEM = "SYSTEM"


class InAppNotification(Document):
    user_id: Indexed(PydanticObjectId)
    title: str
    message: str
    notification_type: NotificationType = NotificationType.SYSTEM
    link_url: Optional[str] = None
    is_read: bool = False
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "notifications"
        indexes = [
            "user_id",
            "is_read",
            "created_at",
        ]
