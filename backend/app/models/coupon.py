from datetime import datetime, timezone
from enum import Enum
from typing import Optional, List
from beanie import Document, Indexed, PydanticObjectId
from pydantic import Field


class DiscountType(str, Enum):
    PERCENTAGE = "PERCENTAGE"
    FIXED = "FIXED"


class Coupon(Document):
    code: Indexed(str, unique=True)
    description: str
    discount_type: DiscountType = DiscountType.PERCENTAGE
    discount_value: int = Field(gt=0)  # e.g., 15 for 15%, or 10000 for ₹100
    min_cart_value_paise: int = Field(default=0, ge=0)
    max_discount_paise: Optional[int] = None
    
    valid_from: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    valid_until: datetime
    
    usage_limit_total: Optional[int] = None
    usage_limit_per_user: int = 1
    current_usage_count: int = 0
    used_by_user_ids: List[PydanticObjectId] = Field(default_factory=list)
    
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "coupons"
        indexes = [
            "code",
            "is_active",
            "valid_from",
            "valid_until",
        ]
