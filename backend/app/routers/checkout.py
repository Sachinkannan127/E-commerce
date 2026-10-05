from typing import Optional
from fastapi import APIRouter, Depends
from app.schemas.cart_and_order import (
    CheckoutSummaryRequest,
    CheckoutSummaryResponse,
    CreateOrderRequest,
    OrderResponse,
)
from app.schemas.common import APIResponse
from app.services.checkout_service import CheckoutService
from app.middlewares.auth_guard import get_current_user, get_current_user_optional
from app.models.user import User

router = APIRouter(prefix="/checkout", tags=["Checkout"])


@router.post("/summary", response_model=APIResponse[CheckoutSummaryResponse])
async def get_checkout_summary(
    data: CheckoutSummaryRequest,
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    summary = await CheckoutService.get_checkout_summary(
        user=current_user,
        address_id=data.address_id,
        coupon_code=data.coupon_code
    )
    return APIResponse(data=summary)


@router.post("/place-order", response_model=APIResponse[OrderResponse])
async def place_order(
    data: CreateOrderRequest,
    current_user: User = Depends(get_current_user)
):
    order = await CheckoutService.create_order(user=current_user, data=data)
    return APIResponse(
        message="Order placed successfully!",
        data=order
    )
