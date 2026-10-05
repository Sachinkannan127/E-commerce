import time
from typing import Dict, Any
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
from app.core.logging import logger
from app.models import (
    User,
    SellerProfile,
    Address,
    Category,
    Brand,
    Product,
    Cart,
    Order,
    PaymentTransaction,
    Review,
    Wishlist,
    Coupon,
    Banner,
    InAppNotification,
    SellerPayout,
    AuditLog,
    SearchLog,
    RecentlyViewed,
    OtpCode,
    SpinLog,
    ResellerProfile,
    ResellerSharedCatalog,
    ResellerOrderRecord,
)

motor_client: AsyncIOMotorClient = None


async def ping_db() -> Dict[str, Any]:
    """
    Pings the MongoDB server to verify connectivity and latency.
    """
    global motor_client
    if motor_client is None:
        return {"status": "disconnected", "error": "Motor client is not initialized"}
    
    start_time = time.perf_counter()
    try:
        # Ping the admin database
        ping_res = await motor_client.admin.command("ping")
        elapsed_ms = (time.perf_counter() - start_time) * 1000
        return {
            "status": "connected" if ping_res.get("ok") == 1.0 else "degraded",
            "latency_ms": round(elapsed_ms, 2),
            "database": settings.MONGODB_DB_NAME,
        }
    except Exception as e:
        elapsed_ms = (time.perf_counter() - start_time) * 1000
        logger.error(f"MongoDB ping failed: {e}")
        return {
            "status": "error",
            "error": str(e),
            "latency_ms": round(elapsed_ms, 2),
        }


async def init_db():
    global motor_client
    masked_uri = settings.MONGODB_URI.split("@")[-1] if "@" in settings.MONGODB_URI else settings.MONGODB_URI
    logger.info(f"Connecting to MongoDB cluster: {masked_uri}...")
    
    motor_client = AsyncIOMotorClient(
        settings.MONGODB_URI,
        maxPoolSize=50,
        minPoolSize=10,
        serverSelectionTimeoutMS=5000,
    )
    
    # Verify connection with a live ping before initializing Beanie
    ping_result = await ping_db()
    if ping_result.get("status") == "connected":
        logger.info(
            f"MongoDB connection active & ping verified: {ping_result['latency_ms']}ms latency | database: '{settings.MONGODB_DB_NAME}'"
        )
    else:
        logger.warning(
            f"MongoDB ping warning: {ping_result.get('error', 'Unknown error')} (latency: {ping_result.get('latency_ms', 0)}ms)"
        )

    db = motor_client[settings.MONGODB_DB_NAME]

    document_models = [
        User,
        SellerProfile,
        Address,
        Category,
        Brand,
        Product,
        Cart,
        Order,
        PaymentTransaction,
        Review,
        Wishlist,
        Coupon,
        Banner,
        InAppNotification,
        SellerPayout,
        AuditLog,
        SearchLog,
        RecentlyViewed,
        OtpCode,
        SpinLog,
        ResellerProfile,
        ResellerSharedCatalog,
        ResellerOrderRecord,
    ]

    await init_beanie(database=db, document_models=document_models)
    logger.info(f"Beanie ODM initialized successfully with {len(document_models)} collections & indexes.")


async def close_db():
    global motor_client
    if motor_client:
        motor_client.close()
        logger.info("MongoDB connection closed gracefully.")
