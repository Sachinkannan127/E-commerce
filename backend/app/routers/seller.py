import random
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query, status
from pydantic import BaseModel, Field
from beanie import PydanticObjectId
from app.models.seller import SellerProfile, SellerStatus, BankDetails
from app.models.product import (
    Product,
    ProductVariant,
    ProductImage,
    ProductSpecification,
    ProductHighlight,
    VariantAttribute,
)
from app.models.order import Order, OrderStatus, OrderTimelineStep
from app.models.payout import SellerPayout, PayoutStatus
from app.models.user import User, UserRole
from app.schemas.common import APIResponse, PaginatedResponse
from app.middlewares.auth_guard import get_current_user, require_seller
from app.core.config import settings
from app.core.exceptions import NotFoundException, BadRequestException, ForbiddenException
from app.core.logging import logger

router = APIRouter(prefix="/seller", tags=["Seller Portal"])


# Schemas
class SellerOnboardingRequest(BaseModel):
    store_name: str = Field(min_length=2, max_length=100)
    store_description: Optional[str] = None
    gst_number: str
    pan_number: str
    pickup_address: dict
    bank_details: BankDetails


class SellerKpiResponse(BaseModel):
    store_name: str
    status: SellerStatus
    lifetime_earnings_paise: int
    pending_payout_paise: int
    total_orders_fulfilled: int
    active_products_count: int
    low_stock_count: int
    recent_orders: List[Dict[str, Any]]


class UpdateStockRequest(BaseModel):
    variant_id: str
    stock: int = Field(ge=0)


class UpdateOrderStatusRequest(BaseModel):
    status: OrderStatus
    tracking_number: Optional[str] = None
    courier_partner: Optional[str] = "Delhivery Express"


class RequestPayoutBody(BaseModel):
    amount_paise: int = Field(gt=0)


@router.post("/onboarding", response_model=APIResponse[dict])
async def seller_onboarding(
    data: SellerOnboardingRequest,
    current_user: User = Depends(get_current_user)
):
    profile = await SellerProfile.find_one(SellerProfile.user_id == current_user.id)
    store_slug = data.store_name.lower().replace(" ", "-").replace("&", "and") + f"-{random.randint(100, 999)}"

    if profile:
        profile.store_name = data.store_name
        profile.store_description = data.store_description
        profile.gst_number = data.gst_number
        profile.pan_number = data.pan_number
        profile.pickup_address = data.pickup_address
        profile.bank_details = data.bank_details
        profile.status = SellerStatus.APPROVED  # Auto-approve in development
        await profile.save()
    else:
        profile = SellerProfile(
            user_id=current_user.id,
            store_name=data.store_name,
            store_slug=store_slug,
            store_description=data.store_description,
            gst_number=data.gst_number,
            pan_number=data.pan_number,
            pickup_address=data.pickup_address,
            bank_details=data.bank_details,
            status=SellerStatus.APPROVED,
        )
        await profile.insert()

    # Update user role to SELLER
    current_user.role = UserRole.SELLER
    await current_user.save()

    return APIResponse(
        message="Seller onboarding completed successfully!",
        data={"seller_id": str(profile.id), "store_name": profile.store_name, "status": profile.status}
    )


@router.get("/profile", response_model=APIResponse[dict])
async def get_seller_profile(current_user: User = Depends(get_current_user)):
    profile = await SellerProfile.find_one(SellerProfile.user_id == current_user.id)
    if not profile:
        raise NotFoundException("Seller profile")

    return APIResponse(
        data={
            "id": str(profile.id),
            "store_name": profile.store_name,
            "store_slug": profile.store_slug,
            "store_description": profile.store_description,
            "status": profile.status,
            "gst_number": profile.gst_number,
            "pan_number": profile.pan_number,
            "bank_details": profile.bank_details.model_dump() if profile.bank_details else None,
            "commission_rate_pct": profile.commission_rate_pct,
            "pending_payout_paise": profile.pending_payout_paise,
            "lifetime_earnings_paise": profile.lifetime_earnings_paise,
            "total_orders_fulfilled": profile.total_orders_fulfilled,
        }
    )


@router.get("/dashboard/kpis", response_model=APIResponse[SellerKpiResponse])
async def get_seller_kpis(current_user: User = Depends(require_seller)):
    profile = await SellerProfile.find_one(SellerProfile.user_id == current_user.id)
    if not profile:
        raise NotFoundException("Seller profile")

    products = await Product.find(
        Product.seller_id == profile.id,
        Product.is_deleted == False
    ).to_list()

    active_products_count = len(products)
    low_stock_count = sum(1 for p in products if p.total_stock <= 5)

    # Fetch orders containing items from this seller
    recent_orders_docs = await Order.find(
        {"items.seller_id": profile.id}
    ).sort(-Order.created_at).limit(5).to_list()

    recent_orders = [
        {
            "id": str(o.id),
            "order_number": o.order_number,
            "order_status": o.order_status,
            "total_amount_paise": o.total_amount_paise,
            "created_at": o.created_at.strftime("%d %b %Y"),
            "customer_name": o.shipping_address.full_name,
            "city": o.shipping_address.city,
        }
        for o in recent_orders_docs
    ]

    return APIResponse(
        data=SellerKpiResponse(
            store_name=profile.store_name,
            status=profile.status,
            lifetime_earnings_paise=profile.lifetime_earnings_paise,
            pending_payout_paise=profile.pending_payout_paise,
            total_orders_fulfilled=profile.total_orders_fulfilled,
            active_products_count=active_products_count,
            low_stock_count=low_stock_count,
            recent_orders=recent_orders,
        )
    )


@router.get("/products", response_model=APIResponse[List[dict]])
async def list_seller_products(current_user: User = Depends(require_seller)):
    profile = await SellerProfile.find_one(SellerProfile.user_id == current_user.id)
    if not profile:
        raise NotFoundException("Seller profile")

    products = await Product.find(
        Product.seller_id == profile.id,
        Product.is_deleted == False
    ).sort(-Product.created_at).to_list()

    items = [
        {
            "id": str(p.id),
            "title": p.title,
            "slug": p.slug,
            "category_slug": p.category_slug,
            "brand_name": p.brand_name,
            "primary_image": p.images[0].url if p.images else None,
            "base_price_paise": p.base_price_paise,
            "compare_at_price_paise": p.compare_at_price_paise,
            "discount_pct": p.discount_pct,
            "total_stock": p.total_stock,
            "variants_count": len(p.variants),
            "sales_count": p.sales_count,
            "avg_rating": p.avg_rating,
            "is_published": p.is_published,
            "variants": [v.model_dump() for v in p.variants],
        }
        for p in products
    ]
    return APIResponse(data=items)


@router.post("/products", response_model=APIResponse[dict])
async def create_seller_product(
    data: dict,
    current_user: User = Depends(require_seller)
):
    profile = await SellerProfile.find_one(SellerProfile.user_id == current_user.id)
    if not profile:
        raise NotFoundException("Seller profile")

    title = data.get("title")
    category_slug = data.get("category_slug", "electronics")
    brand_name = data.get("brand_name", profile.store_name)
    slug = title.lower().replace(" ", "-").replace("&", "and") + f"-{random.randint(1000, 9999)}"

    # Parse variants
    variants_raw = data.get("variants", [])
    variant_list = []
    base_price = 999900
    total_stock = 0

    if variants_raw:
        for v_idx, v in enumerate(variants_raw):
            price = int(v.get("price_paise", 999900))
            if v_idx == 0:
                base_price = price
            stock = int(v.get("stock", 10))
            total_stock += stock
            variant_list.append(
                ProductVariant(
                    variant_id=f"var-{v_idx+1}-{random.randint(100, 999)}",
                    sku=v.get("sku", f"SKU-{random.randint(1000, 9999)}"),
                    attributes=[VariantAttribute(name=a["name"], value=a["value"]) for a in v.get("attributes", [])],
                    price_paise=price,
                    compare_at_price_paise=int(price * 1.3),
                    stock=stock,
                    images=[ProductImage(url=img["url"], is_primary=i==0) for i, img in enumerate(v.get("images", []))],
                )
            )
    else:
        # Default single variant
        base_price = int(data.get("base_price_paise", 999900))
        total_stock = int(data.get("total_stock", 20))
        variant_list.append(
            ProductVariant(
                variant_id=f"var-default-{random.randint(100, 999)}",
                sku=f"SKU-{slug[:6].upper()}-1",
                attributes=[],
                price_paise=base_price,
                stock=total_stock,
            )
        )

    product = Product(
        seller_id=profile.id,
        category_id=PydanticObjectId(),
        category_slug=category_slug,
        brand_name=brand_name,
        title=title,
        slug=slug,
        description=data.get("description", "High quality product."),
        short_description=data.get("short_description"),
        tags=data.get("tags", [category_slug]),
        images=[ProductImage(url=img["url"], is_primary=i==0) for i, img in enumerate(data.get("images", []))],
        variants=variant_list,
        specifications=[ProductSpecification(**s) for s in data.get("specifications", [])],
        highlights=[ProductHighlight(**h) for h in data.get("highlights", [])],
        base_price_paise=base_price,
        compare_at_price_paise=int(base_price * 1.3),
        discount_pct=23,
        total_stock=total_stock,
        is_published=True,
    )
    await product.insert()

    return APIResponse(
        message="Product published successfully!",
        data={"product_id": str(product.id), "slug": product.slug}
    )


@router.put("/inventory/{product_id}/stock", response_model=APIResponse[dict])
async def update_variant_stock(
    product_id: str,
    data: UpdateStockRequest,
    current_user: User = Depends(require_seller)
):
    product = await Product.get(PydanticObjectId(product_id))
    if not product:
        raise NotFoundException("Product")

    for v in product.variants:
        if v.variant_id == data.variant_id:
            v.stock = data.stock
            break

    product.total_stock = sum(v.stock for v in product.variants)
    await product.save()

    return APIResponse(
        message="Stock updated successfully",
        data={"product_id": str(product.id), "total_stock": product.total_stock}
    )


@router.get("/orders", response_model=APIResponse[List[dict]])
async def list_seller_orders(current_user: User = Depends(require_seller)):
    profile = await SellerProfile.find_one(SellerProfile.user_id == current_user.id)
    if not profile:
        raise NotFoundException("Seller profile")

    orders = await Order.find({"items.seller_id": profile.id}).sort(-Order.created_at).to_list()

    items = []
    for o in orders:
        seller_items = [i for i in o.items if i.seller_id == profile.id]
        seller_total = sum(i.total_price_paise for i in seller_items)
        seller_payout = sum(i.seller_payout_paise for i in seller_items)
        items.append({
            "order_id": str(o.id),
            "order_number": o.order_number,
            "order_status": o.order_status,
            "created_at": o.created_at.strftime("%d %b %Y, %I:%M %p"),
            "customer_name": o.shipping_address.full_name,
            "shipping_address": o.shipping_address.model_dump(),
            "items": [i.model_dump() for i in seller_items],
            "seller_total_paise": seller_total,
            "seller_payout_paise": seller_payout,
        })

    return APIResponse(data=items)


@router.put("/orders/{order_id}/status", response_model=APIResponse[dict])
async def update_order_status(
    order_id: str,
    data: UpdateOrderStatusRequest,
    current_user: User = Depends(require_seller)
):
    order = await Order.get(PydanticObjectId(order_id))
    if not order:
        raise NotFoundException("Order")

    order.order_status = data.status
    order.timeline.append(
        OrderTimelineStep(
            status=data.status,
            timestamp=datetime.now(timezone.utc),
            title=f"Order Marked as {data.status.value}",
            description=f"Courier: {data.courier_partner}. AWB: {data.tracking_number or 'Auto-generated'}",
            actor="SELLER",
        )
    )
    await order.save()

    return APIResponse(
        message=f"Order status updated to {data.status.value}",
        data={"order_id": str(order.id), "status": order.order_status}
    )


@router.get("/payouts", response_model=APIResponse[dict])
async def get_seller_payouts(current_user: User = Depends(require_seller)):
    profile = await SellerProfile.find_one(SellerProfile.user_id == current_user.id)
    if not profile:
        raise NotFoundException("Seller profile")

    payouts = await SellerPayout.find(SellerPayout.seller_id == profile.id).sort(-SellerPayout.requested_at).to_list()

    return APIResponse(
        data={
            "lifetime_earnings_paise": profile.lifetime_earnings_paise,
            "pending_payout_paise": profile.pending_payout_paise,
            "commission_rate_pct": profile.commission_rate_pct,
            "bank_details": profile.bank_details.model_dump() if profile.bank_details else None,
            "payouts": [
                {
                    "id": str(p.id),
                    "amount_paise": p.amount_paise,
                    "status": p.status,
                    "requested_at": p.requested_at.strftime("%d %b %Y"),
                    "reference_id": p.reference_id,
                }
                for p in payouts
            ],
        }
    )


@router.post("/payouts/request", response_model=APIResponse[dict])
async def request_payout(
    data: RequestPayoutBody,
    current_user: User = Depends(require_seller)
):
    profile = await SellerProfile.find_one(SellerProfile.user_id == current_user.id)
    if not profile:
        raise NotFoundException("Seller profile")

    if data.amount_paise > profile.pending_payout_paise:
        raise BadRequestException("Requested amount exceeds available pending balance")

    if data.amount_paise < 100000:  # Minimum ₹1,000 payout threshold
        raise BadRequestException("Minimum payout withdrawal is ₹1,000")

    payout = SellerPayout(
        seller_id=profile.id,
        amount_paise=data.amount_paise,
        status=PayoutStatus.REQUESTED,
    )
    await payout.insert()

    profile.pending_payout_paise -= data.amount_paise
    await profile.save()

    return APIResponse(
        message="Payout request submitted successfully!",
        data={"payout_id": str(payout.id), "amount_paise": payout.amount_paise, "status": payout.status}
    )
