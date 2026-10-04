from datetime import datetime, timezone
from enum import Enum
from typing import Optional
from beanie import Document, Indexed, PydanticObjectId
from pydantic import Field


class PayoutStatus(str, Enum):
    REQUESTED = "REQUESTED"
    PROCESSING = "PROCESSING"
    PAID = "PAID"
    REJECTED = "REJECTED"


class SellerPayout(Document):
    seller_id: Indexed(PydanticObjectId)
    amount_paise: int = Field(gt=0)
    status: PayoutStatus = PayoutStatus.REQUESTED
    payout_method: str = "BANK_TRANSFER"
    reference_id: Optional[str] = None
    admin_notes: Optional[str] = None
    
    requested_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    processed_at: Optional[datetime] = None

    class Settings:
        name = "seller_payouts"
        indexes = [
            "seller_id",
            "status",
            "requested_at",
        ]
