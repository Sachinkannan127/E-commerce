from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional, Dict, Any
from beanie import Document, Indexed, PydanticObjectId
from pydantic import BaseModel, Field
import pymongo


class ProductImage(BaseModel):
    url: str
    alt: Optional[str] = None
    is_primary: bool = False
    display_order: int = 0


class ProductSpecification(BaseModel):
    group: str  # e.g. "General", "Display", "Processor"
    name: str   # e.g. "Screen Size", "RAM"
    value: str  # e.g. "6.7 inches", "12GB"


class ProductHighlight(BaseModel):
    icon: Optional[str] = None
    text: str


class VariantAttribute(BaseModel):
    name: str   # "Color", "Size", "Storage"
    value: str  # "Midnight Blue", "XL", "256GB"


class ProductVariant(BaseModel):
    variant_id: str
    sku: str
    attributes: List[VariantAttribute] = Field(default_factory=list)
    price_paise: int = Field(ge=0)
    compare_at_price_paise: Optional[int] = Field(default=None, ge=0)
    stock: int = Field(default=0, ge=0)
    reserved_stock: int = Field(default=0, ge=0)  # In active checkout holds
    images: List[ProductImage] = Field(default_factory=list)
    is_active: bool = True


class Product(Document):
    seller_id: Indexed(PydanticObjectId)
    category_id: Indexed(PydanticObjectId)
    category_slug: Indexed(str)
    brand_id: Optional[Indexed(PydanticObjectId)] = None
    brand_name: Optional[Indexed(str)] = None
    
    title: str
    slug: Indexed(str, unique=True)
    description: str
    short_description: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    
    images: List[ProductImage] = Field(default_factory=list)
    variants: List[ProductVariant] = Field(default_factory=list)
    specifications: List[ProductSpecification] = Field(default_factory=list)
    highlights: List[ProductHighlight] = Field(default_factory=list)
    
    # Pricing summaries (derived from default/cheapest variant)
    base_price_paise: Indexed(int) = Field(ge=0)
    compare_at_price_paise: Optional[int] = None
    discount_pct: int = 0
    total_stock: int = 0
    
    # Social & Rating Stats
    avg_rating: Indexed(float) = 0.0
    review_count: int = 0
    view_count: int = 0
    sales_count: int = 0
    
    # Badges & Flags
    is_published: bool = True
    is_featured: bool = False
    is_bestseller: bool = False
    is_trending: bool = False
    is_flash_deal: bool = False
    flash_deal_end_at: Optional[datetime] = None
    is_deleted: bool = False
    
    # SEO
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "products"
        indexes = [
            "slug",
            "seller_id",
            "category_id",
            "category_slug",
            "brand_id",
            "base_price_paise",
            "avg_rating",
            "is_published",
            "is_featured",
            "is_flash_deal",
            "created_at",
            [
                ("category_id", pymongo.ASCENDING),
                ("base_price_paise", pymongo.ASCENDING),
                ("avg_rating", pymongo.DESCENDING),
            ],
            [
                ("title", pymongo.TEXT),
                ("tags", pymongo.TEXT),
                ("description", pymongo.TEXT),
                ("brand_name", pymongo.TEXT),
            ],
        ]
