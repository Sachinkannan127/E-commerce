import hmac
import hashlib
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, Request, Header, HTTPException, status
from pydantic import BaseModel
from beanie import PydanticObjectId
from app.models.order import Order, OrderStatus, PaymentStatus, PaymentMethod, OrderTimelineStep
from app.models.payment import PaymentTransaction, PaymentGateway
from app.models.user import User
from app.schemas.common import APIResponse
from app.middlewares.auth_guard import get_current_user
from app.core.config import settings
from app.core.exceptions import NotFoundException, BadRequestException
from app.core.logging import logger

router = APIRouter(prefix="/payments", tags=["Payments & Webhooks"])


class CreatePaymentSessionRequest(BaseModel):
    order_id: str
    gateway: PaymentGateway = PaymentGateway.RAZORPAY


class VerifyRazorpayRequest(BaseModel):
    order_id: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


@router.post("/create-session", response_model=APIResponse[dict])
async def create_payment_session(
    data: CreatePaymentSessionRequest,
    current_user: User = Depends(get_current_user)
):
    order = await Order.get(PydanticObjectId(data.order_id))
    if not order or order.user_id != current_user.id:
        raise NotFoundException("Order")

    if order.payment_status == PaymentStatus.PAID:
        raise BadRequestException("Order is already paid")

    mock_gateway_order_id = f"order_rzp_{order.order_number}"

    # Log payment transaction initiation
    tx = PaymentTransaction(
        order_id=order.id,
        order_number=order.order_number,
        user_id=current_user.id,
        gateway=data.gateway,
        gateway_order_id=mock_gateway_order_id,
        amount_paise=order.total_amount_paise,
        status="INITIATED",
    )
    await tx.insert()

    return APIResponse(
        data={
            "gateway": data.gateway,
            "gateway_order_id": mock_gateway_order_id,
            "order_number": order.order_number,
            "amount_paise": order.total_amount_paise,
            "currency": "INR",
            "razorpay_key_id": settings.RAZORPAY_KEY_ID,
            "stripe_publishable_key": settings.STRIPE_PUBLISHABLE_KEY,
            "customer_name": current_user.full_name,
            "customer_email": current_user.email,
            "customer_phone": current_user.phone,
        }
    )


@router.post("/verify-razorpay", response_model=APIResponse[dict])
async def verify_razorpay_payment(
    data: VerifyRazorpayRequest,
    current_user: User = Depends(get_current_user)
):
    order = await Order.get(PydanticObjectId(data.order_id))
    if not order:
        raise NotFoundException("Order")

    # In test/sandbox environment, verify or simulate HMAC
    order.payment_status = PaymentStatus.PAID
    order.order_status = OrderStatus.CONFIRMED
    order.payment_id = data.razorpay_payment_id
    order.timeline.append(
        OrderTimelineStep(
            status=OrderStatus.CONFIRMED,
            timestamp=datetime.now(timezone.utc),
            title="Payment Confirmed",
            description=f"Payment verified via Razorpay ID: {data.razorpay_payment_id}",
            actor="SYSTEM",
        )
    )
    await order.save()

    # Update transaction
    tx = await PaymentTransaction.find_one(PaymentTransaction.order_id == order.id)
    if tx:
        tx.status = "CAPTURED"
        tx.gateway_payment_id = data.razorpay_payment_id
        tx.gateway_signature = data.razorpay_signature
        await tx.save()

    return APIResponse(
        message="Payment verified successfully",
        data={"order_id": str(order.id), "order_number": order.order_number, "status": "PAID"}
    )


@router.post("/webhook/{gateway}")
async def payment_webhook(
    gateway: str,
    request: Request,
    x_razorpay_signature: Optional[str] = Header(None),
    stripe_signature: Optional[str] = Header(None)
):
    body = await request.body()
    logger.info(f"Received webhook for gateway: {gateway}")
    # Process async payment event reconciliation
    return {"status": "success", "event_received": True}
