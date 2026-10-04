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


async def init_db():
    global motor_client
    logger.info(f"Connecting to MongoDB at {settings.MONGODB_URI}...")
    motor_client = AsyncIOMotorClient(
        settings.MONGODB_URI,
        maxPoolSize=50,
        minPoolSize=10,
        serverSelectionTimeoutMS=5000,
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
    logger.info("Beanie ODM successfully initialized with MongoDB collections and indexes.")


async def close_db():
    global motor_client
    if motor_client:
        motor_client.close()
        logger.info("MongoDB connection closed.")
