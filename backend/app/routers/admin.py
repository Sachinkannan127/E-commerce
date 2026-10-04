import csv
import io
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query, status
from fastapi.responses import Response as StreamResponse
from pydantic import BaseModel, Field
from beanie import PydanticObjectId
from app.models.seller import SellerProfile, SellerStatus
from app.models.product import Product
from app.models.order import Order, OrderStatus
from app.models.user import User, UserRole
from app.models.category import Category
from app.models.coupon import Coupon, DiscountType
from app.models.banner import Banner
from app.schemas.common import APIResponse, PaginatedResponse
from app.middlewares.auth_guard import require_admin
from app.core.exceptions import NotFoundException, BadRequestException

router = APIRouter(prefix="/admin", tags=["Admin Control Tower"])


# Schemas
class UpdateSellerStatusRequest(BaseModel):
    status: SellerStatus
    commission_rate_pct: Optional[float] = None


class CreateCouponRequest(BaseModel):
    code: str
    description: str
    discount_type: DiscountType = DiscountType.PERCENTAGE
    discount_value: int
    min_cart_value_paise: int = 0
    max_discount_paise: Optional[int] = None
    valid_days: int = 30


class CreateBannerRequest(BaseModel):
    title: str
    subtitle: Optional[str] = None
    image_url: str
    link_url: str
    position: str = "HERO_HOME"
    sort_order: int = 0


class CreateCategoryRequest(BaseModel):
    name: str
    slug: str
    icon_url: Optional[str] = None
    level: int = 0
    parent_id: Optional[str] = None


@router.get("/dashboard/stats", response_model=APIResponse[dict])
async def get_admin_dashboard_stats(current_user: User = Depends(require_admin)):
    total_users = await User.count()
    total_sellers = await SellerProfile.count()
    approved_sellers = await SellerProfile.find(SellerProfile.status == SellerStatus.APPROVED).count()
    total_products = await Product.find(Product.is_deleted == False).count()
    total_orders = await Order.count()

    # Financial computations
    all_orders = await Order.find_all().to_list()
    gmv_paise = sum(o.total_amount_paise for o in all_orders)
    
    # Calculate platform commission earned (approx 8% of subtotal)
    platform_revenue_paise = sum(
        sum(item.seller_commission_paise for item in o.items)
        for o in all_orders
    )

    recent_orders_docs = await Order.find_all().sort(-Order.created_at).limit(6).to_list()
    recent_orders = [
        {
            "id": str(o.id),
            "order_number": o.order_number,
            "total_amount_paise": o.total_amount_paise,
            "order_status": o.order_status,
            "payment_method": o.payment_method,
            "customer_name": o.shipping_address.full_name,
            "created_at": o.created_at.strftime("%d %b %Y, %I:%M %p"),
        }
        for o in recent_orders_docs
    ]

    return APIResponse(
        data={
            "gmv_paise": gmv_paise,
            "platform_revenue_paise": platform_revenue_paise,
            "total_orders": total_orders,
            "total_users": total_users,
            "total_sellers": total_sellers,
            "approved_sellers": approved_sellers,
            "total_products": total_products,
            "recent_orders": recent_orders,
        }
    )


@router.get("/sellers", response_model=APIResponse[List[dict]])
async def list_admin_sellers(current_user: User = Depends(require_admin)):
    sellers = await SellerProfile.find_all().sort(-SellerProfile.created_at).to_list()
    items = [
        {
            "id": str(s.id),
            "store_name": s.store_name,
            "store_slug": s.store_slug,
            "status": s.status,
            "gst_number": s.gst_number,
            "pan_number": s.pan_number,
            "commission_rate_pct": s.commission_rate_pct,
            "lifetime_earnings_paise": s.lifetime_earnings_paise,
            "pending_payout_paise": s.pending_payout_paise,
            "total_orders_fulfilled": s.total_orders_fulfilled,
            "created_at": s.created_at.strftime("%d %b %Y"),
        }
        for s in sellers
    ]
    return APIResponse(data=items)


@router.put("/sellers/{seller_id}/status", response_model=APIResponse[dict])
async def update_seller_status(
    seller_id: str,
    data: UpdateSellerStatusRequest,
    current_user: User = Depends(require_admin)
):
    seller = await SellerProfile.get(PydanticObjectId(seller_id))
    if not seller:
        raise NotFoundException("Seller")

    seller.status = data.status
    if data.commission_rate_pct is not None:
        seller.commission_rate_pct = data.commission_rate_pct
    await seller.save()

    return APIResponse(
        message=f"Seller status updated to {data.status.value}",
        data={"seller_id": str(seller.id), "status": seller.status}
    )


@router.get("/products", response_model=APIResponse[List[dict]])
async def list_admin_products(current_user: User = Depends(require_admin)):
    products = await Product.find(Product.is_deleted == False).sort(-Product.created_at).limit(50).to_list()
    items = [
        {
            "id": str(p.id),
            "title": p.title,
            "slug": p.slug,
            "category_slug": p.category_slug,
            "brand_name": p.brand_name,
            "base_price_paise": p.base_price_paise,
            "total_stock": p.total_stock,
            "is_published": p.is_published,
            "created_at": p.created_at.strftime("%d %b %Y"),
        }
        for p in products
    ]
    return APIResponse(data=items)


@router.put("/products/{product_id}/publish", response_model=APIResponse[dict])
async def toggle_product_publish(
    product_id: str,
    current_user: User = Depends(require_admin)
):
    product = await Product.get(PydanticObjectId(product_id))
    if not product:
        raise NotFoundException("Product")

    product.is_published = not product.is_published
    await product.save()

    return APIResponse(
        message=f"Product {'published' if product.is_published else 'unpublished'}",
        data={"product_id": str(product.id), "is_published": product.is_published}
    )


@router.get("/coupons", response_model=APIResponse[List[dict]])
async def list_admin_coupons(current_user: User = Depends(require_admin)):
    coupons = await Coupon.find_all().sort(-Coupon.created_at).to_list()
    items = [
        {
            "id": str(c.id),
            "code": c.code,
            "description": c.description,
            "discount_type": c.discount_type,
            "discount_value": c.discount_value,
            "min_cart_value_paise": c.min_cart_value_paise,
            "max_discount_paise": c.max_discount_paise,
            "current_usage_count": c.current_usage_count,
            "is_active": c.is_active,
            "valid_until": c.valid_until.strftime("%d %b %Y"),
        }
        for c in coupons
    ]
    return APIResponse(data=items)


@router.post("/coupons", response_model=APIResponse[dict])
async def create_admin_coupon(
    data: CreateCouponRequest,
    current_user: User = Depends(require_admin)
):
    clean_code = data.code.upper().strip()
    existing = await Coupon.find_one(Coupon.code == clean_code)
    if existing:
        raise BadRequestException(f"Coupon code '{clean_code}' already exists")

    now = datetime.now(timezone.utc)
    coupon = Coupon(
        code=clean_code,
        description=data.description,
        discount_type=data.discount_type,
        discount_value=data.discount_value,
        min_cart_value_paise=data.min_cart_value_paise,
        max_discount_paise=data.max_discount_paise,
        valid_until=now + timedelta(days=data.valid_days),
        is_active=True,
    )
    await coupon.insert()

    return APIResponse(
        message=f"Coupon '{coupon.code}' created successfully!",
        data={"coupon_id": str(coupon.id), "code": coupon.code}
    )


@router.delete("/coupons/{coupon_id}", response_model=APIResponse[dict])
async def delete_admin_coupon(
    coupon_id: str,
    current_user: User = Depends(require_admin)
):
    coupon = await Coupon.get(PydanticObjectId(coupon_id))
    if not coupon:
        raise NotFoundException("Coupon")

    await coupon.delete()
    return APIResponse(message="Coupon deleted successfully", data={"deleted": True})


@router.get("/cms/banners", response_model=APIResponse[List[dict]])
async def list_admin_banners(current_user: User = Depends(require_admin)):
    banners = await Banner.find_all().sort(+Banner.sort_order).to_list()
    items = [
        {
            "id": str(b.id),
            "title": b.title,
            "subtitle": b.subtitle,
            "image_url": b.image_url,
            "link_url": b.link_url,
            "position": b.position,
            "sort_order": b.sort_order,
            "is_active": b.is_active,
        }
        for b in banners
    ]
    return APIResponse(data=items)


@router.post("/cms/banners", response_model=APIResponse[dict])
async def create_admin_banner(
    data: CreateBannerRequest,
    current_user: User = Depends(require_admin)
):
    banner = Banner(
        title=data.title,
        subtitle=data.subtitle,
        image_url=data.image_url,
        link_url=data.link_url,
        position=data.position,
        sort_order=data.sort_order,
        is_active=True,
    )
    await banner.insert()
    return APIResponse(message="Banner created successfully", data={"banner_id": str(banner.id)})


@router.delete("/cms/banners/{banner_id}", response_model=APIResponse[dict])
async def delete_admin_banner(
    banner_id: str,
    current_user: User = Depends(require_admin)
):
    banner = await Banner.get(PydanticObjectId(banner_id))
    if not banner:
        raise NotFoundException("Banner")

    await banner.delete()
    return APIResponse(message="Banner deleted successfully", data={"deleted": True})


@router.get("/reports/financial-export")
async def export_financial_report_csv(current_user: User = Depends(require_admin)):
    orders = await Order.find_all().sort(-Order.created_at).to_list()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Order Number", "Order Date", "Customer", "Subtotal (INR)", "Tax 18% (INR)",
        "Discount (INR)", "Total (INR)", "Platform Comm (INR)", "Status", "Payment Method"
    ])

    for o in orders:
        comm = sum(item.seller_commission_paise for item in o.items)
        writer.writerow([
            o.order_number,
            o.created_at.strftime("%Y-%m-%d %H:%M"),
            o.shipping_address.full_name,
            f"{o.subtotal_paise / 100:.2f}",
            f"{o.tax_paise / 100:.2f}",
            f"{o.discount_paise / 100:.2f}",
            f"{o.total_amount_paise / 100:.2f}",
            f"{comm / 100:.2f}",
            o.order_status.value,
            o.payment_method.value,
        ])

    csv_data = output.getvalue()
    output.close()

    return StreamResponse(
        content=csv_data,
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=ShopVerse-Financial-Report-{datetime.now().strftime('%Y%m%d')}.csv"
        }
    )
