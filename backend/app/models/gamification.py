from datetime import datetime, timezone
from enum import Enum
from typing import Optional
from beanie import Document, Indexed
from pydantic import Field


class SpinRewardType(str, Enum):
    COUPON = "COUPON"
    WALLET_CASH = "WALLET_CASH"
    LOYALTY_POINTS = "LOYALTY_POINTS"
    NO_LUCK = "NO_LUCK"


class SpinLog(Document):
    user_id: Indexed(str)
    winning_index: int
    reward_type: SpinRewardType
    reward_label: str
    reward_code: Optional[str] = None
    reward_value_paise: int = 0
    spun_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "spin_logs"
        indexes = [
            "user_id",
            "spun_at",
            "reward_type",
        ]
