from datetime import datetime, timezone
from typing import Optional
from beanie import Document, Indexed
from pydantic import Field


class Brand(Document):
    name: str
    slug: Indexed(str, unique=True)
    description: Optional[str] = None
    logo_url: Optional[str] = None
    website: Optional[str] = None
    is_featured: bool = False
    is_active: bool = True

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "brands"
        indexes = [
            "slug",
            "is_featured",
            "is_active",
        ]
