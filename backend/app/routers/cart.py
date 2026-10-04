from typing import Optional
from fastapi import APIRouter, Depends, Request, Response, status
from app.schemas.cart_and_order import (
    CartResponse,
    AddToCartRequest,
    UpdateCartItemRequest,
    ApplyCouponRequest,
)
from app.schemas.common import APIResponse
from app.services.cart_service import CartService
from app.middlewares.auth_guard import get_current_user_optional, get_current_user
from app.models.user import User

router = APIRouter(prefix="/cart", tags=["Cart"])


def get_session_id(request: Request, response: Response) -> str:
    session_id = request.cookies.get("cart_session_id")
    if not session_id:
        import uuid
        session_id = str(uuid.uuid4())
        response.set_cookie(
            key="cart_session_id",
            value=session_id,
            max_age=30 * 24 * 3600,
            httponly=True,
            path="/"
        )
    return session_id


@router.get("", response_model=APIResponse[CartResponse])
async def get_cart(
    request: Request,
    response: Response,
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    session_id = get_session_id(request, response)
    cart = await CartService.get_cart_response(user=current_user, session_id=session_id)
    return APIResponse(data=cart)


@router.post("/items", response_model=APIResponse[CartResponse])
async def add_item(
    data: AddToCartRequest,
    request: Request,
    response: Response,
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    session_id = get_session_id(request, response)
    cart = await CartService.add_item(
        product_id=data.product_id,
        variant_id=data.variant_id,
        quantity=data.quantity,
        selected_attributes=data.selected_attributes,
        user=current_user,
        session_id=session_id,
    )
    return APIResponse(message="Item added to cart", data=cart)


@router.put("/items/{variant_id}", response_model=APIResponse[CartResponse])
async def update_item_quantity(
    variant_id: str,
    data: UpdateCartItemRequest,
    request: Request,
    response: Response,
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    session_id = get_session_id(request, response)
    cart = await CartService.update_item_quantity(
        variant_id=variant_id,
        quantity=data.quantity,
        user=current_user,
        session_id=session_id,
    )
    return APIResponse(message="Cart updated", data=cart)


@router.delete("/items/{variant_id}", response_model=APIResponse[CartResponse])
async def remove_item(
    variant_id: str,
    request: Request,
    response: Response,
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    session_id = get_session_id(request, response)
    cart = await CartService.remove_item(
        variant_id=variant_id,
        user=current_user,
        session_id=session_id,
    )
    return APIResponse(message="Item removed from cart", data=cart)


@router.post("/save-for-later/{variant_id}", response_model=APIResponse[CartResponse])
async def toggle_save_for_later(
    variant_id: str,
    request: Request,
    response: Response,
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    session_id = get_session_id(request, response)
    cart = await CartService.toggle_save_for_later(
        variant_id=variant_id,
        user=current_user,
        session_id=session_id,
    )
    return APIResponse(data=cart)


@router.post("/apply-coupon", response_model=APIResponse[CartResponse])
async def apply_coupon(
    data: ApplyCouponRequest,
    request: Request,
    response: Response,
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    session_id = get_session_id(request, response)
    cart = await CartService.apply_coupon(
        coupon_code=data.coupon_code,
        user=current_user,
        session_id=session_id,
    )
    return APIResponse(message=f"Coupon '{data.coupon_code.upper()}' applied successfully!", data=cart)


@router.delete("/remove-coupon", response_model=APIResponse[CartResponse])
async def remove_coupon(
    request: Request,
    response: Response,
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    session_id = get_session_id(request, response)
    cart = await CartService.remove_coupon(user=current_user, session_id=session_id)
    return APIResponse(message="Coupon removed", data=cart)


@router.post("/merge", response_model=APIResponse[CartResponse])
async def merge_cart(
    request: Request,
    current_user: User = Depends(get_current_user)
):
    session_id = request.cookies.get("cart_session_id")
    if not session_id:
        cart = await CartService.get_cart_response(user=current_user)
        return APIResponse(data=cart)

    cart = await CartService.merge_guest_cart(session_id=session_id, user=current_user)
    return APIResponse(message="Cart merged successfully", data=cart)
