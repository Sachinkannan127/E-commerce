from datetime import datetime, timezone
from typing import List, Optional
from beanie import Document, Indexed, PydanticObjectId
from pydantic import Field


class Review(Document):
    product_id: Indexed(PydanticObjectId)
    user_id: Indexed(PydanticObjectId)
    user_name: str
    user_avatar: Optional[str] = None
    rating: Indexed(int) = Field(ge=1, le=5)
    title: str
    comment: str
    photos: List[str] = Field(default_factory=list)
    is_verified_purchase: bool = True
    helpful_votes: int = 0
    voted_user_ids: List[PydanticObjectId] = Field(default_factory=list)
    
    is_approved: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "reviews"
        indexes = [
            "product_id",
            "user_id",
            "rating",
            "created_at",
        ]
