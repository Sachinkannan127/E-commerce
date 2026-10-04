from datetime import datetime, timezone
from enum import Enum
from typing import Optional
from beanie import Document, Indexed, PydanticObjectId
from pydantic import BaseModel, Field


class SellerStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    SUSPENDED = "SUSPENDED"


class BankDetails(BaseModel):
    account_holder_name: str
    account_number: str
    ifsc_code: str
    bank_name: str
    upi_id: Optional[str] = None


class SellerProfile(Document):
    user_id: Indexed(PydanticObjectId, unique=True)
    store_name: Indexed(str, unique=True)
    store_slug: Indexed(str, unique=True)
    store_description: Optional[str] = None
    store_logo_url: Optional[str] = None
    store_banner_url: Optional[str] = None
    
    # KYC Details
    gst_number: Optional[str] = None
    pan_number: Optional[str] = None
    pickup_address: Optional[dict] = None
    bank_details: Optional[BankDetails] = None
    
    # Platform status & financials
    status: SellerStatus = SellerStatus.PENDING
    commission_rate_pct: float = Field(default=8.0, ge=0.0, le=100.0)
    pending_payout_paise: int = Field(default=0, ge=0)
    lifetime_earnings_paise: int = Field(default=0, ge=0)
    
    # Metrics
    total_orders_fulfilled: int = 0
    avg_seller_rating: float = 0.0

    is_deleted: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "sellers"
        indexes = [
            "user_id",
            "store_name",
            "store_slug",
            "status",
            "created_at",
        ]
