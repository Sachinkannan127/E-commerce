import os
from typing import List, Union
from dotenv import load_dotenv
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Force load .env from current and parent directory
load_dotenv(override=True)
load_dotenv("../.env", override=True)


class Settings(BaseSettings):
    PROJECT_NAME: str = "ShopVerse API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Security & Tokens
    SECRET_KEY: str = "shopverse-super-secret-production-grade-jwt-key-2026-antigravity"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
    ]

    # Database & Redis
    MONGODB_URI: str = "mongodb://localhost:27017/shopverse"
    MONGODB_DB_NAME: str = "shopverse"
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    # Payment Gateways (Mock / Sandbox)
    RAZORPAY_KEY_ID: str = "rzp_test_shopverse12345"
    RAZORPAY_KEY_SECRET: str = "shopverse_rzp_secret_key_67890"
    STRIPE_PUBLISHABLE_KEY: str = "pk_test_shopverse_stripe_pub_key"
    STRIPE_SECRET_KEY: str = "sk_test_shopverse_stripe_sec_key"
    STRIPE_WEBHOOK_SECRET: str = "whsec_test_shopverse_webhook"

    # Email & Notifications
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = "no-reply@shopverse.in"
    SMTP_PASSWORD: str = "mock-password"
    EMAILS_ENABLED: bool = False

    # Platform Parameters
    DEFAULT_COMMISSION_RATE_PCT: float = 8.0  # 8% platform fee for sellers
    FREE_SHIPPING_THRESHOLD_PAISE: int = 49900  # ₹499
    DEFAULT_SHIPPING_FEE_PAISE: int = 4900     # ₹49

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()

