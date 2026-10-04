from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, status
from pydantic import BaseModel
from beanie import PydanticObjectId
from app.models.wishlist import Wishlist, WishlistItem
from app.models.product import Product
from app.models.user import User
from app.schemas.common import APIResponse
from app.schemas.catalog import ProductSummaryCard
from app.middlewares.auth_guard import get_current_user
from app.core.exceptions import NotFoundException

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])


class WishlistResponse(BaseModel):
    items: List[ProductSummaryCard]
    total_count: int


@router.get("", response_model=APIResponse[WishlistResponse])
async def get_wishlist(current_user: User = Depends(get_current_user)):
    wishlist = await Wishlist.find_one(Wishlist.user_id == current_user.id)
    if not wishlist or not wishlist.items:
        return APIResponse(data=WishlistResponse(items=[], total_count=0))

    product_ids = [item.product_id for item in wishlist.items]
    products = await Product.find(
        {"_id": {"$in": product_ids}, "is_deleted": False}
    ).to_list()

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
        for p in products
    ]

    return APIResponse(data=WishlistResponse(items=items, total_count=len(items)))


@router.post("/{product_id}", response_model=APIResponse[dict])
async def toggle_wishlist_item(
    product_id: str,
    current_user: User = Depends(get_current_user)
):
    product = await Product.get(PydanticObjectId(product_id))
    if not product:
        raise NotFoundException("Product")

    wishlist = await Wishlist.find_one(Wishlist.user_id == current_user.id)
    if not wishlist:
        wishlist = Wishlist(user_id=current_user.id, items=[])
        await wishlist.insert()

    existing = next((i for i in wishlist.items if i.product_id == product.id), None)
    if existing:
        wishlist.items = [i for i in wishlist.items if i.product_id != product.id]
        is_wishlisted = False
        message = "Removed from Wishlist"
    else:
        wishlist.items.append(WishlistItem(product_id=product.id))
        is_wishlisted = True
        message = "Added to Wishlist"

    wishlist.updated_at = datetime.now(timezone.utc)
    await wishlist.save()

    return APIResponse(
        message=message,
        data={"product_id": product_id, "is_wishlisted": is_wishlisted}
    )


@router.delete("/{product_id}", response_model=APIResponse[dict])
async def remove_wishlist_item(
    product_id: str,
    current_user: User = Depends(get_current_user)
):
    wishlist = await Wishlist.find_one(Wishlist.user_id == current_user.id)
    if wishlist:
        wishlist.items = [i for i in wishlist.items if str(i.product_id) != product_id]
        wishlist.updated_at = datetime.now(timezone.utc)
        await wishlist.save()

    return APIResponse(message="Removed from Wishlist", data={"removed": True})
