from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional
from beanie import Document, Indexed, PydanticObjectId
from pydantic import BaseModel, Field
from app.models.address import AddressSnapshot


class OrderStatus(str, Enum):
    PLACED = "PLACED"
    CONFIRMED = "CONFIRMED"
    PACKED = "PACKED"
    SHIPPED = "SHIPPED"
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"
    RETURN_REQUESTED = "RETURN_REQUESTED"
    RETURNED = "RETURNED"


class PaymentStatus(str, Enum):
    PENDING = "PENDING"
    AUTHORIZED = "AUTHORIZED"
    PAID = "PAID"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"


class PaymentMethod(str, Enum):
    COD = "COD"
    RAZORPAY = "RAZORPAY"
    STRIPE = "STRIPE"
    WALLET = "WALLET"


class OrderTimelineStep(BaseModel):
    status: OrderStatus
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    title: str
    description: Optional[str] = None
    actor: str = "SYSTEM"  # SYSTEM, SELLER, CUSTOMER, ADMIN


class OrderItem(BaseModel):
    product_id: PydanticObjectId
    variant_id: str
    seller_id: PydanticObjectId
    title: str
    product_slug: str
    image_url: str
    attributes: dict = Field(default_factory=dict)
    quantity: int = Field(ge=1)
    unit_price_paise: int = Field(ge=0)
    total_price_paise: int = Field(ge=0)
    seller_commission_paise: int = Field(default=0, ge=0)
    seller_payout_paise: int = Field(default=0, ge=0)
    status: OrderStatus = OrderStatus.PLACED


class ReturnRequest(BaseModel):
    reason: str
    comments: Optional[str] = None
    photos: List[str] = Field(default_factory=list)
    requested_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = "PENDING"  # PENDING, APPROVED, REJECTED, REFUNDED
    refund_amount_paise: int = 0


class Order(Document):
    order_number: Indexed(str, unique=True)
    user_id: Indexed(PydanticObjectId)
    
    # Snapshots of delivery addresses
    shipping_address: AddressSnapshot
    billing_address: Optional[AddressSnapshot] = None
    
    items: List[OrderItem] = Field(default_factory=list)
    
    # Financial breakdown (in paise)
    subtotal_paise: int = Field(ge=0)
    shipping_fee_paise: int = Field(default=0, ge=0)
    tax_paise: int = Field(default=0, ge=0)
    discount_paise: int = Field(default=0, ge=0)
    coupon_code: Optional[str] = None
    total_amount_paise: int = Field(ge=0)
    
    # Payment info
    payment_method: PaymentMethod = PaymentMethod.COD
    payment_status: PaymentStatus = PaymentStatus.PENDING
    payment_id: Optional[str] = None
    
    # Order Status & Tracking
    order_status: OrderStatus = OrderStatus.PLACED
    timeline: List[OrderTimelineStep] = Field(default_factory=list)
    return_request: Optional[ReturnRequest] = None
    
    # Reseller metadata (Meesho style)
    is_reseller_order: bool = False
    reseller_id: Optional[PydanticObjectId] = None
    reseller_margin_paise: int = 0

    invoice_url: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "orders"
        indexes = [
            "order_number",
            "user_id",
            "order_status",
            "payment_status",
            "created_at",
            "items.seller_id",
        ]
