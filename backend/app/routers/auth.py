from fastapi import APIRouter, Response, Request, Depends, status
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    SendOtpRequest,
    VerifyOtpRequest,
    TokenResponse,
    RefreshTokenRequest,
)
from app.schemas.common import APIResponse
from app.services.auth_service import AuthService
from app.middlewares.auth_guard import get_current_user
from app.models.user import User
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])


def set_auth_cookies(response: Response, access_token: str, refresh_token: str):
    is_prod = settings.ENVIRONMENT == "production"
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        secure=is_prod,
        samesite="lax",
        path="/"
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600,
        secure=is_prod,
        samesite="lax",
        path="/"
    )


@router.post("/register", response_model=APIResponse[TokenResponse])
async def register(data: RegisterRequest, response: Response):
    user, access_token, refresh_token = await AuthService.register_user(data)
    set_auth_cookies(response, access_token, refresh_token)
    
    return APIResponse(
        message="Registration successful",
        data=TokenResponse(
            access_token=access_token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user={
                "id": str(user.id),
                "email": user.email,
                "phone": user.phone,
                "full_name": user.full_name,
                "role": user.role.value,
                "referral_code": user.referral_code,
                "wallet_balance_paise": user.wallet_balance_paise,
            }
        )
    )


@router.post("/login", response_model=APIResponse[TokenResponse])
async def login(data: LoginRequest, response: Response):
    user, access_token, refresh_token = await AuthService.authenticate_user(data)
    set_auth_cookies(response, access_token, refresh_token)
    
    return APIResponse(
        message="Login successful",
        data=TokenResponse(
            access_token=access_token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user={
                "id": str(user.id),
                "email": user.email,
                "phone": user.phone,
                "full_name": user.full_name,
                "role": user.role.value,
                "referral_code": user.referral_code,
                "wallet_balance_paise": user.wallet_balance_paise,
            }
        )
    )


@router.post("/otp/send", response_model=APIResponse[dict])
async def send_otp(data: SendOtpRequest):
    code = await AuthService.send_otp(data.destination, data.purpose)
    return APIResponse(
        message=f"OTP sent successfully to {data.destination}",
        data={"destination": data.destination, "dev_otp": code if settings.DEBUG else None}
    )


@router.post("/otp/verify", response_model=APIResponse[TokenResponse])
async def verify_otp(data: VerifyOtpRequest, response: Response):
    user, access_token, refresh_token = await AuthService.verify_otp(
        data.destination, data.code, data.full_name, data.referral_code
    )
    set_auth_cookies(response, access_token, refresh_token)
    
    return APIResponse(
        message="OTP verified successfully",
        data=TokenResponse(
            access_token=access_token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user={
                "id": str(user.id),
                "email": user.email,
                "phone": user.phone,
                "full_name": user.full_name,
                "role": user.role.value,
                "referral_code": user.referral_code,
                "wallet_balance_paise": user.wallet_balance_paise,
            }
        )
    )


@router.post("/refresh", response_model=APIResponse[TokenResponse])
async def refresh_token(request: Request, response: Response, body: Optional[RefreshTokenRequest] = None):
    token = None
    if body and body.refresh_token:
        token = body.refresh_token
    elif "refresh_token" in request.cookies:
        token = request.cookies.get("refresh_token")

    if not token:
        return APIResponse(success=False, message="Refresh token not found", data=None)

    user, new_access, new_refresh = await AuthService.refresh_session(token)
    set_auth_cookies(response, new_access, new_refresh)

    return APIResponse(
        message="Token refreshed successfully",
        data=TokenResponse(
            access_token=new_access,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user={
                "id": str(user.id),
                "email": user.email,
                "phone": user.phone,
                "full_name": user.full_name,
                "role": user.role.value,
                "referral_code": user.referral_code,
                "wallet_balance_paise": user.wallet_balance_paise,
            }
        )
    )


@router.post("/logout", response_model=APIResponse[dict])
async def logout(response: Response):
    response.delete_cookie(key="access_token", path="/")
    response.delete_cookie(key="refresh_token", path="/")
    return APIResponse(message="Logged out successfully", data={"logged_out": True})


@router.get("/me", response_model=APIResponse[dict])
async def get_me(current_user: User = Depends(get_current_user)):
    return APIResponse(
        data={
            "id": str(current_user.id),
            "email": current_user.email,
            "phone": current_user.phone,
            "full_name": current_user.full_name,
            "avatar_url": current_user.avatar_url,
            "role": current_user.role.value,
            "wallet_balance_paise": current_user.wallet_balance_paise,
            "loyalty_points": current_user.loyalty_points,
            "referral_code": current_user.referral_code,
            "is_verified": current_user.is_verified,
        }
    )
