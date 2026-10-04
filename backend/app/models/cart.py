from datetime import datetime, timezone
from typing import List, Optional
from beanie import Document, Indexed, PydanticObjectId
from pydantic import BaseModel, Field


class CartItem(BaseModel):
    product_id: PydanticObjectId
    variant_id: str
    seller_id: PydanticObjectId
    title: str
    product_slug: str
    image_url: str
    selected_attributes: dict = Field(default_factory=dict)
    quantity: int = Field(default=1, ge=1)
    unit_price_paise: int = Field(ge=0)
    compare_at_price_paise: Optional[int] = None
    is_saved_for_later: bool = False
    added_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Cart(Document):
    user_id: Optional[Indexed(PydanticObjectId, unique=True)] = None
    session_id: Optional[Indexed(str, unique=True)] = None  # Guest session
    items: List[CartItem] = Field(default_factory=list)
    applied_coupon_code: Optional[str] = None
    discount_paise: int = 0
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "carts"
        indexes = [
            "user_id",
            "session_id",
            "updated_at",
        ]
