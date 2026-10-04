from datetime import datetime, timezone
from typing import Optional, List
from beanie import Document, Indexed, PydanticObjectId
from pydantic import Field


class Category(Document):
    name: str
    slug: Indexed(str, unique=True)
    description: Optional[str] = None
    parent_id: Optional[Indexed(PydanticObjectId)] = None
    level: int = Field(default=0, ge=0, le=3)  # 0: Root, 1: Subcategory, 2: Sub-subcategory
    icon_url: Optional[str] = None
    banner_url: Optional[str] = None
    sort_order: int = 0
    is_active: bool = True
    is_featured: bool = False
    
    # Path of ancestry slugs e.g. ["electronics", "mobiles", "smartphones"]
    slug_path: List[str] = Field(default_factory=list)

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "categories"
        indexes = [
            "slug",
            "parent_id",
            "level",
            "is_active",
            "sort_order",
        ]
