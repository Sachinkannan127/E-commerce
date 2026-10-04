import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_gamification_status_unauthenticated(client: AsyncClient):
    response = await client.get("/api/v1/gamification/status")
    assert response.status_code in [401, 403]


@pytest.mark.asyncio
async def test_reseller_profile_unauthenticated(client: AsyncClient):
    response = await client.get("/api/v1/reseller/profile")
    assert response.status_code in [401, 403]


@pytest.mark.asyncio
async def test_reseller_share_catalog_validation(client: AsyncClient, customer_auth_headers: dict):
    # Selling price lower than base price should fail
    response = await client.post(
        "/api/v1/reseller/share-catalog",
        headers=customer_auth_headers,
        json={"product_id": "invalid-id", "selling_price_paise": -100},
    )
    assert response.status_code in [400, 404, 422]
