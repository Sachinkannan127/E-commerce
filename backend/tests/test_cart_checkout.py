import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_cart_item_add_validation(client: AsyncClient):
    # Test invalid product ID or missing quantity
    response = await client.post(
        "/api/v1/cart/items",
        json={"product_id": "invalid-id", "quantity": 0},
    )
    assert response.status_code in [400, 422]


@pytest.mark.asyncio
async def test_apply_invalid_coupon(client: AsyncClient):
    response = await client.post(
        "/api/v1/cart/coupon",
        json={"code": "NON_EXISTENT_COUPON_9999"},
    )
    assert response.status_code in [400, 404]


@pytest.mark.asyncio
async def test_checkout_unauthenticated(client: AsyncClient):
    response = await client.post(
        "/api/v1/checkout",
        json={"payment_method": "COD"},
    )
    # Must require auth header or return 401
    assert response.status_code in [401, 403, 422]
