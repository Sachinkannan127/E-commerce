import random
import string
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, Field
from beanie import PydanticObjectId

from app.schemas.common import APIResponse
from app.middlewares.auth_guard import get_current_user
from app.models.user import User
from app.models.product import Product
from app.models.order import Order, OrderItem, OrderStatus, PaymentStatus, PaymentMethod
from app.models.address import AddressSnapshot
from app.models.reseller import (
    ResellerProfile,
    ResellerSharedCatalog,
    ResellerOrderRecord,
    ResellerStatus,
)
from app.core.exceptions import NotFoundException, BadRequestException

router = APIRouter(prefix="/reseller", tags=["Meesho-Style Reselling & Social Commerce"])


class UpdateResellerProfileRequest(BaseModel):
    business_name: str
    whatsapp_number: Optional[str] = None
    upi_id: Optional[str] = None


class ShareCatalogRequest(BaseModel):
    product_id: str
    selling_price_paise: int
    custom_notes: Optional[str] = None


class CustomerOrderRequest(BaseModel):
    product_id: str
    variant_id: Optional[str] = None
    quantity: int = Field(default=1, ge=1)
    reseller_selling_price_paise: int  # Price customer will pay
    customer_name: str
    customer_phone: str
    shipping_address: AddressSnapshot
    payment_method: PaymentMethod = PaymentMethod.COD


class WithdrawMarginRequest(BaseModel):
    amount_paise: int
    destination: str = "WALLET"  # "WALLET" or "UPI"


def generate_reseller_code(user_id: str) -> str:
    suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"RS-{suffix}"


async def get_or_create_reseller_profile(user: User) -> ResellerProfile:
    user_id_str = str(user.id)
    profile = await ResellerProfile.find_one(ResellerProfile.user_id == user_id_str)
    if not profile:
        profile = ResellerProfile(
            user_id=user_id_str,
            reseller_code=generate_reseller_code(user_id_str),
            business_name=f"{user.full_name}'s Store",
            whatsapp_number=user.phone or "",
        )
        await profile.insert()
    return profile


@router.get("/profile", response_model=APIResponse[dict])
async def get_profile(current_user: User = Depends(get_current_user)):
    profile = await get_or_create_reseller_profile(current_user)
    return APIResponse(
        data={
            "id": str(profile.id),
            "reseller_code": profile.reseller_code,
            "business_name": profile.business_name,
            "whatsapp_number": profile.whatsapp_number,
            "upi_id": profile.upi_id,
            "total_sales_paise": profile.total_sales_paise,
            "total_margin_earned_paise": profile.total_margin_earned_paise,
            "withdrawn_margin_paise": profile.withdrawn_margin_paise,
            "available_margin_paise": profile.available_margin_paise,
            "total_customers": profile.total_customers,
            "total_orders": profile.total_orders,
            "status": profile.status.value,
        }
    )


@router.put("/profile", response_model=APIResponse[dict])
async def update_profile(
    data: UpdateResellerProfileRequest,
    current_user: User = Depends(get_current_user),
):
    profile = await get_or_create_reseller_profile(current_user)
    profile.business_name = data.business_name.strip()
    profile.whatsapp_number = data.whatsapp_number
    profile.upi_id = data.upi_id
    profile.updated_at = datetime.now(timezone.utc)
    await profile.save()

    return APIResponse(
        message="Reseller profile updated successfully",
        data={
            "business_name": profile.business_name,
            "whatsapp_number": profile.whatsapp_number,
            "upi_id": profile.upi_id,
        }
    )


@router.post("/share-catalog", response_model=APIResponse[dict])
async def create_share_catalog(
    data: ShareCatalogRequest,
    current_user: User = Depends(get_current_user),
):
    try:
        pid = PydanticObjectId(data.product_id)
    except Exception:
        raise BadRequestException("Invalid product ID")

    product = await Product.get(pid)
    if not product:
        raise NotFoundException("Product")

    if data.selling_price_paise < product.base_price_paise:
        raise BadRequestException(f"Selling price cannot be less than base price of ₹{product.base_price_paise / 100:.2f}")

    margin_paise = data.selling_price_paise - product.base_price_paise
    margin_pct = round((margin_paise / product.base_price_paise) * 100, 1) if product.base_price_paise > 0 else 0

    profile = await get_or_create_reseller_profile(current_user)

    # Save or update shared catalog
    shared = await ResellerSharedCatalog.find_one(
        ResellerSharedCatalog.reseller_id == str(profile.id),
        ResellerSharedCatalog.product_id == str(product.id),
    )
    if not shared:
        shared = ResellerSharedCatalog(
            reseller_id=str(profile.id),
            product_id=str(product.id),
            product_name=product.title,
            product_slug=product.slug,
            product_image=product.images[0].url if product.images else None,
            base_price_paise=product.base_price_paise,
            selling_price_paise=data.selling_price_paise,
            margin_paise=margin_paise,
            margin_percent=margin_pct,
            custom_notes=data.custom_notes,
        )
        await shared.insert()
    else:
        shared.selling_price_paise = data.selling_price_paise
        shared.margin_paise = margin_paise
        shared.margin_percent = margin_pct
        shared.custom_notes = data.custom_notes
        shared.shared_clicks += 1
        await shared.save()

    # Generate formatted WhatsApp share text
    whatsapp_text = (
        f"🛍️ *{product.title}*\n\n"
        f"✨ *Special Price*: ₹{data.selling_price_paise / 100:.0f} (MRP: ~₹{product.compare_at_price_paise / 100:.0f}~)\n"
        f"🚚 *Free Cash on Delivery & 7-Day Easy Returns*\n"
        f"⭐ Rated {product.avg_rating} / 5 by verified customers\n\n"
        f"💬 Reply to this message with your address to order now!\n"
        f"— Curated by {profile.business_name}"
    )

    return APIResponse(
        message="Product catalog prepared for sharing",
        data={
            "shared_catalog_id": str(shared.id),
            "product_id": str(product.id),
            "product_name": product.title,
            "base_price_paise": product.base_price_paise,
            "selling_price_paise": data.selling_price_paise,
            "margin_paise": margin_paise,
            "margin_percent": margin_pct,
            "whatsapp_share_text": whatsapp_text,
            "shareable_url": f"https://shopverse.in/products/{product.slug}?reseller={profile.reseller_code}",
        }
    )


@router.get("/catalogs", response_model=APIResponse[List[dict]])
async def list_shared_catalogs(current_user: User = Depends(get_current_user)):
    profile = await get_or_create_reseller_profile(current_user)
    catalogs = await ResellerSharedCatalog.find(
        ResellerSharedCatalog.reseller_id == str(profile.id)
    ).sort("-created_at").to_list()

    items = [
        {
            "id": str(c.id),
            "product_id": c.product_id,
            "product_name": c.product_name,
            "product_slug": c.product_slug,
            "product_image": c.product_image,
            "base_price_paise": c.base_price_paise,
            "selling_price_paise": c.selling_price_paise,
            "margin_paise": c.margin_paise,
            "margin_percent": c.margin_percent,
            "shared_clicks": c.shared_clicks,
            "orders_generated": c.orders_generated,
            "created_at": c.created_at.strftime("%d %b %Y"),
        }
        for c in catalogs
    ]
    return APIResponse(data=items)


@router.post("/order-for-customer", response_model=APIResponse[dict])
async def place_order_for_customer(
    data: CustomerOrderRequest,
    current_user: User = Depends(get_current_user),
):
    try:
        pid = PydanticObjectId(data.product_id)
    except Exception:
        raise BadRequestException("Invalid product ID")

    product = await Product.get(pid)
    if not product:
        raise NotFoundException("Product")

    if data.reseller_selling_price_paise < product.base_price_paise:
        raise BadRequestException(f"Customer price cannot be below base cost of ₹{product.base_price_paise / 100:.2f}")

    margin_per_unit = data.reseller_selling_price_paise - product.base_price_paise
    total_margin_paise = margin_per_unit * data.quantity
    total_customer_charge_paise = data.reseller_selling_price_paise * data.quantity
    total_base_cost_paise = product.base_price_paise * data.quantity

    profile = await get_or_create_reseller_profile(current_user)

    order_num = f"ORD-RS-{random.randint(100000, 999999)}"
    now_utc = datetime.now(timezone.utc)

    # Create Order item
    order_item = OrderItem(
        product_id=product.id,
        seller_id=product.seller_id,
        title=product.title,
        slug=product.slug,
        image_url=product.images[0].url if product.images else None,
        quantity=data.quantity,
        unit_price_paise=data.reseller_selling_price_paise,
        total_price_paise=total_customer_charge_paise,
        commission_rate_pct=8.0,
        commission_paise=int(total_customer_charge_paise * 0.08),
        seller_payout_paise=int(total_customer_charge_paise * 0.92),
    )

    order = Order(
        order_number=order_num,
        user_id=current_user.id,
        customer_name=data.customer_name,
        customer_email=current_user.email or "customer@shopverse.in",
        customer_phone=data.customer_phone,
        items=[order_item],
        shipping_address=data.shipping_address,
        subtotal_paise=total_customer_charge_paise,
        total_paise=total_customer_charge_paise,
        payment_method=data.payment_method,
        payment_status=PaymentStatus.PAID if data.payment_method != PaymentMethod.COD else PaymentStatus.PENDING,
        status=OrderStatus.PLACED,
        created_at=now_utc,
    )
    await order.insert()

    # Record Reseller order
    record = ResellerOrderRecord(
        reseller_id=str(profile.id),
        order_id=str(order.id),
        order_number=order_num,
        customer_name=data.customer_name,
        customer_phone=data.customer_phone,
        product_names=[product.title],
        base_amount_paise=total_base_cost_paise,
        reseller_selling_amount_paise=total_customer_charge_paise,
        margin_earned_paise=total_margin_paise,
        payout_status="PENDING",
    )
    await record.insert()

    # Update profile stats
    profile.total_sales_paise += total_customer_charge_paise
    profile.total_margin_earned_paise += total_margin_paise
    profile.available_margin_paise += total_margin_paise
    profile.total_orders += 1
    profile.total_customers += 1
    await profile.save()

    return APIResponse(
        message="Customer order placed successfully! Margin will be credited to your available balance upon delivery.",
        data={
            "order_number": order_num,
            "order_id": str(order.id),
            "customer_name": data.customer_name,
            "total_customer_price_paise": total_customer_charge_paise,
            "margin_earned_paise": total_margin_paise,
            "available_margin_paise": profile.available_margin_paise,
        }
    )


@router.get("/orders", response_model=APIResponse[List[dict]])
async def list_reseller_orders(current_user: User = Depends(get_current_user)):
    profile = await get_or_create_reseller_profile(current_user)
    records = await ResellerOrderRecord.find(
        ResellerOrderRecord.reseller_id == str(profile.id)
    ).sort("-created_at").to_list()

    items = [
        {
            "id": str(r.id),
            "order_number": r.order_number,
            "customer_name": r.customer_name,
            "customer_phone": r.customer_phone,
            "products": r.product_names,
            "customer_amount_paise": r.reseller_selling_amount_paise,
            "margin_paise": r.margin_earned_paise,
            "status": r.payout_status,
            "date": r.created_at.strftime("%d %b %Y, %I:%M %p"),
        }
        for r in records
    ]
    return APIResponse(data=items)


@router.post("/withdraw-margin", response_model=APIResponse[dict])
async def withdraw_margin(
    data: WithdrawMarginRequest,
    current_user: User = Depends(get_current_user),
):
    profile = await get_or_create_reseller_profile(current_user)
    if data.amount_paise <= 0:
        raise BadRequestException("Withdrawal amount must be greater than zero")

    if data.amount_paise > profile.available_margin_paise:
        raise BadRequestException(f"Insufficient available margin balance. Current balance is ₹{profile.available_margin_paise / 100:.2f}")

    profile.available_margin_paise -= data.amount_paise
    profile.withdrawn_margin_paise += data.amount_paise
    await profile.save()

    # Credit to user wallet
    current_user.wallet_balance_paise += data.amount_paise
    await current_user.save()

    return APIResponse(
        message=f"₹{data.amount_paise / 100:.2f} transferred successfully to your ShopVerse Wallet!",
        data={
            "withdrawn_paise": data.amount_paise,
            "available_margin_paise": profile.available_margin_paise,
            "new_wallet_balance_paise": current_user.wallet_balance_paise,
        }
    )
