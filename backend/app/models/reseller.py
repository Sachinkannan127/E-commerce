from datetime import datetime, timezone
from enum import Enum
from typing import Optional, List
from beanie import Document, Indexed, PydanticObjectId
from pydantic import BaseModel, Field


class ResellerStatus(str, Enum):
    ACTIVE = "ACTIVE"
    PAUSED = "PAUSED"
    BLOCKED = "BLOCKED"


class ResellerProfile(Document):
    user_id: Indexed(str, unique=True)
    reseller_code: Indexed(str, unique=True)
    business_name: str
    whatsapp_number: Optional[str] = None
    upi_id: Optional[str] = None
    
    # Earnings and margins in Paise
    total_sales_paise: int = Field(default=0, ge=0)
    total_margin_earned_paise: int = Field(default=0, ge=0)
    withdrawn_margin_paise: int = Field(default=0, ge=0)
    available_margin_paise: int = Field(default=0, ge=0)
    
    total_customers: int = 0
    total_orders: int = 0
    status: ResellerStatus = ResellerStatus.ACTIVE
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "reseller_profiles"
        indexes = [
            "user_id",
            "reseller_code",
            "status",
            "created_at",
        ]


class ResellerSharedCatalog(Document):
    reseller_id: Indexed(str)
    product_id: Indexed(str)
    product_name: str
    product_slug: str
    product_image: Optional[str] = None
    base_price_paise: int
    selling_price_paise: int
    margin_paise: int
    margin_percent: float = 0.0
    custom_notes: Optional[str] = None
    shared_clicks: int = 0
    orders_generated: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "reseller_shared_catalogs"
        indexes = [
            "reseller_id",
            "product_id",
            "created_at",
        ]


class ResellerOrderRecord(Document):
    reseller_id: Indexed(str)
    order_id: Indexed(str)
    order_number: str
    customer_name: str
    customer_phone: str
    product_names: List[str] = []
    base_amount_paise: int
    reseller_selling_amount_paise: int
    margin_earned_paise: int
    payout_status: str = "PENDING"  # PENDING, CREDITED, REFUNDED
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "reseller_order_records"
        indexes = [
            "reseller_id",
            "order_id",
            "payout_status",
            "created_at",
        ]
