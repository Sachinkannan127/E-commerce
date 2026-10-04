from typing import List, Optional
from fastapi import APIRouter, Query, Depends
from app.schemas.catalog import (
    ProductFilterParams,
    ProductSummaryCard,
    ProductDetailResponse,
)
from app.schemas.common import APIResponse, PaginatedResponse
from app.services.catalog_service import CatalogService

router = APIRouter(prefix="/products", tags=["Products"])


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


@router.get("/{slug}", response_model=APIResponse[ProductDetailResponse])
async def get_product_detail(slug: str):
    product = await CatalogService.get_product_by_slug(slug)
    return APIResponse(data=product)
