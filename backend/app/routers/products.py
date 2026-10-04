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


class CompareProductsRequest(BaseModel):
    product_ids: List[str]


@router.post("/compare", response_model=APIResponse[dict])
async def compare_products(data: CompareProductsRequest):
    if not data.product_ids or len(data.product_ids) > 4:
        raise BadRequestException("Please provide between 1 and 4 product IDs to compare")

    valid_ids = []
    for pid in data.product_ids:
        try:
            valid_ids.append(PydanticObjectId(pid))
        except Exception:
            continue

    products = await Product.find({"_id": {"$in": valid_ids}, "is_deleted": False}).to_list()
    if not products:
        raise NotFoundException("Products")

    # Collect all unique spec attributes
    all_spec_keys = set()
    for p in products:
        for spec in p.specifications:
            all_spec_keys.add(spec.name)

    # Build comparison matrix
    items_summary = []
    for p in products:
        specs_dict = {s.name: s.value for s in p.specifications}
        items_summary.append({
            "id": str(p.id),
            "title": p.title,
            "slug": p.slug,
            "category_slug": p.category_slug,
            "brand_name": p.brand_name,
            "primary_image": p.images[0].url if p.images else None,
            "base_price_paise": p.base_price_paise,
            "compare_at_price_paise": p.compare_at_price_paise,
            "discount_pct": p.discount_pct,
            "avg_rating": p.avg_rating,
            "review_count": p.review_count,
            "total_stock": p.total_stock,
            "warranty": p.warranty_info or "1 Year Manufacturer Warranty",
            "return_window": "7 Days Replacement" if p.is_returnable else "Non-Returnable",
            "is_cod_available": p.is_cod_available,
            "highlights": [h.text for h in p.highlights],
            "specs": {key: specs_dict.get(key, "—") for key in sorted(all_spec_keys)},
        })

    return APIResponse(
        data={
            "products": items_summary,
            "spec_attributes": sorted(list(all_spec_keys)),
            "count": len(items_summary),
        }
    )


@router.get("/{product_id}/frequently-bought-together", response_model=APIResponse[dict])
async def get_frequently_bought_together(product_id: str):
    try:
        pid = PydanticObjectId(product_id)
    except Exception:
        raise BadRequestException("Invalid product ID")

    main_product = await Product.get(pid)
    if not main_product:
        raise NotFoundException("Product")

    # Find 2 complementary products from same category or trending
    companions = await Product.find(
        Product.id != main_product.id,
        Product.is_published == True,
        Product.is_deleted == False,
    ).limit(4).to_list()

    # Pick up to 2 items
    selected_companions = companions[:2]
    all_bundle_products = [main_product] + selected_companions

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
        for p in all_bundle_products
    ]

    total_base_price = sum(p.base_price_paise for p in all_bundle_products)
    bundle_discount_pct = 5  # 5% Extra Bundle discount
    bundle_savings = int(total_base_price * (bundle_discount_pct / 100))
    bundle_price = total_base_price - bundle_savings

    return APIResponse(
        data={
            "main_product_id": str(main_product.id),
            "bundle_items": items,
            "total_items": len(items),
            "original_total_paise": total_base_price,
            "bundle_discount_pct": bundle_discount_pct,
            "bundle_savings_paise": bundle_savings,
            "bundle_price_paise": bundle_price,
        }
    )

