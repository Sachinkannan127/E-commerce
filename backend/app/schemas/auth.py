from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from app.models.user import UserRole


class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(default=None, pattern=r"^\+?[1-9]\d{7,14}$")
    password: str = Field(min_length=6, max_length=128)
    role: UserRole = UserRole.CUSTOMER
    referral_code: Optional[str] = None
    
    # Optional seller store name on initial seller register
    store_name: Optional[str] = None


class LoginRequest(BaseModel):
    identifier: str  # Email or Phone
    password: str


class SendOtpRequest(BaseModel):
    destination: str  # Email or phone
    purpose: str = "LOGIN"


class VerifyOtpRequest(BaseModel):
    destination: str
    code: str
    full_name: Optional[str] = None  # For registration via OTP
    referral_code: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: dict


class RefreshTokenRequest(BaseModel):
    refresh_token: Optional[str] = None
