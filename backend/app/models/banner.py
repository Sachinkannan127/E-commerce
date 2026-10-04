from datetime import datetime, timezone
from typing import Optional
from beanie import Document, Indexed
from pydantic import Field


class Banner(Document):
    title: str
    subtitle: Optional[str] = None
    image_url: str
    mobile_image_url: Optional[str] = None
    link_url: str
    position: str = "HERO_HOME"  # HERO_HOME, CATEGORY_STRIP, FLASH_DEALS_BANNER
    sort_order: int = 0
    is_active: bool = True
    start_at: Optional[datetime] = None
    end_at: Optional[datetime] = None

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "banners"
        indexes = [
            "position",
            "is_active",
            "sort_order",
        ]
