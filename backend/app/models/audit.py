from datetime import datetime, timezone
from typing import Optional, Dict, Any
from beanie import Document, Indexed, PydanticObjectId
from pydantic import Field


class AuditLog(Document):
    user_id: Optional[Indexed(PydanticObjectId)] = None
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    details: Dict[str, Any] = Field(default_factory=dict)
    
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "audit_logs"
        indexes = [
            "user_id",
            "action",
            "resource_type",
            "timestamp",
        ]


class SearchLog(Document):
    query: Indexed(str)
    user_id: Optional[PydanticObjectId] = None
    result_count: int = 0
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "search_logs"
        indexes = [
            "query",
            "timestamp",
        ]


class RecentlyViewed(Document):
    user_id: Optional[Indexed(PydanticObjectId)] = None
    session_id: Optional[Indexed(str)] = None
    product_id: Indexed(PydanticObjectId)
    viewed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "recently_viewed"
        indexes = [
            "user_id",
            "session_id",
            "viewed_at",
        ]
