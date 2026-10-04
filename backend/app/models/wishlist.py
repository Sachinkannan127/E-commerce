from datetime import datetime, timezone
from typing import List
from beanie import Document, Indexed, PydanticObjectId
from pydantic import BaseModel, Field


class WishlistItem(BaseModel):
    product_id: PydanticObjectId
    variant_id: Optional[str] = None
    target_price_alert_paise: Optional[int] = None
    added_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Wishlist(Document):
    user_id: Indexed(PydanticObjectId, unique=True)
    items: List[WishlistItem] = Field(default_factory=list)
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "wishlists"
        indexes = [
            "user_id",
            "items.product_id",
        ]
