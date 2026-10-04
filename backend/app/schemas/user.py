from typing import Optional, List
from pydantic import BaseModel, EmailStr
from app.models.user import UserRole
from app.models.address import AddressType


class UserProfileResponse(BaseModel):
    id: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    full_name: str
    avatar_url: Optional[str] = None
    role: UserRole
    wallet_balance_paise: int
    loyalty_points: int
    referral_code: str
    is_active: bool
    is_verified: bool


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    phone: Optional[str] = None


class AddressCreate(BaseModel):
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
    is_default: bool = False


class AddressUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    alternate_phone: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    landmark: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    country: Optional[str] = None
    address_type: Optional[AddressType] = None
    is_default: Optional[bool] = None


class AddressResponse(AddressCreate):
    id: str
    user_id: str
