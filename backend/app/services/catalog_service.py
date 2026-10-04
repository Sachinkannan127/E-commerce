from typing import List, Optional, Tuple
from beanie import PydanticObjectId
from beanie.operators import In, RegEx
from app.models.category import Category
from app.models.brand import Brand
from app.models.product import Product
from app.schemas.catalog import (
    CategoryNode,
    ProductFilterParams,
    ProductSummaryCard,
    ProductDetailResponse,
)
from app.core.redis import get_cache, set_cache
from app.core.exceptions import NotFoundException
from app.core.logging import logger


class CatalogService:
    @staticmethod
    async def get_category_tree() -> List[CategoryNode]:
        cache_key = "catalog:category_tree"
        cached = await get_cache(cache_key)
        if cached:
            return [CategoryNode(**node) for node in cached]

        all_cats = await Category.find(Category.is_active == True).sort(Category.sort_order).to_list()
        
        # Build tree structure
        lookup = {str(c.id): CategoryNode(
            id=str(c.id),
            name=c.name,
            slug=c.slug,
            description=c.description,
            icon_url=c.icon_url,
            banner_url=c.banner_url,
            level=c.level,
            children=[]
        ) for c in all_cats}

        root_nodes = []
        for c in all_cats:
            node = lookup[str(c.id)]
            if c.parent_id and str(c.parent_id) in lookup:
                lookup[str(c.parent_id)].children.append(node)
            elif c.level == 0:
                root_nodes.append(node)

        # Cache tree for 1 hour
        await set_cache(cache_key, [n.model_dump() for n in root_nodes], expire_seconds=3600)
        return root_nodes

    @staticmethod
    async def list_products(
        filters: ProductFilterParams,
        page: int = 1,
        limit: int = 20
    ) -> Tuple[List[ProductSummaryCard], int]:
        query_conditions = [
            Product.is_published == True,
            Product.is_deleted == False,
        ]

        if filters.category_slug:
            query_conditions.append(Product.category_slug == filters.category_slug)

        if filters.brand_slug:
            brand = await Brand.find_one(Brand.slug == filters.brand_slug)
            if brand:
                query_conditions.append(Product.brand_id == brand.id)

        if filters.min_price is not None:
            query_conditions.append(Product.base_price_paise >= filters.min_price)

        if filters.max_price is not None:
            query_conditions.append(Product.base_price_paise <= filters.max_price)

        if filters.min_rating is not None:
            query_conditions.append(Product.avg_rating >= filters.min_rating)

        if filters.min_discount is not None:
            query_conditions.append(Product.discount_pct >= filters.min_discount)

        if filters.is_featured is not None:
            query_conditions.append(Product.is_featured == filters.is_featured)

        if filters.is_bestseller is not None:
            query_conditions.append(Product.is_bestseller == filters.is_bestseller)

        if filters.is_trending is not None:
            query_conditions.append(Product.is_trending == filters.is_trending)

        if filters.is_flash_deal is not None:
            query_conditions.append(Product.is_flash_deal == filters.is_flash_deal)

        if filters.in_stock_only:
            query_conditions.append(Product.total_stock > 0)

        query = Product.find(*query_conditions)

        # Text search if query given
        if filters.search_query:
            query = query.find({"$text": {"$search": filters.search_query}})

        # Sorting
        if filters.sort == "price_asc":
            query = query.sort(+Product.base_price_paise)
        elif filters.sort == "price_desc":
            query = query.sort(-Product.base_price_paise)
        elif filters.sort == "rating_desc":
            query = query.sort(-Product.avg_rating)
        elif filters.sort == "newest":
            query = query.sort(-Product.created_at)
        else:
            query = query.sort(-Product.sales_count, -Product.created_at)

        total = await query.count()
        skip = (page - 1) * limit
        products = await query.skip(skip).limit(limit).to_list()

        summaries = [
            ProductSummaryCard(
                id=str(p.id),
                title=p.title,
                slug=p.slug,
                category_slug=p.category_slug,
                brand_name=p.brand_name,
                primary_image=p.images[0].url if p.images else None,
                base_price_paise=p.base_price_paise,
                compare_at_price_paise=p.compare_at_price_paise,
                discount_pct=p.discount_pct,
                avg_rating=p.avg_rating,
                review_count=p.review_count,
                total_stock=p.total_stock,
                is_bestseller=p.is_bestseller,
                is_trending=p.is_trending,
                is_flash_deal=p.is_flash_deal,
            )
            for p in products
        ]
        return summaries, total

    @staticmethod
    async def get_product_by_slug(slug: str) -> ProductDetailResponse:
        cache_key = f"catalog:product:{slug}"
        cached = await get_cache(cache_key)
        if cached:
            return ProductDetailResponse(**cached)

        product = await Product.find_one(
            Product.slug == slug,
            Product.is_published == True,
            Product.is_deleted == False
        )
        if not product:
            raise NotFoundException("Product")

        # Increment view count
        product.view_count += 1
        await product.save()

        detail = ProductDetailResponse(
            id=str(product.id),
            seller_id=str(product.seller_id),
            category_id=str(product.category_id),
            category_slug=product.category_slug,
            brand_id=str(product.brand_id) if product.brand_id else None,
            brand_name=product.brand_name,
            title=product.title,
            slug=product.slug,
            description=product.description,
            short_description=product.short_description,
            tags=product.tags,
            images=product.images,
            variants=product.variants,
            specifications=product.specifications,
            highlights=product.highlights,
            base_price_paise=product.base_price_paise,
            compare_at_price_paise=product.compare_at_price_paise,
            discount_pct=product.discount_pct,
            total_stock=product.total_stock,
            avg_rating=product.avg_rating,
            review_count=product.review_count,
            is_bestseller=product.is_bestseller,
            is_trending=product.is_trending,
            is_flash_deal=product.is_flash_deal,
            flash_deal_end_at=product.flash_deal_end_at,
        )

        await set_cache(cache_key, detail.model_dump(), expire_seconds=300)
        return detail
