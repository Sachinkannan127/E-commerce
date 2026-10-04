from typing import List
from fastapi import APIRouter
from app.schemas.catalog import BrandResponse
from app.schemas.common import APIResponse
from app.models.brand import Brand
from app.core.redis import get_cache, set_cache

router = APIRouter(prefix="/brands", tags=["Brands"])


@router.get("", response_model=APIResponse[List[BrandResponse]])
async def list_brands():
    cache_key = "catalog:brands:all"
    cached = await get_cache(cache_key)
    if cached:
        return APIResponse(data=[BrandResponse(**b) for b in cached])

    brands = await Brand.find(Brand.is_active == True).sort(+Brand.name).to_list()
    items = [
        BrandResponse(
            id=str(b.id),
            name=b.name,
            slug=b.slug,
            logo_url=b.logo_url,
            is_featured=b.is_featured,
        )
        for b in brands
    ]

    await set_cache(cache_key, [b.model_dump() for b in items], expire_seconds=3600)
    return APIResponse(data=items)
