import pytest
from httpx import AsyncClient
from app.core.security import verify_password, get_password_hash, create_access_token, decode_access_token


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "ShopVerse" in data["service"]


@pytest.mark.asyncio
async def test_password_hashing_and_verification():
    password = "SuperSecretPassword123!"
    hashed = get_password_hash(password)
    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False


@pytest.mark.asyncio
async def test_jwt_token_generation_and_decoding():
    payload = {"sub": "user-12345", "role": "CUSTOMER", "email": "test@shopverse.in"}
    token = create_access_token(data=payload)
    assert isinstance(token, str)
    assert len(token) > 20

    decoded = decode_access_token(token)
    assert decoded["sub"] == "user-12345"
    assert decoded["role"] == "CUSTOMER"
    assert decoded["email"] == "test@shopverse.in"


@pytest.mark.asyncio
async def test_login_validation(client: AsyncClient):
    # Test empty payload
    response = await client.post("/api/v1/auth/login", json={})
    assert response.status_code == 422

    # Test invalid email format
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "not-an-email", "password": "pass"},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_otp_send_validation(client: AsyncClient):
    # Test invalid phone number (less than 10 digits)
    response = await client.post(
        "/api/v1/auth/otp/send",
        json={"phone": "12345"},
    )
    assert response.status_code in [400, 422]
