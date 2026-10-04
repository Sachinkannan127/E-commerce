from datetime import datetime, timezone
from enum import Enum
from typing import Optional, Dict, Any
from beanie import Document, Indexed, PydanticObjectId
from pydantic import BaseModel, Field


class PaymentGateway(str, Enum):
    RAZORPAY = "RAZORPAY"
    STRIPE = "STRIPE"
    COD = "COD"
    WALLET = "WALLET"


class PaymentTransaction(Document):
    order_id: Indexed(PydanticObjectId)
    order_number: str
    user_id: Indexed(PydanticObjectId)
    gateway: PaymentGateway
    gateway_order_id: Optional[str] = None
    gateway_payment_id: Optional[Indexed(str, unique=True)] = None
    gateway_signature: Optional[str] = None
    
    amount_paise: int = Field(ge=0)
    currency: str = "INR"
    status: str = "PENDING"  # PENDING, CAPTURED, FAILED, REFUNDED
    
    error_code: Optional[str] = None
    error_description: Optional[str] = None
    raw_response: Optional[Dict[str, Any]] = None

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "payments"
        indexes = [
            "order_id",
            "order_number",
            "user_id",
            "gateway_payment_id",
            "status",
            "created_at",
        ]
