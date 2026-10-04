import random
import string
from datetime import datetime, timezone, timedelta
from typing import Optional, Tuple
from app.core.config import settings
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.core.exceptions import (
    BadRequestException,
    UnauthorizedException,
    ConflictException,
    NotFoundException,
)
from app.models.user import User, UserRole, AuthProvider
from app.models.seller import SellerProfile, SellerStatus
from app.models.otp import OtpCode
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse
from app.core.logging import logger


def generate_referral_code(name: str) -> str:
    cleaned = "".join(filter(str.isalnum, name))[:4].upper()
    rand_chars = "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"{cleaned}{rand_chars}"


class AuthService:
    @staticmethod
    async def register_user(data: RegisterRequest) -> Tuple[User, str, str]:
        if not data.email and not data.phone:
            raise BadRequestException("Either email or phone number is required")

        if data.email:
            existing = await User.find_one(User.email == data.email)
            if existing:
                raise ConflictException("User with this email already exists")

        if data.phone:
            existing = await User.find_one(User.phone == data.phone)
            if existing:
                raise ConflictException("User with this phone number already exists")

        # Generate unique referral code
        referral_code = generate_referral_code(data.full_name)
        while await User.find_one(User.referral_code == referral_code):
            referral_code = generate_referral_code(data.full_name)

        hashed_password = get_password_hash(data.password)

        user = User(
            email=data.email,
            phone=data.phone,
            hashed_password=hashed_password,
            full_name=data.full_name,
            role=data.role,
            referral_code=referral_code,
            referred_by=data.referral_code,
            wallet_balance_paise=5000 if data.referral_code else 0, # ₹50 referral bonus
            loyalty_points=100, # 100 welcome points
            is_active=True,
            is_verified=True if settings.ENVIRONMENT == "development" else False,
        )
        await user.insert()

        # If registered as Seller, create draft SellerProfile
        if data.role == UserRole.SELLER:
            store_name = data.store_name or f"{data.full_name}'s Store"
            store_slug = store_name.lower().replace(" ", "-") + f"-{random.randint(100, 999)}"
            seller_profile = SellerProfile(
                user_id=user.id,
                store_name=store_name,
                store_slug=store_slug,
                status=SellerStatus.PENDING,
            )
            await seller_profile.insert()

        access_token = create_access_token(user.id, user.role.value)
        refresh_token = create_refresh_token(user.id, user.role.value)
        return user, access_token, refresh_token

    @staticmethod
    async def authenticate_user(data: LoginRequest) -> Tuple[User, str, str]:
        user = None
        if "@" in data.identifier:
            user = await User.find_one(User.email == data.identifier)
        else:
            user = await User.find_one(User.phone == data.identifier)

        if not user or not user.hashed_password:
            raise UnauthorizedException("Invalid credentials")

        if not verify_password(data.password, user.hashed_password):
            raise UnauthorizedException("Invalid credentials")

        if not user.is_active or user.is_deleted:
            raise UnauthorizedException("Account is disabled. Please contact support.")

        access_token = create_access_token(user.id, user.role.value)
        refresh_token = create_refresh_token(user.id, user.role.value)
        return user, access_token, refresh_token

    @staticmethod
    async def send_otp(destination: str, purpose: str = "LOGIN") -> str:
        # Generate 6-digit OTP
        code = "".join(random.choices(string.digits, k=6))
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)

        # Invalidate previous OTPs for this destination
        await OtpCode.find(OtpCode.destination == destination).delete()

        otp_record = OtpCode(
            destination=destination,
            code=code,
            purpose=purpose,
            expires_at=expires_at,
        )
        await otp_record.insert()

        # In development / sandbox, log OTP to console
        logger.info(f"Generated OTP for {destination} [{purpose}]: {code}")
        return code

    @staticmethod
    async def verify_otp(
        destination: str,
        code: str,
        full_name: Optional[str] = None,
        referral_code: Optional[str] = None
    ) -> Tuple[User, str, str]:
        # Verification check
        otp_record = await OtpCode.find_one(
            OtpCode.destination == destination,
            OtpCode.code == code
        )
        if not otp_record:
            raise BadRequestException("Invalid or expired OTP")

        # Find or create user
        user = None
        if "@" in destination:
            user = await User.find_one(User.email == destination)
        else:
            user = await User.find_one(User.phone == destination)

        if not user:
            name = full_name or f"User-{random.randint(1000, 9999)}"
            new_ref = generate_referral_code(name)
            user = User(
                email=destination if "@" in destination else None,
                phone=destination if "@" not in destination else None,
                full_name=name,
                role=UserRole.CUSTOMER,
                provider=AuthProvider.PHONE_OTP if "@" not in destination else AuthProvider.LOCAL,
                referral_code=new_ref,
                referred_by=referral_code,
                is_active=True,
                is_verified=True,
            )
            await user.insert()
        else:
            user.is_verified = True
            await user.save()

        await otp_record.delete()

        access_token = create_access_token(user.id, user.role.value)
        refresh_token = create_refresh_token(user.id, user.role.value)
        return user, access_token, refresh_token

    @staticmethod
    async def refresh_session(refresh_token: str) -> Tuple[User, str, str]:
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise UnauthorizedException("Invalid refresh token")

        user_id = payload.get("sub")
        user = await User.get(user_id)
        if not user or not user.is_active:
            raise UnauthorizedException("User no longer active")

        new_access = create_access_token(user.id, user.role.value)
        new_refresh = create_refresh_token(user.id, user.role.value)
        return user, new_access, new_refresh
