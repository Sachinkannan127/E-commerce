from datetime import datetime, timezone
from beanie import Document, Indexed
from pydantic import Field
import pymongo


class OtpCode(Document):
    destination: Indexed(str)  # email or phone number
    code: str
    purpose: str = "LOGIN"  # LOGIN, REGISTRATION, RESET_PASSWORD
    expires_at: Indexed(datetime, expireAfterSeconds=0)  # MongoDB TTL Index automatically deletes expired records
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "otp_codes"
        indexes = [
            "destination",
            "expires_at",
        ]
