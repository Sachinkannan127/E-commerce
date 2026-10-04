from datetime import datetime, timezone
from enum import Enum
from typing import Optional, List
from beanie import Document, Indexed
from pydantic import BaseModel, EmailStr, Field


class UserRole(str, Enum):
    GUEST = "GUEST"
    CUSTOMER = "CUSTOMER"
    SELLER = "SELLER"
    ADMIN = "ADMIN"


class AuthProvider(str, Enum):
    LOCAL = "LOCAL"
    GOOGLE = "GOOGLE"
    PHONE_OTP = "PHONE_OTP"


class User(Document):
    email: Optional[Indexed(EmailStr, unique=True)] = None
    phone: Optional[Indexed(str, unique=True)] = None
    hashed_password: Optional[str] = None
    full_name: str
    avatar_url: Optional[str] = None
    role: UserRole = UserRole.CUSTOMER
    provider: AuthProvider = AuthProvider.LOCAL
    google_id: Optional[str] = None
    
    # Customer wallet & loyalty points
    wallet_balance_paise: int = Field(default=0, ge=0)
    loyalty_points: int = Field(default=0, ge=0)
    referral_code: Indexed(str, unique=True)
    referred_by: Optional[str] = None

    # Account status & timestamps
    is_active: bool = True
    is_verified: bool = False
    is_deleted: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "users"
        indexes = [
            "email",
            "phone",
            "role",
            "referral_code",
            "is_active",
            "created_at",
        ]
