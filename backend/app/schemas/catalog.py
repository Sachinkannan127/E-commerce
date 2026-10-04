from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from app.models.product import (
    ProductImage,
    ProductSpecification,
    ProductHighlight,
    ProductVariant,
    VariantAttribute,
)


class CategoryNode(BaseModel):
    id: str
    name: str
    slug: str
    description: Optional[str] = None
    icon_url: Optional[str] = None
    banner_url: Optional[str] = None
    level: int
    children: List["CategoryNode"] = Field(default_factory=list)


class BrandResponse(BaseModel):
    id: str
    name: str
    slug: str
    logo_url: Optional[str] = None
    is_featured: bool


class ProductFilterParams(BaseModel):
    category_slug: Optional[str] = None
    brand_slug: Optional[str] = None
    min_price: Optional[int] = None  # in paise
    max_price: Optional[int] = None  # in paise
    min_rating: Optional[float] = None
    min_discount: Optional[int] = None  # in %
    search_query: Optional[str] = None
    is_featured: Optional[bool] = None
    is_bestseller: Optional[bool] = None
    is_trending: Optional[bool] = None
    is_flash_deal: Optional[bool] = None
    in_stock_only: bool = False
    sort: Optional[str] = "relevance"  # relevance, price_asc, price_desc, rating_desc, newest


class ProductSummaryCard(BaseModel):
    id: str
    title: str
    slug: str
    category_slug: str
    brand_name: Optional[str] = None
    primary_image: Optional[str] = None
    base_price_paise: int
    compare_at_price_paise: Optional[int] = None
    discount_pct: int
    avg_rating: float
    review_count: int
    total_stock: int
    is_bestseller: bool
    is_trending: bool
    is_flash_deal: bool


class ProductDetailResponse(BaseModel):
    id: str
    seller_id: str
    category_id: str
    category_slug: str
    brand_id: Optional[str] = None
    brand_name: Optional[str] = None
    title: str
    slug: str
    description: str
    short_description: Optional[str] = None
    tags: List[str]
    images: List[ProductImage]
    variants: List[ProductVariant]
    specifications: List[ProductSpecification]
    highlights: List[ProductHighlight]
    base_price_paise: int
    compare_at_price_paise: Optional[int] = None
    discount_pct: int
    total_stock: int
    avg_rating: float
    review_count: int
    is_bestseller: bool
    is_trending: bool
    is_flash_deal: bool
    flash_deal_end_at: Optional[datetime] = None


class ProductCreateRequest(BaseModel):
    category_id: str
    brand_id: Optional[str] = None
    brand_name: Optional[str] = None
    title: str
    description: str
    short_description: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    images: List[ProductImage] = Field(default_factory=list)
    variants: List[ProductVariant] = Field(default_factory=list)
    specifications: List[ProductSpecification] = Field(default_factory=list)
    highlights: List[ProductHighlight] = Field(default_factory=list)
    is_published: bool = True
