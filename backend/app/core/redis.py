import json
from typing import Any, Optional
import redis.asyncio as redis
from app.core.config import settings
from app.core.logging import logger

redis_client: Optional[redis.Redis] = None


async def init_redis() -> redis.Redis:
    global redis_client
    try:
        redis_client = redis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            max_connections=20
        )
        await redis_client.ping()
        logger.info("Connected to Redis successfully.")
        return redis_client
    except Exception as e:
        logger.warning(f"Failed to connect to Redis: {e}. Running with in-memory fallback if needed.")
        return None


async def close_redis():
    global redis_client
    if redis_client:
        await redis_client.close()
        logger.info("Redis connection closed.")


async def get_cache(key: str) -> Optional[Any]:
    if not redis_client:
        return None
    try:
        val = await redis_client.get(key)
        if val:
            return json.loads(val)
        return None
    except Exception as e:
        logger.error(f"Redis get error for key '{key}': {e}")
        return None


async def set_cache(key: str, value: Any, expire_seconds: int = 300):
    if not redis_client:
        return
    try:
        await redis_client.set(key, json.dumps(value, default=str), ex=expire_seconds)
    except Exception as e:
        logger.error(f"Redis set error for key '{key}': {e}")


async def delete_cache(pattern: str):
    if not redis_client:
        return
    try:
        keys = await redis_client.keys(pattern)
        if keys:
            await redis_client.delete(*keys)
    except Exception as e:
        logger.error(f"Redis delete error for pattern '{pattern}': {e}")
