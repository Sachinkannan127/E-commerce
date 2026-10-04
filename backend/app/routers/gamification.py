import random
import string
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, status
from pydantic import BaseModel

from app.schemas.common import APIResponse
from app.middlewares.auth_guard import get_current_user
from app.models.user import User
from app.models.gamification import SpinLog, SpinRewardType
from app.models.coupon import Coupon, DiscountType
from app.core.exceptions import BadRequestException

router = APIRouter(prefix="/gamification", tags=["Gamification & Spin and Win"])

WHEEL_SEGMENTS = [
    {
        "index": 0,
        "label": "₹50 Flat OFF",
        "description": "Flat ₹50 OFF on orders above ₹499",
        "type": SpinRewardType.COUPON,
        "color": "#FF6B6B",
        "weight": 20,
    },
    {
        "index": 1,
        "label": "10% Super OFF",
        "description": "10% Instant Discount up to ₹150",
        "type": SpinRewardType.COUPON,
        "color": "#4ECDC4",
        "weight": 15,
    },
    {
        "index": 2,
        "label": "Free Delivery",
        "description": "Zero shipping fee on your next order",
        "type": SpinRewardType.COUPON,
        "color": "#45B7D1",
        "weight": 20,
    },
    {
        "index": 3,
        "label": "₹100 Wallet Cash",
        "description": "Instant ₹100 credited directly to your wallet",
        "type": SpinRewardType.WALLET_CASH,
        "color": "#FFA07A",
        "weight": 10,
    },
    {
        "index": 4,
        "label": "Better Luck Next Time",
        "description": "Try again tomorrow for big surprises!",
        "type": SpinRewardType.NO_LUCK,
        "color": "#98D8C8",
        "weight": 10,
    },
    {
        "index": 5,
        "label": "₹200 Mega OFF",
        "description": "₹200 Flat OFF on orders above ₹999",
        "type": SpinRewardType.COUPON,
        "color": "#F7DC6F",
        "weight": 10,
    },
    {
        "index": 6,
        "label": "5% Instant OFF",
        "description": "5% Extra discount on any cart",
        "type": SpinRewardType.COUPON,
        "color": "#BB8FCE",
        "weight": 10,
    },
    {
        "index": 7,
        "label": "50 Loyalty Gems",
        "description": "50 Gems added to your reward tier",
        "type": SpinRewardType.LOYALTY_POINTS,
        "color": "#82E0AA",
        "weight": 5,
    },
]


def generate_coupon_code(prefix: str) -> str:
    suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"{prefix}-{suffix}"


@router.get("/status", response_model=APIResponse[dict])
async def get_spin_status(current_user: User = Depends(get_current_user)):
    user_id_str = str(current_user.id)
    last_spin = await SpinLog.find(SpinLog.user_id == user_id_str).sort("-spun_at").first_or_none()

    can_spin = True
    cooldown_seconds = 0
    next_spin_at = None

    if last_spin:
        now = datetime.now(timezone.utc)
        elapsed = now - last_spin.spun_at.replace(tzinfo=timezone.utc) if last_spin.spun_at.tzinfo is None else now - last_spin.spun_at
        cooldown_period = timedelta(hours=24)
        if elapsed < cooldown_period:
            can_spin = False
            remaining = cooldown_period - elapsed
            cooldown_seconds = int(remaining.total_seconds())
            next_spin_at = (now + remaining).isoformat()

    return APIResponse(
        data={
            "can_spin": can_spin,
            "cooldown_seconds": cooldown_seconds,
            "next_spin_at": next_spin_at,
            "segments": WHEEL_SEGMENTS,
            "wallet_balance_paise": current_user.wallet_balance_paise,
            "loyalty_points": current_user.loyalty_points,
        }
    )


@router.post("/spin", response_model=APIResponse[dict])
async def play_spin_and_win(current_user: User = Depends(get_current_user)):
    user_id_str = str(current_user.id)
    last_spin = await SpinLog.find(SpinLog.user_id == user_id_str).sort("-spun_at").first_or_none()

    if last_spin:
        now = datetime.now(timezone.utc)
        spun_time = last_spin.spun_at.replace(tzinfo=timezone.utc) if last_spin.spun_at.tzinfo is None else last_spin.spun_at
        elapsed = now - spun_time
        if elapsed < timedelta(hours=24):
            remaining = timedelta(hours=24) - elapsed
            raise BadRequestException(f"You can only spin once every 24 hours. Next spin available in {remaining.seconds // 3600}h {(remaining.seconds // 60) % 60}m.")

    # Weighted random selection
    weights = [s["weight"] for s in WHEEL_SEGMENTS]
    winning_segment = random.choices(WHEEL_SEGMENTS, weights=weights, k=1)[0]
    win_idx = winning_segment["index"]
    reward_type = winning_segment["type"]
    reward_code = None
    reward_value_paise = 0

    now_utc = datetime.now(timezone.utc)
    expiry_date = now_utc + timedelta(days=7)

    if win_idx == 0:  # ₹50 Flat OFF min 499
        reward_code = generate_coupon_code("SPIN50")
        coupon = Coupon(
            code=reward_code,
            discount_type=DiscountType.FLAT,
            discount_value_paise=5000,
            min_order_value_paise=49900,
            valid_from=now_utc,
            valid_until=expiry_date,
            usage_limit_per_user=1,
            total_usage_limit=1,
            is_active=True,
        )
        await coupon.insert()
        reward_value_paise = 5000

    elif win_idx == 1:  # 10% OFF max 150
        reward_code = generate_coupon_code("SPIN10")
        coupon = Coupon(
            code=reward_code,
            discount_type=DiscountType.PERCENTAGE,
            discount_value_pct=10.0,
            max_discount_paise=15000,
            min_order_value_paise=29900,
            valid_from=now_utc,
            valid_until=expiry_date,
            usage_limit_per_user=1,
            total_usage_limit=1,
            is_active=True,
        )
        await coupon.insert()

    elif win_idx == 2:  # Free Delivery
        reward_code = generate_coupon_code("SPINFREE")
        coupon = Coupon(
            code=reward_code,
            discount_type=DiscountType.FLAT,
            discount_value_paise=4900,
            min_order_value_paise=0,
            valid_from=now_utc,
            valid_until=expiry_date,
            usage_limit_per_user=1,
            total_usage_limit=1,
            is_active=True,
        )
        await coupon.insert()
        reward_value_paise = 4900

    elif win_idx == 3:  # ₹100 Wallet Cash
        current_user.wallet_balance_paise += 10000
        await current_user.save()
        reward_value_paise = 10000

    elif win_idx == 5:  # ₹200 OFF on 999
        reward_code = generate_coupon_code("SPIN200")
        coupon = Coupon(
            code=reward_code,
            discount_type=DiscountType.FLAT,
            discount_value_paise=20000,
            min_order_value_paise=99900,
            valid_from=now_utc,
            valid_until=expiry_date,
            usage_limit_per_user=1,
            total_usage_limit=1,
            is_active=True,
        )
        await coupon.insert()
        reward_value_paise = 20000

    elif win_idx == 6:  # 5% Instant OFF
        reward_code = generate_coupon_code("SPIN5")
        coupon = Coupon(
            code=reward_code,
            discount_type=DiscountType.PERCENTAGE,
            discount_value_pct=5.0,
            max_discount_paise=10000,
            min_order_value_paise=19900,
            valid_from=now_utc,
            valid_until=expiry_date,
            usage_limit_per_user=1,
            total_usage_limit=1,
            is_active=True,
        )
        await coupon.insert()

    elif win_idx == 7:  # 50 Loyalty Gems
        current_user.loyalty_points += 50
        await current_user.save()

    # Save log
    spin_log = SpinLog(
        user_id=user_id_str,
        winning_index=win_idx,
        reward_type=reward_type,
        reward_label=winning_segment["label"],
        reward_code=reward_code,
        reward_value_paise=reward_value_paise,
        spun_at=now_utc,
    )
    await spin_log.insert()

    return APIResponse(
        message="Spin successful!",
        data={
            "winning_index": win_idx,
            "segment": winning_segment,
            "reward_code": reward_code,
            "reward_label": winning_segment["label"],
            "reward_description": winning_segment["description"],
            "reward_type": reward_type.value,
            "updated_wallet_balance_paise": current_user.wallet_balance_paise,
            "updated_loyalty_points": current_user.loyalty_points,
            "next_spin_at": (now_utc + timedelta(hours=24)).isoformat(),
        }
    )


@router.get("/rewards", response_model=APIResponse[List[dict]])
async def get_user_spin_history(current_user: User = Depends(get_current_user)):
    user_id_str = str(current_user.id)
    logs = await SpinLog.find(SpinLog.user_id == user_id_str).sort("-spun_at").limit(20).to_list()
    
    items = [
        {
            "id": str(log.id),
            "label": log.reward_label,
            "code": log.reward_code,
            "type": log.reward_type.value,
            "value_paise": log.reward_value_paise,
            "spun_at": log.spun_at.strftime("%d %b %Y, %I:%M %p"),
        }
        for log in logs
    ]
    return APIResponse(data=items)
