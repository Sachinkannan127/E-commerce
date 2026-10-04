import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_pincode_validation(client: AsyncClient):
    # Test valid Indian 6-digit PIN
    valid_res = await client.post(
        "/api/v1/products/pincode-check",
        json={"pincode": "560001"},
    )
    assert valid_res.status_code == 200
    data = valid_res.json()
    assert data["success"] is True
    assert data["data"]["is_deliverable"] is True
    assert data["data"]["pincode"] == "560001"

    # Test invalid 5-digit PIN
    invalid_res = await client.post(
        "/api/v1/products/pincode-check",
        json={"pincode": "12345"},
    )
    assert invalid_res.status_code in [400, 422]

    # Test non-numeric PIN
    alpha_res = await client.post(
        "/api/v1/products/pincode-check",
        json={"pincode": "ABCDEF"},
    )
    assert alpha_res.status_code in [400, 422]


@pytest.mark.asyncio
async def test_search_suggest_endpoint(client: AsyncClient):
    response = await client.get("/api/v1/search/suggest?q=phone")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "data" in data


@pytest.mark.asyncio
async def test_compare_endpoint_validation(client: AsyncClient):
    # Test empty product IDs list
    empty_res = await client.post(
        "/api/v1/products/compare",
        json={"product_ids": []},
    )
    assert empty_res.status_code in [400, 422]

    # Test more than 4 items (limit exceeded)
    overflow_res = await client.post(
        "/api/v1/products/compare",
        json={"product_ids": ["id1", "id2", "id3", "id4", "id5"]},
    )
    assert overflow_res.status_code in [400, 422]
