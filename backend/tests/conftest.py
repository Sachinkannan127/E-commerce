import asyncio
from datetime import datetime, timezone, timedelta
from typing import AsyncGenerator
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.security import create_access_token, get_password_hash
from app.core.config import settings
from app.models.user import User, UserRole, AuthProvider


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="session")
async def client() -> AsyncGenerator[AsyncClient, None]:
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://testserver",
    ) as ac:
        yield ac


@pytest.fixture
def customer_auth_headers() -> dict:
    token_payload = {
        "sub": "65f000000000000000000001",
        "email": "customer@shopverse.in",
        "role": UserRole.CUSTOMER.value,
    }
    token = create_access_token(data=token_payload)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def seller_auth_headers() -> dict:
    token_payload = {
        "sub": "65f000000000000000000002",
        "email": "seller@shopverse.in",
        "role": UserRole.SELLER.value,
    }
    token = create_access_token(data=token_payload)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_auth_headers() -> dict:
    token_payload = {
        "sub": "65f000000000000000000003",
        "email": "admin@shopverse.in",
        "role": UserRole.ADMIN.value,
    }
    token = create_access_token(data=token_payload)
    return {"Authorization": f"Bearer {token}"}
