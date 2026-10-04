from typing import List
from fastapi import APIRouter
from app.schemas.catalog import CategoryNode
from app.schemas.common import APIResponse
from app.services.catalog_service import CatalogService

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("", response_model=APIResponse[List[CategoryNode]])
async def get_categories():
    tree = await CatalogService.get_category_tree()
    return APIResponse(data=tree)
