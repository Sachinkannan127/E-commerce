from datetime import datetime, timezone
from typing import Optional, List, Tuple
from beanie import PydanticObjectId
from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.models.coupon import Coupon, DiscountType
from app.models.user import User
from app.schemas.cart_and_order import CartResponse, CartItemDto
from app.core.config import settings
from app.core.exceptions import NotFoundException, BadRequestException


class CartService:
    @staticmethod
    async def get_or_create_cart(
        user: Optional[User] = None,
        session_id: Optional[str] = None
    ) -> Cart:
        if user:
            cart = await Cart.find_one(Cart.user_id == user.id)
            if not cart:
                cart = Cart(user_id=user.id, items=[])
                await cart.insert()
            return cart

        if session_id:
            cart = await Cart.find_one(Cart.session_id == session_id)
            if not cart:
                cart = Cart(session_id=session_id, items=[])
                await cart.insert()
            return cart

        # New guest session cart
        cart = Cart(session_id=str(PydanticObjectId()), items=[])
        await cart.insert()
        return cart

    @classmethod
    async def get_cart_response(
        cls,
        user: Optional[User] = None,
        session_id: Optional[str] = None
    ) -> CartResponse:
        cart = await cls.get_or_create_cart(user, session_id)

        active_items_dto: List[CartItemDto] = []
        saved_items_dto: List[CartItemDto] = []
        subtotal_paise = 0
        compare_total_paise = 0

        for item in cart.items:
            product = await Product.get(item.product_id)
            if not product or product.is_deleted or not product.is_published:
                continue

            # Match variant or use default base
            variant = next((v for v in product.variants if v.variant_id == item.variant_id), None)
            unit_price = variant.price_paise if variant else product.base_price_paise
            compare_price = variant.compare_at_price_paise if variant else product.compare_at_price_paise
            available_stock = variant.stock if variant else product.total_stock
            in_stock = available_stock >= item.quantity

            dto = CartItemDto(
                product_id=str(item.product_id),
                variant_id=item.variant_id,
                seller_id=str(product.seller_id),
                title=product.title,
                product_slug=product.slug,
                image_url=item.image_url or (product.images[0].url if product.images else ""),
                selected_attributes=item.selected_attributes,
                quantity=item.quantity,
                unit_price_paise=unit_price,
                compare_at_price_paise=compare_price,
                is_saved_for_later=item.is_saved_for_later,
                in_stock=in_stock,
                available_stock=available_stock,
            )

            if item.is_saved_for_later:
                saved_items_dto.append(dto)
            else:
                active_items_dto.append(dto)
                subtotal_paise += unit_price * item.quantity
                if compare_price and compare_price > unit_price:
                    compare_total_paise += compare_price * item.quantity
                else:
                    compare_total_paise += unit_price * item.quantity

        # Calculate Coupon Discount
        discount_paise = 0
        if cart.applied_coupon_code and subtotal_paise > 0:
            coupon = await Coupon.find_one(
                Coupon.code == cart.applied_coupon_code,
                Coupon.is_active == True,
            )
            now = datetime.now(timezone.utc)
            if coupon and coupon.valid_from <= now <= coupon.valid_until and subtotal_paise >= coupon.min_cart_value_paise:
                if coupon.discount_type == DiscountType.FIXED:
                    discount_paise = coupon.discount_value
                elif coupon.discount_type == DiscountType.PERCENTAGE:
                    discount_paise = int((subtotal_paise * coupon.discount_value) / 100)
                    if coupon.max_discount_paise:
                        discount_paise = min(discount_paise, coupon.max_discount_paise)
            else:
                # Coupon no longer valid, remove
                cart.applied_coupon_code = None
                await cart.save()

        # Shipping fee logic
        free_thresh = settings.FREE_SHIPPING_THRESHOLD_PAISE
        shipping_fee_paise = 0
        if subtotal_paise > 0 and subtotal_paise < free_thresh:
            shipping_fee_paise = settings.DEFAULT_SHIPPING_FEE_PAISE

        free_remaining = max(0, free_thresh - subtotal_paise) if subtotal_paise > 0 else free_thresh
        total_amount = max(0, subtotal_paise + shipping_fee_paise - discount_paise)
        total_savings = (compare_total_paise - subtotal_paise) + discount_paise

        return CartResponse(
            items=active_items_dto,
            saved_for_later=saved_items_dto,
            applied_coupon_code=cart.applied_coupon_code,
            subtotal_paise=subtotal_paise,
            discount_paise=discount_paise,
            shipping_fee_paise=shipping_fee_paise,
            total_amount_paise=total_amount,
            total_savings_paise=max(0, total_savings),
            free_shipping_threshold_paise=free_thresh,
            free_shipping_remaining_paise=free_remaining,
        )

    @classmethod
    async def add_item(
        cls,
        product_id: str,
        variant_id: str,
        quantity: int,
        selected_attributes: dict,
        user: Optional[User] = None,
        session_id: Optional[str] = None
    ) -> CartResponse:
        product = await Product.get(PydanticObjectId(product_id))
        if not product or product.is_deleted or not product.is_published:
            raise NotFoundException("Product")

        cart = await cls.get_or_create_cart(user, session_id)
        existing = next((i for i in cart.items if i.variant_id == variant_id), None)

        if existing:
            existing.quantity += quantity
        else:
            cart.items.append(
                CartItem(
                    product_id=product.id,
                    variant_id=variant_id,
                    seller_id=product.seller_id,
                    title=product.title,
                    product_slug=product.slug,
                    image_url=product.images[0].url if product.images else "",
                    selected_attributes=selected_attributes,
                    quantity=quantity,
                    unit_price_paise=product.base_price_paise,
                    compare_at_price_paise=product.compare_at_price_paise,
                )
            )

        cart.updated_at = datetime.now(timezone.utc)
        await cart.save()
        return await cls.get_cart_response(user, session_id)

    @classmethod
    async def update_item_quantity(
        cls,
        variant_id: str,
        quantity: int,
        user: Optional[User] = None,
        session_id: Optional[str] = None
    ) -> CartResponse:
        cart = await cls.get_or_create_cart(user, session_id)
        if quantity <= 0:
            cart.items = [i for i in cart.items if i.variant_id != variant_id]
        else:
            for item in cart.items:
                if item.variant_id == variant_id:
                    item.quantity = quantity
                    break

        cart.updated_at = datetime.now(timezone.utc)
        await cart.save()
        return await cls.get_cart_response(user, session_id)

    @classmethod
    async def remove_item(
        cls,
        variant_id: str,
        user: Optional[User] = None,
        session_id: Optional[str] = None
    ) -> CartResponse:
        cart = await cls.get_or_create_cart(user, session_id)
        cart.items = [i for i in cart.items if i.variant_id != variant_id]
        cart.updated_at = datetime.now(timezone.utc)
        await cart.save()
        return await cls.get_cart_response(user, session_id)

    @classmethod
    async def toggle_save_for_later(
        cls,
        variant_id: str,
        user: Optional[User] = None,
        session_id: Optional[str] = None
    ) -> CartResponse:
        cart = await cls.get_or_create_cart(user, session_id)
        for item in cart.items:
            if item.variant_id == variant_id:
                item.is_saved_for_later = not item.is_saved_for_later
                break

        cart.updated_at = datetime.now(timezone.utc)
        await cart.save()
        return await cls.get_cart_response(user, session_id)

    @classmethod
    async def apply_coupon(
        cls,
        coupon_code: str,
        user: Optional[User] = None,
        session_id: Optional[str] = None
    ) -> CartResponse:
        clean_code = coupon_code.upper().strip()
        coupon = await Coupon.find_one(Coupon.code == clean_code, Coupon.is_active == True)
        if not coupon:
            raise BadRequestException("Invalid coupon code")

        now = datetime.now(timezone.utc)
        if now > coupon.valid_until or now < coupon.valid_from:
            raise BadRequestException("This coupon has expired")

        cart = await cls.get_or_create_cart(user, session_id)
        cart.applied_coupon_code = clean_code
        cart.updated_at = datetime.now(timezone.utc)
        await cart.save()

        return await cls.get_cart_response(user, session_id)

    @classmethod
    async def remove_coupon(
        cls,
        user: Optional[User] = None,
        session_id: Optional[str] = None
    ) -> CartResponse:
        cart = await cls.get_or_create_cart(user, session_id)
        cart.applied_coupon_code = None
        cart.updated_at = datetime.now(timezone.utc)
        await cart.save()
        return await cls.get_cart_response(user, session_id)

    @classmethod
    async def merge_guest_cart(
        cls,
        session_id: str,
        user: User
    ) -> CartResponse:
        guest_cart = await Cart.find_one(Cart.session_id == session_id)
        if not guest_cart or not guest_cart.items:
            return await cls.get_cart_response(user)

        user_cart = await cls.get_or_create_cart(user=user)

        for guest_item in guest_cart.items:
            existing = next((i for i in user_cart.items if i.variant_id == guest_item.variant_id), None)
            if existing:
                existing.quantity += guest_item.quantity
            else:
                user_cart.items.append(guest_item)

        if guest_cart.applied_coupon_code and not user_cart.applied_coupon_code:
            user_cart.applied_coupon_code = guest_cart.applied_coupon_code

        user_cart.updated_at = datetime.now(timezone.utc)
        await user_cart.save()
        await guest_cart.delete()

        return await cls.get_cart_response(user)
