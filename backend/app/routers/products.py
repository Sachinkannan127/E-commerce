import random
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from fastapi import APIRouter, Query, Depends, status
from pydantic import BaseModel
from beanie import PydanticObjectId
from app.schemas.catalog import (
    ProductFilterParams,
    ProductSummaryCard,
    ProductDetailResponse,
)
from app.schemas.common import APIResponse, PaginatedResponse
from app.services.catalog_service import CatalogService
from app.models.product import Product
from app.models.wishlist import Wishlist, WishlistItem
from app.middlewares.auth_guard import get_current_user_optional, get_current_user
from app.models.user import User
from app.core.exceptions import NotFoundException, BadRequestException

router = APIRouter(prefix="/products", tags=["Products"])


class PincodeCheckRequest(BaseModel):
    pincode: str
    product_id: Optional[str] = None


class PincodeCheckResponse(BaseModel):
    pincode: str
    is_deliverable: bool
    estimated_delivery_days: int
    estimated_delivery_date: str
    is_cod_available: bool
    shipping_fee_paise: int
    free_delivery_threshold_paise: int


class PriceAlertRequest(BaseModel):
    target_price_paise: int


@router.get("", response_model=APIResponse[PaginatedResponse[ProductSummaryCard]])
async def list_products(
    category_slug: Optional[str] = Query(None),
    brand_slug: Optional[str] = Query(None),
    min_price: Optional[int] = Query(None),
    max_price: Optional[int] = Query(None),
    min_rating: Optional[float] = Query(None),
    min_discount: Optional[int] = Query(None),
    search_query: Optional[str] = Query(None, alias="q"),
    is_featured: Optional[bool] = Query(None),
    is_bestseller: Optional[bool] = Query(None),
    is_trending: Optional[bool] = Query(None),
    is_flash_deal: Optional[bool] = Query(None),
    in_stock_only: bool = Query(False),
    sort: Optional[str] = Query("relevance"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    filters = ProductFilterParams(
        category_slug=category_slug,
        brand_slug=brand_slug,
        min_price=min_price,
        max_price=max_price,
        min_rating=min_rating,
        min_discount=min_discount,
        search_query=search_query,
        is_featured=is_featured,
        is_bestseller=is_bestseller,
        is_trending=is_trending,
        is_flash_deal=is_flash_deal,
        in_stock_only=in_stock_only,
        sort=sort,
    )
    items, total = await CatalogService.list_products(filters, page=page, limit=limit)
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


@router.post("/pincode-check", response_model=APIResponse[PincodeCheckResponse])
async def check_pincode_delivery(data: PincodeCheckRequest):
    pincode = data.pincode.strip()
    if not pincode.isdigit() or len(pincode) != 6:
        raise BadRequestException("Please enter a valid 6-digit Indian PIN code")

    # Dynamic estimation logic based on zone
    first_digit = int(pincode[0])
    delivery_days = 2 if first_digit in [1, 2, 4, 5, 6] else 3
    delivery_date = (datetime.now(timezone.utc) + timedelta(days=delivery_days)).strftime("%A, %d %B")

    return APIResponse(
        data=PincodeCheckResponse(
            pincode=pincode,
            is_deliverable=True,
            estimated_delivery_days=delivery_days,
            estimated_delivery_date=delivery_date,
            is_cod_available=True,
            shipping_fee_paise=4900,
            free_delivery_threshold_paise=49900,
        )
    )


@router.get("/{slug}", response_model=APIResponse[ProductDetailResponse])
async def get_product_detail(slug: str):
    product = await CatalogService.get_product_by_slug(slug)
    return APIResponse(data=product)


@router.get("/{product_id}/similar", response_model=APIResponse[List[ProductSummaryCard]])
async def get_similar_products(product_id: str, limit: int = Query(6, ge=1, le=12)):
    product = await Product.get(PydanticObjectId(product_id))
    if not product:
        raise NotFoundException("Product")

    # Find products in same category or brand
    similar = await Product.find(
        Product.id != product.id,
        Product.category_slug == product.category_slug,
        Product.is_published == True,
        Product.is_deleted == False,
    ).limit(limit).to_list()

    items = [
        ProductSummaryCard(
            id=str(p.id),
            title=p.title,
            slug=p.slug,
            category_slug=p.category_slug,
            brand_name=p.brand_name,
            primary_image=p.images[0].url if p.images else None,
            base_price_paise=p.base_price_paise,
            compare_at_price_paise=p.compare_at_price_paise,
            discount_pct=p.discount_pct,
            avg_rating=p.avg_rating,
            review_count=p.review_count,
            total_stock=p.total_stock,
            is_bestseller=p.is_bestseller,
            is_trending=p.is_trending,
            is_flash_deal=p.is_flash_deal,
        )
        for p in similar
    ]
    return APIResponse(data=items)


@router.post("/{product_id}/price-alert", response_model=APIResponse[dict])
async def set_price_alert(
    product_id: str,
    data: PriceAlertRequest,
    current_user: User = Depends(get_current_user)
):
    product = await Product.get(PydanticObjectId(product_id))
    if not product:
        raise NotFoundException("Product")

    wishlist = await Wishlist.find_one(Wishlist.user_id == current_user.id)
    if not wishlist:
        wishlist = Wishlist(user_id=current_user.id, items=[])
        await wishlist.insert()

    # Update or add price alert on wishlist item
    existing = next((item for item in wishlist.items if item.product_id == product.id), None)
    if existing:
        existing.target_price_alert_paise = data.target_price_paise
    else:
        wishlist.items.append(
            WishlistItem(
                product_id=product.id,
                target_price_alert_paise=data.target_price_paise
            )
        )
    await wishlist.save()

    return APIResponse(
        message=f"Price drop alert set for ₹{data.target_price_paise / 100:.2f}",
        data={"product_id": product_id, "target_price_paise": data.target_price_paise}
    )
