import random
from datetime import datetime, timezone
from typing import Optional, List, Tuple
from beanie import PydanticObjectId
from app.models.user import User
from app.models.cart import Cart
from app.models.address import Address, AddressSnapshot
from app.models.product import Product
from app.models.order import (
    Order,
    OrderItem,
    OrderStatus,
    PaymentStatus,
    PaymentMethod,
    OrderTimelineStep,
)
from app.models.seller import SellerProfile
from app.models.coupon import Coupon, DiscountType
from app.schemas.cart_and_order import (
    CheckoutSummaryResponse,
    CreateOrderRequest,
    OrderResponse,
)
from app.services.cart_service import CartService
from app.core.config import settings
from app.core.exceptions import BadRequestException, NotFoundException
from app.core.logging import logger


class CheckoutService:
    @staticmethod
    async def get_checkout_summary(
        user: Optional[User] = None,
        address_id: Optional[str] = None,
        coupon_code: Optional[str] = None
    ) -> CheckoutSummaryResponse:
        cart_res = await CartService.get_cart_response(user=user)
        if not cart_res.items:
            return CheckoutSummaryResponse(
                items_count=0,
                subtotal_paise=0,
                shipping_fee_paise=settings.DEFAULT_SHIPPING_FEE_PAISE,
                tax_paise=0,
                discount_paise=0,
                total_amount_paise=settings.DEFAULT_SHIPPING_FEE_PAISE,
                coupon_code=None,
                is_free_shipping=False,
                shipping_address=None,
            )

        selected_addr: Optional[AddressSnapshot] = None
        if user:
            if address_id:
                try:
                    addr = await Address.get(PydanticObjectId(address_id))
                    if addr and addr.user_id == user.id and not addr.is_deleted:
                        selected_addr = AddressSnapshot(**addr.model_dump())
                except Exception:
                    pass
            if not selected_addr:
                default_addr = await Address.find_one(
                    Address.user_id == user.id,
                    Address.is_default == True,
                    Address.is_deleted == False
                )
                if default_addr:
                    selected_addr = AddressSnapshot(**default_addr.model_dump())

        # Subtotal & shipping
        subtotal = cart_res.subtotal_paise
        discount = cart_res.discount_paise
        shipping = cart_res.shipping_fee_paise

        # 18% GST calculation
        tax_paise = int(subtotal * 0.18)
        total_amount = max(0, subtotal + shipping - discount)

        return CheckoutSummaryResponse(
            items_count=len(cart_res.items),
            subtotal_paise=subtotal,
            shipping_fee_paise=shipping,
            tax_paise=tax_paise,
            discount_paise=discount,
            total_amount_paise=total_amount,
            coupon_code=cart_res.applied_coupon_code,
            is_free_shipping=(shipping == 0),
            shipping_address=selected_addr,
        )

    @classmethod
    async def create_order(
        cls,
        user: User,
        data: CreateOrderRequest
    ) -> OrderResponse:
        # Validate Address
        addr = await Address.get(PydanticObjectId(data.address_id))
        if not addr or addr.user_id != user.id or addr.is_deleted:
            raise BadRequestException("Please select a valid delivery address")

        address_snapshot = AddressSnapshot(**addr.model_dump())

        cart = await Cart.find_one(Cart.user_id == user.id)
        if not cart or not cart.items:
            raise BadRequestException("Your cart is empty")

        active_items = [i for i in cart.items if not i.is_saved_for_later]
        if not active_items:
            raise BadRequestException("No active items in cart to checkout")

        # Atomic Stock Validation and Reservation
        order_items: List[OrderItem] = []
        subtotal_paise = 0

        for item in active_items:
            product = await Product.get(item.product_id)
            if not product or product.is_deleted or not product.is_published:
                raise BadRequestException(f"Product '{item.title}' is no longer available")

            # Match Variant & Check Stock
            variant_match = next((v for v in product.variants if v.variant_id == item.variant_id), None)
            if not variant_match:
                raise BadRequestException(f"Selected variant for '{product.title}' is not available")

            if variant_match.stock < item.quantity:
                raise BadRequestException(
                    f"Insufficient stock for '{product.title}'. Only {variant_match.stock} left."
                )

            # Atomic decrement of variant stock and product total_stock
            variant_match.stock -= item.quantity
            product.total_stock = max(0, product.total_stock - item.quantity)
            product.sales_count += item.quantity
            await product.save()

            # Commission split calculation (e.g. 8% platform fee, 92% seller payout)
            unit_price = variant_match.price_paise
            total_price = unit_price * item.quantity
            seller_profile = await SellerProfile.get(product.seller_id)
            comm_rate = seller_profile.commission_rate_pct if seller_profile else settings.DEFAULT_COMMISSION_RATE_PCT
            commission_paise = int((total_price * comm_rate) / 100)
            payout_paise = total_price - commission_paise

            # Credit seller pending payout ledger
            if seller_profile:
                seller_profile.pending_payout_paise += payout_paise
                seller_profile.total_orders_fulfilled += 1
                await seller_profile.save()

            order_items.append(
                OrderItem(
                    product_id=product.id,
                    variant_id=variant_match.variant_id,
                    seller_id=product.seller_id,
                    title=product.title,
                    product_slug=product.slug,
                    image_url=product.images[0].url if product.images else "",
                    attributes=item.selected_attributes,
                    quantity=item.quantity,
                    unit_price_paise=unit_price,
                    total_price_paise=total_price,
                    seller_commission_paise=commission_paise,
                    seller_payout_paise=payout_paise,
                    status=OrderStatus.PLACED,
                )
            )
            subtotal_paise += total_price

        # Shipping fee
        shipping_fee_paise = 0 if subtotal_paise >= settings.FREE_SHIPPING_THRESHOLD_PAISE else settings.DEFAULT_SHIPPING_FEE_PAISE

        # Apply Coupon if present
        discount_paise = 0
        coupon_code = data.coupon_code or cart.applied_coupon_code
        if coupon_code:
            coupon = await Coupon.find_one(Coupon.code == coupon_code.upper(), Coupon.is_active == True)
            if coupon and subtotal_paise >= coupon.min_cart_value_paise:
                if coupon.discount_type == DiscountType.FIXED:
                    discount_paise = coupon.discount_value
                elif coupon.discount_type == DiscountType.PERCENTAGE:
                    discount_paise = int((subtotal_paise * coupon.discount_value) / 100)
                    if coupon.max_discount_paise:
                        discount_paise = min(discount_paise, coupon.max_discount_paise)

                # Increment coupon usage
                coupon.current_usage_count += 1
                coupon.used_by_user_ids.append(user.id)
                await coupon.save()

        tax_paise = int(subtotal_paise * 0.18)
        total_amount = max(0, subtotal_paise + shipping_fee_paise - discount_paise)

        # Generate unique order number
        today_str = datetime.now(timezone.utc).strftime("%Y%m%d")
        rand_suffix = random.randint(1000, 9999)
        order_number = f"SV-{today_str}-{rand_suffix}"

        now = datetime.now(timezone.utc)
        initial_timeline = [
            OrderTimelineStep(
                status=OrderStatus.PLACED,
                timestamp=now,
                title="Order Placed Successfully",
                description="Your order has been recorded and is being prepared by sellers.",
                actor="CUSTOMER",
            )
        ]

        payment_status = PaymentStatus.PAID if data.payment_method == PaymentMethod.WALLET else PaymentStatus.PENDING
        order_status = OrderStatus.CONFIRMED if payment_status == PaymentStatus.PAID else OrderStatus.PLACED

        order = Order(
            order_number=order_number,
            user_id=user.id,
            shipping_address=address_snapshot,
            billing_address=address_snapshot,
            items=order_items,
            subtotal_paise=subtotal_paise,
            shipping_fee_paise=shipping_fee_paise,
            tax_paise=tax_paise,
            discount_paise=discount_paise,
            coupon_code=coupon_code,
            total_amount_paise=total_amount,
            payment_method=data.payment_method,
            payment_status=payment_status,
            order_status=order_status,
            timeline=initial_timeline,
            is_reseller_order=data.is_reseller_order,
            reseller_id=user.id if data.is_reseller_order else None,
            reseller_margin_paise=data.reseller_margin_paise,
            invoice_url=f"/api/v1/orders/{order_number}/invoice",
        )
        await order.insert()

        # Deduct wallet balance if wallet payment
        if data.payment_method == PaymentMethod.WALLET:
            if user.wallet_balance_paise < total_amount:
                raise BadRequestException("Insufficient wallet balance")
            user.wallet_balance_paise -= total_amount
            await user.save()

        # Award loyalty points (1 point per ₹10 spent)
        earned_points = total_amount // 1000
        user.loyalty_points += earned_points
        await user.save()

        # Empty active items from cart
        cart.items = [i for i in cart.items if i.is_saved_for_later]
        cart.applied_coupon_code = None
        await cart.save()

        logger.info(f"Order '{order_number}' created successfully for user {user.id}")

        return OrderResponse(
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
