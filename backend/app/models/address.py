from datetime import datetime, timezone
from enum import Enum
from typing import Optional
from beanie import Document, Indexed, PydanticObjectId
from pydantic import BaseModel, Field


class AddressType(str, Enum):
    HOME = "HOME"
    WORK = "WORK"
    OTHER = "OTHER"


class AddressSnapshot(BaseModel):
    full_name: str
    phone: str
    alternate_phone: Optional[str] = None
    address_line1: str
    address_line2: Optional[str] = None
    landmark: Optional[str] = None
    city: str
    state: str
    pincode: str
    country: str = "India"
    address_type: AddressType = AddressType.HOME


class Address(Document, AddressSnapshot):
    user_id: Indexed(PydanticObjectId)
    is_default: bool = False
    is_deleted: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "addresses"
        indexes = [
            "user_id",
            "pincode",
            "is_default",
        ]
