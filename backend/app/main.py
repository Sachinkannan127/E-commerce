import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.core.config import settings
from app.core.database import init_db, close_db, ping_db
from app.core.redis import init_redis, close_redis, redis_client
from app.core.logging import setup_logging, logger
from app.core.exceptions import ShopVerseException
from app.middlewares.logging_middleware import RequestLoggingMiddleware
from app.routers import (
    auth,
    users,
    categories,
    products,
    search,
    brands,
    cart,
    checkout,
    orders,
    payments,
    reviews,
    wishlist,
    notifications,
    seller,
    admin,
    gamification,
    reseller,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    logger.info("Initializing ShopVerse services...")
    await init_db()
    await init_redis()
    yield
    logger.info("Shutting down ShopVerse services...")
    await close_redis()
    await close_db()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Enterprise-grade Multi-Vendor E-Commerce Platform API",
    lifespan=lifespan,
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# Request & Response Logging Middleware (tracks status codes and response times)
app.add_middleware(RequestLoggingMiddleware)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception Handlers
@app.exception_handler(ShopVerseException)
async def shopverse_exception_handler(request: Request, exc: ShopVerseException):
    logger.warning(f"[{exc.status_code}] ShopVerseException on {request.url.path}: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "message": exc.detail, "error": exc.detail},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    first_error = errors[0]["msg"] if errors else "Validation error"
    logger.warning(f"[422 Unprocessable Entity] Validation error on {request.url.path}: {first_error}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"success": False, "message": first_error, "error": str(errors)},
    )


# Health check endpoint with live MongoDB & Redis Ping
@app.get("/health", tags=["Health"])
async def health_check():
    db_health = await ping_db()
    
    # Check Redis ping
    redis_health = {"status": "disconnected"}
    if redis_client:
        try:
            start_r = time.perf_counter()
            await redis_client.ping()
            latency_r = (time.perf_counter() - start_r) * 1000
            redis_health = {"status": "connected", "latency_ms": round(latency_r, 2)}
        except Exception as e:
            redis_health = {"status": "error", "error": str(e)}

    is_db_healthy = db_health.get("status") == "connected"
    overall_status = "healthy" if is_db_healthy else "unhealthy"
    http_status = status.HTTP_200_OK if is_db_healthy else status.HTTP_503_SERVICE_UNAVAILABLE

    return JSONResponse(
        status_code=http_status,
        content={
            "status": overall_status,
            "service": "ShopVerse Backend API",
            "version": settings.VERSION,
            "services": {
                "mongodb": db_health,
                "redis": redis_health,
            },
        },
    )


# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(categories.router, prefix=settings.API_V1_STR)
app.include_router(products.router, prefix=settings.API_V1_STR)
app.include_router(search.router, prefix=settings.API_V1_STR)
app.include_router(brands.router, prefix=settings.API_V1_STR)
app.include_router(cart.router, prefix=settings.API_V1_STR)
app.include_router(checkout.router, prefix=settings.API_V1_STR)
app.include_router(orders.router, prefix=settings.API_V1_STR)
app.include_router(payments.router, prefix=settings.API_V1_STR)
app.include_router(reviews.router, prefix=settings.API_V1_STR)
app.include_router(wishlist.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)
app.include_router(seller.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(gamification.router, prefix=settings.API_V1_STR)
app.include_router(reseller.router, prefix=settings.API_V1_STR)
