from typing import List, Optional
from fastapi import APIRouter, Query, Depends, status
from pydantic import BaseModel
from beanie import PydanticObjectId
from app.schemas.common import APIResponse
from app.models.brand import Brand
from app.models.category import Category
from app.models.product import Product
from app.models.audit import SearchLog
from app.schemas.catalog import BrandResponse, ProductSummaryCard
from app.core.redis import get_cache, set_cache

router = APIRouter(prefix="/search", tags=["Search & Suggestions"])


class SuggestionItem(BaseModel):
    title: str
    slug: str
    type: str  # "product", "category", "brand"
    image_url: Optional[str] = None
    price_paise: Optional[int] = None
    category_slug: Optional[str] = None


class SearchSuggestResponse(BaseModel):
    query: str
    suggestions: List[SuggestionItem]
    trending: List[str]


@router.get("/suggest", response_model=APIResponse[SearchSuggestResponse])
async def search_suggestions(q: str = Query(..., min_length=1, max_length=100)):
    cache_key = f"search:suggest:{q.lower().strip()}"
    cached = await get_cache(cache_key)
    if cached:
        return APIResponse(data=SearchSuggestResponse(**cached))

    clean_q = q.strip()
    suggestions: List[SuggestionItem] = []

    # 1. Match categories
    matching_cats = await Category.find(
        {"name": {"$regex": clean_q, "$options": "i"}, "is_active": True}
    ).limit(3).to_list()
    for cat in matching_cats:
        suggestions.append(
            SuggestionItem(
                title=f"In {cat.name}",
                slug=cat.slug,
                type="category",
                image_url=cat.icon_url,
                category_slug=cat.slug,
            )
        )

    # 2. Match brands
    matching_brands = await Brand.find(
        {"name": {"$regex": clean_q, "$options": "i"}, "is_active": True}
    ).limit(3).to_list()
    for brand in matching_brands:
        suggestions.append(
            SuggestionItem(
                title=f"{brand.name} Store",
                slug=brand.slug,
                type="brand",
                image_url=brand.logo_url,
            )
        )

    # 3. Match Products
    matching_products = await Product.find(
        {
            "$or": [
                {"title": {"$regex": clean_q, "$options": "i"}},
                {"tags": {"$regex": clean_q, "$options": "i"}},
            ],
            "is_published": True,
            "is_deleted": False,
        }
    ).limit(6).to_list()

    for p in matching_products:
        suggestions.append(
            SuggestionItem(
                title=p.title,
                slug=p.slug,
                type="product",
                image_url=p.images[0].url if p.images else None,
                price_paise=p.base_price_paise,
                category_slug=p.category_slug,
            )
        )

    # Log search query asynchronously for analytics
    search_log = SearchLog(query=clean_q, result_count=len(suggestions))
    await search_log.insert()

    trending_terms = [
        "Headphones",
        "Smartphones",
        "Running Shoes",
        "Casual Shirts",
        "Air Fryer",
        "Yoga Mat",
        "Kurtas",
    ]

    result = SearchSuggestResponse(
        query=clean_q,
        suggestions=suggestions,
        trending=trending_terms,
    )

    await set_cache(cache_key, result.model_dump(), expire_seconds=300)
    return APIResponse(data=result)


@router.get("/trending", response_model=APIResponse[List[str]])
async def get_trending_searches():
    return APIResponse(
        data=[
            "Wireless Earbuds",
            "5G Smartphones",
            "Air Fryer",
            "Smartwatch",
            "Cotton Shirts",
            "Running Shoes",
            "Whey Protein",
            "Skin Serum",
        ]
    )
