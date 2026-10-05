import asyncio
import os
import sys
import random
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie, PydanticObjectId

# Add parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.config import settings
from app.core.database import init_db
from app.models import (
    SellerProfile,
    Category,
    Brand,
    Product,
    ProductVariant,
    ProductImage,
    ProductSpecification,
    ProductHighlight,
    VariantAttribute,
)

ADDITIONAL_PRODUCTS = [
    # GROCERIES & GOURMET (AMAZON FRESH & FLIPKART GROCERY)
    {
        "category_slug": "groceries",
        "brand_name": "Tata Tea",
        "title": "Tata Tea Gold Leaf Tea 1kg with 15% Long Leaves",
        "slug": "tata-tea-gold-leaf-tea-1kg",
        "desc": "A unique blend of fine CTC tea leaves with 15% gently rolled long leaves for an exquisite aroma and rich taste.",
        "price": 54900, "compare": 68000,
        "img": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80",
        "stock": 300,
    },
    {
        "category_slug": "groceries",
        "brand_name": "Ferrero",
        "title": "Ferrero Rocher Premium Hazelnut Chocolates Box (24 Pieces, 300g)",
        "slug": "ferrero-rocher-premium-hazelnut-chocolates-24-pieces",
        "desc": "Whole hazelnut dipped in smooth chocolaty cream, contained in a crispy wafer shell, covered in milk chocolate and gently roasted hazelnut pieces.",
        "price": 89900, "compare": 109900,
        "img": "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=800&q=80",
        "stock": 250,
    },
    {
        "category_slug": "groceries",
        "brand_name": "Nescafe",
        "title": "Nescafe Gold Rich & Smooth Premium Instant Coffee Glass Jar 200g",
        "slug": "nescafe-gold-rich-smooth-instant-coffee-200g",
        "desc": "Crafted with Mountain Grown Arabica beans, roasted to golden perfection for a smooth taste and rich aroma.",
        "price": 79900, "compare": 105000,
        "img": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80",
        "stock": 180,
    },

    # SPORTS & FITNESS
    {
        "category_slug": "sports-fitness",
        "brand_name": "Yonex",
        "title": "Yonex Astrox 99 Pro Graphite Badminton Racquet (Strung with BG65)",
        "slug": "yonex-astrox-99-pro-graphite-badminton-racquet",
        "desc": "Designed in tandem with world champion Kento Momota. Power-Assist Bumper for maximum power transfer and steep smashes.",
        "price": 1499900, "compare": 1999000,
        "img": "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&q=80",
        "stock": 60,
    },
    {
        "category_slug": "sports-fitness",
        "brand_name": "Decathlon",
        "title": "Domyos 20kg Cast Iron Adjustable Dumbbell & Barbell Weight Set",
        "slug": "domyos-20kg-cast-iron-adjustable-dumbbell-set",
        "desc": "Complete home strength training kit with chrome threaded bars, secure spinlock collars, and cast iron plates.",
        "price": 449900, "compare": 699900,
        "img": "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&q=80",
        "stock": 90,
    },

    # BOOKS & STATIONERY
    {
        "category_slug": "books-stationery",
        "brand_name": "Penguin",
        "title": "Atomic Habits: An Easy & Proven Way to Build Good Habits by James Clear",
        "slug": "atomic-habits-james-clear-hardcover",
        "desc": "No matter your goals, Atomic Habits offers a proven framework for improving every day from world-renowned habits expert James Clear.",
        "price": 49900, "compare": 79900,
        "img": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80",
        "stock": 400,
    },
    {
        "category_slug": "books-stationery",
        "brand_name": "Kindle",
        "title": "Amazon Kindle Paperwhite (16 GB) 6.8-inch Display with Warm Light & Waterproof",
        "slug": "amazon-kindle-paperwhite-16gb-6-8-inch-warm-light",
        "desc": "300 ppi glare-free display that reads like real paper even in bright sunlight. Adjustable warm light and up to 10 weeks battery life.",
        "price": 1399900, "compare": 1499900,
        "img": "https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=800&q=80",
        "stock": 75,
    },

    # TOYS & BABY
    {
        "category_slug": "toys-baby",
        "brand_name": "Lego",
        "title": "LEGO Technic Porsche 911 GT3 RS Building Set (2704 Pieces)",
        "slug": "lego-technic-porsche-911-gt3-rs-building-set",
        "desc": "Authentically designed aerodynamic bodywork, adjustable rear spoiler, 6-cylinder boxer engine with moving pistons, and working gearbox.",
        "price": 2899900, "compare": 3499900,
        "img": "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=800&q=80",
        "stock": 35,
    },
    {
        "category_slug": "toys-baby",
        "brand_name": "Hot Wheels",
        "title": "Hot Wheels 20-Car Collector Die-Cast Pack (1:64 Scale)",
        "slug": "hot-wheels-20-car-collector-pack",
        "desc": "Classic 20-car pack with open window packaging displaying the entire assortment of authentic die-cast miniature race cars.",
        "price": 199900, "compare": 299900,
        "img": "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=800&q=80",
        "stock": 140,
    },

    # BEAUTY & LUXURY PERFUMES
    {
        "category_slug": "beauty",
        "brand_name": "Dior",
        "title": "Dior Sauvage Eau De Parfum for Men (100ml)",
        "slug": "dior-sauvage-eau-de-parfum-100ml",
        "desc": "A powerful, noble composition with raw freshness of Reggio di Calabria Bergamot and the sensual ambery trail of Papua New Guinean Vanilla.",
        "price": 1150000, "compare": 1350000,
        "img": "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&q=80",
        "stock": 50,
    },
    {
        "category_slug": "beauty",
        "brand_name": "Estee Lauder",
        "title": "Estee Lauder Advanced Night Repair Synchronized Multi-Recovery Complex Serum (50ml)",
        "slug": "estee-lauder-advanced-night-repair-serum-50ml",
        "desc": "The #1 repair serum in the world. Chronolux Power Signal Technology helps skin increase its natural production of collagen and renewal of vital skin cells.",
        "price": 890000, "compare": 1050000,
        "img": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80",
        "stock": 70,
    },

    # GAMING & CONSOLES
    {
        "category_slug": "electronics",
        "brand_name": "Sony",
        "title": "Sony PlayStation 5 Slim Console (1TB SSD, 4K 120Hz, HDR, DualSense Controller)",
        "slug": "sony-playstation-5-slim-console-1tb",
        "desc": "Experience lightning-fast loading with an ultra-high speed SSD, deeper immersion with haptic feedback, adaptive triggers and 3D Audio.",
        "price": 5499000, "compare": 5999000,
        "img": "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&q=80",
        "stock": 80,
    },
    {
        "category_slug": "electronics",
        "brand_name": "Microsoft",
        "title": "Microsoft Xbox Series X Gaming Console (1TB NVMe SSD, 12 Teraflops GPU)",
        "slug": "microsoft-xbox-series-x-1tb",
        "desc": "The fastest, most powerful Xbox ever. Play thousands of titles from four generations of consoles on Xbox Series X.",
        "price": 4999000, "compare": 5599000,
        "img": "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=800&q=80",
        "stock": 45,
    },
]


async def seed_more():
    print("Expanding catalog with additional Amazon & Flipkart bestseller categories...")
    await init_db()

    default_seller = await SellerProfile.find_one()
    seller_id = default_seller.id if default_seller else PydanticObjectId()

    count = 0
    for p in ADDITIONAL_PRODUCTS:
        cat = await Category.find_one(Category.slug == p["category_slug"])
        if not cat:
            cat = Category(name=p["category_slug"].replace("-", " ").title(), slug=p["category_slug"])
            await cat.insert()

        brand = await Brand.find_one(Brand.name == p["brand_name"])
        if not brand:
            brand = Brand(name=p["brand_name"], slug=p["brand_name"].lower().replace(" ", "-"))
            await brand.insert()

        discount_pct = int(((p["compare"] - p["price"]) / p["compare"]) * 100) if p.get("compare") else 0

        variant = ProductVariant(
            variant_id=f"var-{p['slug']}-std",
            sku=f"SKU-{p['slug'][:8].upper()}",
            attributes=[VariantAttribute(name="Standard", value="Standard")],
            price_paise=p["price"],
            compare_at_price_paise=p.get("compare"),
            stock=p["stock"],
        )

        existing = await Product.find_one(Product.slug == p["slug"])
        if not existing:
            prod = Product(
                seller_id=seller_id,
                category_id=cat.id,
                category_slug=cat.slug,
                brand_id=brand.id,
                brand_name=brand.name,
                title=p["title"],
                slug=p["slug"],
                description=p["desc"],
                short_description=p["desc"][:100],
                tags=[cat.slug, brand.name.lower(), "bestseller", "amazon", "flipkart"],
                images=[ProductImage(url=p["img"], alt=p["title"], is_primary=True, display_order=0)],
                variants=[variant],
                specifications=[
                    ProductSpecification(group="General", name="Brand", value=brand.name),
                    ProductSpecification(group="General", name="Category", value=cat.name),
                ],
                highlights=[
                    ProductHighlight(text="100% Genuine and Brand Authorised"),
                    ProductHighlight(text="Eligible for 24-48h Express Delivery"),
                    ProductHighlight(text="7-Day Easy Returns Guarantee"),
                ],
                base_price_paise=p["price"],
                compare_at_price_paise=p.get("compare"),
                discount_pct=discount_pct,
                total_stock=p["stock"],
                avg_rating=round(random.uniform(4.4, 4.9), 1),
                review_count=random.randint(150, 4500),
                is_published=True,
                is_deleted=False,
            )
            await prod.insert()
            count += 1

    total = await Product.find(Product.is_deleted == False).count()
    print(f"Added {count} new high-demand products. Total products in catalog: {total}")


if __name__ == "__main__":
    asyncio.run(seed_more())
