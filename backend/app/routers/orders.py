from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query, status
from pydantic import BaseModel
from beanie import PydanticObjectId
from app.models.order import Order, OrderStatus, PaymentStatus, OrderTimelineStep
from app.models.user import User
from app.schemas.cart_and_order import OrderResponse
from app.schemas.common import APIResponse, PaginatedResponse
from app.middlewares.auth_guard import get_current_user
from app.core.exceptions import NotFoundException, BadRequestException, ForbiddenException

router = APIRouter(prefix="/orders", tags=["Orders"])


class CancelOrderRequest(BaseModel):
    reason: str


@router.get("", response_model=APIResponse[PaginatedResponse[OrderResponse]])
async def list_user_orders(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user)
):
    query = Order.find(Order.user_id == current_user.id).sort(-Order.created_at)
    total = await query.count()
    skip = (page - 1) * limit
    orders = await query.skip(skip).limit(limit).to_list()

    items = [
        OrderResponse(
            id=str(o.id),
            order_number=o.order_number,
            order_status=o.order_status,
            payment_status=o.payment_status,
            payment_method=o.payment_method,
            total_amount_paise=o.total_amount_paise,
            items_count=len(o.items),
            created_at=o.created_at.strftime("%d %b %Y, %I:%M %p"),
            shipping_address=o.shipping_address,
            items=[i.model_dump() for i in o.items],
            timeline=[t.model_dump() for t in o.timeline],
            invoice_url=o.invoice_url,
        )
        for o in orders
    ]

    total_pages = (total + limit - 1) // limit if limit > 0 else 1
    return APIResponse(
        data=PaginatedResponse(
            items=items,
            total=total,
            page=page,
            limit=limit,
            total_pages=total_pages,
            has_next=page < total_pages,
            has_prev=page > 1,
        )
    )


@router.get("/{order_id}", response_model=APIResponse[OrderResponse])
async def get_order_detail(
    order_id: str,
    current_user: User = Depends(get_current_user)
):
    order = None
    if len(order_id) == 24:
        order = await Order.get(PydanticObjectId(order_id))
    if not order:
        order = await Order.find_one(Order.order_number == order_id)

    if not order:
        raise NotFoundException("Order")

    if order.user_id != current_user.id and current_user.role != "ADMIN":
        raise ForbiddenException("Cannot view this order")

    return APIResponse(
        data=OrderResponse(
            id=str(order.id),
            order_number=order.order_number,
            order_status=order.order_status,
            payment_status=order.payment_status,
            payment_method=order.payment_method,
            total_amount_paise=order.total_amount_paise,
            items_count=len(order.items),
            created_at=order.created_at.strftime("%d %b %Y, %I:%M %p"),
            shipping_address=order.shipping_address,
            items=[i.model_dump() for i in order.items],
            timeline=[t.model_dump() for t in order.timeline],
            invoice_url=order.invoice_url,
        )
    )


@router.post("/{order_id}/cancel", response_model=APIResponse[OrderResponse])
async def cancel_order(
    order_id: str,
    data: CancelOrderRequest,
    current_user: User = Depends(get_current_user)
):
    order = await Order.get(PydanticObjectId(order_id))
    if not order:
        order = await Order.find_one(Order.order_number == order_id)

    if not order:
        raise NotFoundException("Order")

    if order.user_id != current_user.id:
        raise ForbiddenException("Cannot cancel this order")

    if order.order_status in [OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.CANCELLED]:
        raise BadRequestException(f"Order cannot be cancelled in status '{order.order_status}'")

    order.order_status = OrderStatus.CANCELLED
    order.timeline.append(
        OrderTimelineStep(
            status=OrderStatus.CANCELLED,
            timestamp=datetime.now(timezone.utc),
            title="Order Cancelled",
            description=f"Reason: {data.reason}",
            actor="CUSTOMER",
        )
    )
    await order.save()

    return APIResponse(
        message="Order cancelled successfully",
        data=OrderResponse(
            id=str(order.id),
            order_number=order.order_number,
            order_status=order.order_status,
            payment_status=order.payment_status,
            payment_method=order.payment_method,
            total_amount_paise=order.total_amount_paise,
            items_count=len(order.items),
            created_at=order.created_at.strftime("%d %b %Y, %I:%M %p"),
            shipping_address=order.shipping_address,
            items=[i.model_dump() for i in order.items],
            timeline=[t.model_dump() for t in order.timeline],
            invoice_url=order.invoice_url,
        )
    )
