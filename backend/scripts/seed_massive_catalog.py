import asyncio
import os
import sys
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

FLIPKART_AUTHENTIC_CATALOG = [
    # ==================== 1. MOBILES & TABLETS ====================
    {
        "category_slug": "mobiles",
        "brand_name": "Apple",
        "title": "Apple iPhone 16 Pro Max (Natural Titanium, 256 GB)",
        "slug": "apple-iphone-16-pro-max-256gb-natural-titanium",
        "description": "Engineered with Grade 5 Titanium and the blazing-fast A18 Pro chip. Features the all-new Camera Control button, 48MP Fusion camera system with 5x optical telephoto zoom, 6.9-inch Super Retina XDR display with ProMotion 120Hz, and up to 33 hours video playback.",
        "short_description": "A18 Pro Chip, 48MP Fusion Camera, 6.9-inch Super Retina XDR, Grade 5 Titanium",
        "base_price_paise": 14490000,
        "compare_at_price_paise": 15990000,
        "tags": ["iphone", "apple", "5g", "flagship", "titanium", "camera", "mobile"],
        "images": [
            "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80",
            "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80",
        ],
        "variants": [
            {"name": "256GB / Natural Titanium", "sku": "IP16PM-256-NT", "price": 14490000, "compare": 15990000, "stock": 45, "attr": [{"name": "Storage", "value": "256GB"}, {"name": "Color", "value": "Natural Titanium"}]},
            {"name": "512GB / Desert Titanium", "sku": "IP16PM-512-DT", "price": 16490000, "compare": 17990000, "stock": 30, "attr": [{"name": "Storage", "value": "512GB"}, {"name": "Color", "value": "Desert Titanium"}]},
            {"name": "1TB / Black Titanium", "sku": "IP16PM-1TB-BT", "price": 18490000, "compare": 19990000, "stock": 18, "attr": [{"name": "Storage", "value": "1TB"}, {"name": "Color", "value": "Black Titanium"}]},
        ],
        "specs": [
            {"group": "Processor", "name": "Chip", "value": "A18 Pro Chip with 6-core GPU"},
            {"group": "Display", "name": "Size & Resolution", "value": "6.9-inch Super Retina XDR OLED (2868 x 1320 pixels at 460 ppi)"},
            {"group": "Camera", "name": "Rear Camera", "value": "48MP Fusion + 48MP Ultra-Wide + 12MP 5x Telephoto"},
            {"group": "Battery", "name": "Battery Life", "value": "Up to 33 hours video playback"},
        ],
        "highlights": ["A18 Pro chip with 6-core GPU", "Grade 5 Titanium frame with textured matte glass", "Camera Control button for instant photo capture", "Action button for personalized shortcuts"],
        "rating": 4.9,
        "reviews": 1280,
    },
    {
        "category_slug": "mobiles",
        "brand_name": "Samsung",
        "title": "Samsung Galaxy S24 Ultra 5G AI (Titanium Gray, 256 GB, 12 GB RAM)",
        "slug": "samsung-galaxy-s24-ultra-5g-ai-256gb-titanium-gray",
        "description": "Galaxy AI is here. Search like never before with Circle to Search, get real-time voice translation on calls, and capture life in 200MP detail with the ProVisual engine and Snapdragon 8 Gen 3 for Galaxy.",
        "short_description": "Galaxy AI, 200MP Quad Tele Camera, S Pen Built-In, Snapdragon 8 Gen 3",
        "base_price_paise": 11999900,
        "compare_at_price_paise": 13499900,
        "tags": ["samsung", "galaxy", "s24 ultra", "5g", "ai", "s-pen", "mobile"],
        "images": [
            "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80",
            "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&q=80",
        ],
        "variants": [
            {"name": "12GB + 256GB / Titanium Gray", "sku": "S24U-12-256-TG", "price": 11999900, "compare": 13499900, "stock": 50, "attr": [{"name": "RAM/Storage", "value": "12GB/256GB"}, {"name": "Color", "value": "Titanium Gray"}]},
            {"name": "12GB + 512GB / Titanium Black", "sku": "S24U-12-512-TB", "price": 12999900, "compare": 14499900, "stock": 35, "attr": [{"name": "RAM/Storage", "value": "12GB/512GB"}, {"name": "Color", "value": "Titanium Black"}]},
        ],
        "specs": [
            {"group": "Processor", "name": "Processor", "value": "Qualcomm Snapdragon 8 Gen 3 for Galaxy"},
            {"group": "Display", "name": "Display", "value": "6.8-inch QHD+ Dynamic AMOLED 2X 120Hz"},
            {"group": "Camera", "name": "Rear Cameras", "value": "200MP Main + 50MP 5x + 12MP Ultra-Wide + 10MP 3x"},
        ],
        "highlights": ["Circle to Search with Google", "Live Translate & Note Assist", "200MP Space Zoom camera", "Corning Gorilla Armor anti-reflective glass"],
        "rating": 4.8,
        "reviews": 940,
    },
    {
        "category_slug": "mobiles",
        "brand_name": "OnePlus",
        "title": "OnePlus 12 5G (Silky Black, 512 GB, 16 GB RAM)",
        "slug": "oneplus-12-5g-silky-black-512gb",
        "description": "Smooth Beyond Belief with Snapdragon 8 Gen 3, 2K 120Hz ProXDR Display with Aqua Touch, 4th Gen Hasselblad Camera for Mobile, and 5400 mAh battery with 100W SUPERVOOC charging.",
        "short_description": "Snapdragon 8 Gen 3, 4th Gen Hasselblad Camera, 100W SUPERVOOC, 2K ProXDR",
        "base_price_paise": 6499900,
        "compare_at_price_paise": 6999900,
        "tags": ["oneplus", "oneplus 12", "5g", "hasselblad", "fast charging", "flagship"],
        "images": [
            "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&q=80",
        ],
        "variants": [
            {"name": "16GB + 512GB / Silky Black", "sku": "OP12-16-512-SB", "price": 6499900, "compare": 6999900, "stock": 60, "attr": [{"name": "RAM/Storage", "value": "16GB/512GB"}, {"name": "Color", "value": "Silky Black"}]},
            {"name": "12GB + 256GB / Flowy Emerald", "sku": "OP12-12-256-FE", "price": 5999900, "compare": 6499900, "stock": 40, "attr": [{"name": "RAM/Storage", "value": "12GB/256GB"}, {"name": "Color", "value": "Flowy Emerald"}]},
        ],
        "specs": [
            {"group": "Processor", "name": "Processor", "value": "Snapdragon 8 Gen 3"},
            {"group": "Battery", "name": "Charging", "value": "100W Wired SUPERVOOC + 50W AIRVOOC Wireless"},
        ],
        "highlights": ["100W SUPERVOOC 0-100% in 26 minutes", "4th Gen Hasselblad Camera System", "2K 120Hz Display with 4500 nits peak brightness"],
        "rating": 4.8,
        "reviews": 890,
    },
    {
        "category_slug": "mobiles",
        "brand_name": "Google",
        "title": "Google Pixel 9 Pro 5G (Obsidian, 128 GB, 16 GB RAM)",
        "slug": "google-pixel-9-pro-5g-obsidian-128gb",
        "description": "Google's flagship phone with Google Tensor G4 chip, pro-level triple rear camera with 30x Super Res Zoom, 24-hour battery with Extreme Battery Saver up to 100 hours, and Gemini AI built-in.",
        "short_description": "Google Tensor G4, Gemini AI, 50MP Triple Camera System, Super Actua Display",
        "base_price_paise": 10699900,
        "compare_at_price_paise": 11999900,
        "tags": ["google", "pixel", "pixel 9 pro", "gemini", "android", "5g"],
        "images": [
            "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80",
        ],
        "variants": [
            {"name": "16GB + 128GB / Obsidian", "sku": "PIX9P-16-128-OB", "price": 10699900, "compare": 11999900, "stock": 25, "attr": [{"name": "Storage", "value": "128GB"}, {"name": "Color", "value": "Obsidian"}]},
        ],
        "specs": [
            {"group": "Processor", "name": "Chip", "value": "Google Tensor G4 with Titan M2 Coprocessor"},
            {"group": "Display", "name": "Display", "value": "6.3-inch Super Actua LTPO OLED (1-120Hz)"},
        ],
        "highlights": ["Gemini AI deeply integrated", "7 years of OS and security updates", "Best Video Boost with Night Sight", "Magic Editor & Best Take"],
        "rating": 4.7,
        "reviews": 460,
    },

    # ==================== 2. ELECTRONICS & COMPUTING ====================
    {
        "category_slug": "electronics",
        "brand_name": "Apple",
        "title": "Apple MacBook Air 15-inch M3 (16GB RAM, 512GB SSD, Midnight)",
        "slug": "apple-macbook-air-15-inch-m3-16gb-512gb-midnight",
        "description": "Supercharged by M3 chip, MacBook Air is an impossibly thin and fast laptop with up to 18 hours of battery life, expansive 15.3-inch Liquid Retina display, and 1080p FaceTime HD camera.",
        "short_description": "Apple M3 Chip, 15.3-inch Liquid Retina, 18 Hours Battery, 16GB RAM, 512GB SSD",
        "base_price_paise": 14490000,
        "compare_at_price_paise": 15490000,
        "tags": ["macbook", "apple", "laptop", "m3", "ultrabook", "computer"],
        "images": [
            "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
            "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&q=80",
        ],
        "variants": [
            {"name": "16GB RAM / 512GB SSD / Midnight", "sku": "MBA15-16-512-MD", "price": 14490000, "compare": 15490000, "stock": 35, "attr": [{"name": "RAM/SSD", "value": "16GB/512GB"}, {"name": "Color", "value": "Midnight"}]},
        ],
        "specs": [
            {"group": "Processor", "name": "Chip", "value": "Apple M3 8-Core CPU / 10-Core GPU with Hardware Ray Tracing"},
            {"group": "Memory", "name": "Memory", "value": "16GB Fast Unified RAM"},
        ],
        "highlights": ["Fanless, completely silent operation", "Stunning 15.3-inch Liquid Retina Display with 500 nits", "Supports up to two external displays", "MagSafe 3 charging port"],
        "rating": 4.9,
        "reviews": 1150,
    },
    {
        "category_slug": "electronics",
        "brand_name": "Sony",
        "title": "Sony WH-1000XM5 Wireless Active Noise Cancelling Headphones (30h Battery, Hi-Res Audio, Black)",
        "slug": "sony-wh-1000xm5-noise-cancelling-headphones-black",
        "description": "Two processors and 8 microphones for unprecedented noise cancellation. Superb sound quality engineered with the new Integrated Processor V1, ultra-clear hands-free calling with 4 beamforming mics.",
        "short_description": "Industry Leading Noise Cancelling, Integrated Processor V1, 30hr Battery, Hi-Res Audio",
        "base_price_paise": 2699000,
        "compare_at_price_paise": 3499000,
        "tags": ["sony", "headphones", "noise cancelling", "anc", "wh-1000xm5", "audio"],
        "images": [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
        ],
        "variants": [
            {"name": "Black", "sku": "SONY-XM5-BLK", "price": 2699000, "compare": 3499000, "stock": 70, "attr": [{"name": "Color", "value": "Black"}]},
        ],
        "specs": [
            {"group": "Audio", "name": "Processor", "value": "HD Noise Cancelling Processor QN1 + V1"},
            {"group": "Battery", "name": "Playback", "value": "30 hours (3 min quick charge for 3 hours playback)"},
        ],
        "highlights": ["Industry-leading ANC with 8 microphones", "Ultra-comfortable soft fit leather design", "Speak-to-chat technology and multi-point pairing"],
        "rating": 4.8,
        "reviews": 3450,
    },
    {
        "category_slug": "electronics",
        "brand_name": "Apple",
        "title": "Apple Watch Ultra 2 (GPS + Cellular, 49mm Titanium Case with Orange Ocean Band)",
        "slug": "apple-watch-ultra-2-gps-cellular-49mm-titanium",
        "description": "The ultimate sports and adventure watch. Powered by S9 SiP, 3000-nit brightest Apple display ever, dual-frequency precision GPS, Depth gauge, 86dB Emergency Siren, and up to 72 hours of battery life in Low Power Mode.",
        "short_description": "49mm Aerospace Titanium Case, 3000 nits Retina Display, S9 SiP, Dual-Frequency GPS",
        "base_price_paise": 8490000,
        "compare_at_price_paise": 8990000,
        "tags": ["apple watch", "apple", "smartwatch", "ultra 2", "fitness", "titanium"],
        "images": [
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
        ],
        "variants": [
            {"name": "49mm Titanium / Orange Ocean Band", "sku": "AWU2-49-OR", "price": 8490000, "compare": 8990000, "stock": 35, "attr": [{"name": "Case/Band", "value": "Titanium/Orange Ocean"}]},
        ],
        "specs": [
            {"group": "Display", "name": "Screen", "value": "Always-On Retina display, 3000 nits peak"},
        ],
        "highlights": ["Rugged corrosion-resistant 49mm titanium case", "Double tap gesture to answer calls and stop timers", "Customizable Action button"],
        "rating": 4.9,
        "reviews": 820,
    },
    {
        "category_slug": "electronics",
        "brand_name": "boAt",
        "title": "boAt Nirvana Ion TWS Earbuds (120 Hours Total Playback, HiFi DSP Audio, Charcoal Black)",
        "slug": "boat-nirvana-ion-tws-earbuds-120h-charcoal-black",
        "description": "Breakthrough in true wireless earbuds delivering an unbelievable 120 hours of total playback (24 hours per charge in earbuds), HiFi DSP crystal bionic sound, Quad Mics with ENx noise cancellation, and Beast mode 60ms low latency.",
        "short_description": "120 Hours Total Battery, 24 Hours Earbuds Battery, HiFi DSP Audio, Quad Mics",
        "base_price_paise": 199900,
        "compare_at_price_paise": 799000,
        "tags": ["boat", "earbuds", "tws", "wireless", "audio", "budget"],
        "images": [
            "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80",
        ],
        "variants": [
            {"name": "Charcoal Black", "sku": "BOAT-ION-BLK", "price": 199900, "compare": 799000, "stock": 200, "attr": [{"name": "Color", "value": "Charcoal Black"}]},
        ],
        "specs": [
            {"group": "Battery", "name": "Playback", "value": "120 Hours Total (24 Hours in Earbuds)"},
        ],
        "highlights": ["Massive 24hr nonstop single charge battery", "HiFi DSP tuned Crystal Bionic Sound", "Quad Mics with ENx Technology"],
        "rating": 4.5,
        "reviews": 6420,
    },

    # ==================== 3. HOME & KITCHEN ====================
    {
        "category_slug": "home-kitchen",
        "brand_name": "Dyson",
        "title": "Dyson V12 Detect Slim Total Clean Cordless Vacuum Cleaner (Laser Slim Fluffy, 150AW)",
        "slug": "dyson-v12-detect-slim-total-clean-cordless-vacuum",
        "description": "Dyson's most powerful, lightweight cordless vacuum with illuminated laser technology that reveals invisible microscopic dust, piezo sensor that counts particle sizes in real-time, and tangle-free de-tangling hair screw tool.",
        "short_description": "Illuminated Laser Dust Detection, Piezo Sensor LCD Screen, 150AW Suction, 60min Runtime",
        "base_price_paise": 4499000,
        "compare_at_price_paise": 5790000,
        "tags": ["dyson", "vacuum cleaner", "cordless", "appliances", "smart home", "cleaning"],
        "images": [
            "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&q=80",
        ],
        "variants": [
            {"name": "Total Clean / Yellow Nickel", "sku": "DYS-V12-TC", "price": 4499000, "compare": 5790000, "stock": 40, "attr": [{"name": "Model", "value": "Total Clean"}]},
        ],
        "specs": [
            {"group": "Performance", "name": "Suction", "value": "150 Air Watts"},
        ],
        "highlights": ["Laser reveals invisible microscopic dust on hard floors", "Piezo sensor automatically adapts suction power", "LCD screen shows scientific proof of a deep clean"],
        "rating": 4.9,
        "reviews": 1540,
    },
    {
        "category_slug": "home-kitchen",
        "brand_name": "Philips",
        "title": "Philips Digital Air Fryer XXL with Rapid Air Technology (7.2L Capacity, 2000W)",
        "slug": "philips-digital-air-fryer-xxl-7-2l-rapid-air",
        "description": "Fry, bake, grill, roast, and reheat with up to 90% less fat. Rapid Air Technology swirls hot air to create delicious foods that are crispy on the outside and tender on the inside, with little to no added oil.",
        "short_description": "7.2L Family Size, Rapid Air Technology, 16-in-1 Cooking Presets, NutriU App Sync",
        "base_price_paise": 1199900,
        "compare_at_price_paise": 1699500,
        "tags": ["philips", "air fryer", "kitchen", "cookware", "healthy", "appliances"],
        "images": [
            "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80",
        ],
        "variants": [
            {"name": "Black / 7.2L", "sku": "PHI-AF-XXL", "price": 1199900, "compare": 1699500, "stock": 80, "attr": [{"name": "Capacity", "value": "7.2 Litres"}]},
        ],
        "specs": [
            {"group": "Power", "name": "Wattage", "value": "2000 Watts"},
        ],
        "highlights": ["Up to 90% less fat with Rapid Air technology", "Touchscreen with 7 preset cooking programs"],
        "rating": 4.7,
        "reviews": 2980,
    },

    # ==================== 4. FASHION & FOOTWEAR ====================
    {
        "category_slug": "footwear",
        "brand_name": "Nike",
        "title": "Nike Air Jordan 1 Retro High OG Men's Sneakers (Chicago Lost & Found, Varsity Red)",
        "slug": "nike-air-jordan-1-retro-high-og-chicago",
        "description": "The iconic sneaker that started it all. Featuring premium cracked leather overlays, vintage sail midsole, authentic retro packaging, and encapsulated Nike Air cushioning in the heel.",
        "short_description": "Iconic High-Top Silhouette, Premium Leather Uppers, Encapsulated Air Sole",
        "base_price_paise": 1699500,
        "compare_at_price_paise": 1999500,
        "tags": ["nike", "air jordan", "sneakers", "jordan 1", "footwear", "streetwear"],
        "images": [
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
        ],
        "variants": [
            {"name": "UK 8 / Varsity Red & White", "sku": "AJ1-OG-UK8", "price": 1699500, "compare": 1999500, "stock": 18, "attr": [{"name": "Size", "value": "UK 8"}]},
            {"name": "UK 9 / Varsity Red & White", "sku": "AJ1-OG-UK9", "price": 1699500, "compare": 1999500, "stock": 25, "attr": [{"name": "Size", "value": "UK 9"}]},
        ],
        "specs": [
            {"group": "Material", "name": "Upper", "value": "100% Genuine Full-Grain Leather"},
        ],
        "highlights": ["Collector's edition Lost & Found vintage aesthetic", "Nike Air unit in heel for lightweight cushioning"],
        "rating": 4.9,
        "reviews": 1890,
    },
    {
        "category_slug": "fashion",
        "brand_name": "Levi's",
        "title": "Levi's Men's 511 Slim Fit Stretch Denim Jeans (Dark Indigo Rinse)",
        "slug": "levis-mens-511-slim-fit-stretch-denim-jeans-indigo",
        "description": "A modern slim with room to move. The 511 Slim Fit Stretch Jeans sit below the waist with a slim leg from hip to ankle. Crafted with +All Seasons Tech stretch denim.",
        "short_description": "Slim Leg from Hip to Ankle, Premium Stretch Denim, Classic 5-Pocket Styling",
        "base_price_paise": 249900,
        "compare_at_price_paise": 419900,
        "tags": ["levis", "jeans", "denim", "fashion", "menswear", "pants"],
        "images": [
            "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80",
        ],
        "variants": [
            {"name": "32W x 32L / Dark Indigo", "sku": "LEV-511-32", "price": 249900, "compare": 419900, "stock": 80, "attr": [{"name": "Size", "value": "32W x 32L"}]},
        ],
        "specs": [
            {"group": "Fabric", "name": "Composition", "value": "99% Cotton, 1% Elastane"},
        ],
        "highlights": ["Innovative stretch for maximum comfort", "Iconic Arcuate stitch on back pockets"],
        "rating": 4.6,
        "reviews": 3200,
    },
    {
        "category_slug": "fashion",
        "brand_name": "Saree Sansar",
        "title": "Pure Banarasi Jacquard Zari Woven Soft Silk Saree with Unstitched Blouse Piece",
        "slug": "pure-banarasi-jacquard-zari-soft-silk-saree",
        "description": "Exquisite Banarasi silk saree adorned with rich golden zari floral motifs, grand pallu with tassels, and lustrous contrast border. Top bestseller on Meesho & Flipkart for weddings and festivals.",
        "short_description": "Pure Soft Art Silk, Rich Gold Zari Work, Grand Pallu, Includes Blouse Piece",
        "base_price_paise": 119900,
        "compare_at_price_paise": 399900,
        "tags": ["saree", "banarasi", "ethnic wear", "meesho", "silk saree", "reseller hit"],
        "images": [
            "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80",
        ],
        "variants": [
            {"name": "Royal Maroon & Gold Zari", "sku": "SAR-BAN-MRN", "price": 119900, "compare": 399900, "stock": 150, "attr": [{"name": "Color", "value": "Royal Maroon"}]},
        ],
        "specs": [
            {"group": "Material", "name": "Fabric", "value": "Kanjivaram/Banarasi Soft Silk"},
        ],
        "highlights": ["Top Reseller Favorite: High margin potential of ₹300-₹500 per sale", "Intricate gold zari weaving across body and grand pallu"],
        "rating": 4.6,
        "reviews": 5120,
    },
]

async def sync_authentic_catalog():
    print("Connecting to MongoDB Atlas to synchronize Flipkart authentic catalog & MRPs...")
    await init_db()

    default_seller = await SellerProfile.find_one()
    seller_id = default_seller.id if default_seller else PydanticObjectId()

    categories_dict = {}
    async for cat in Category.find():
        categories_dict[cat.slug] = cat

    brands_dict = {}
    async for br in Brand.find():
        brands_dict[br.name.lower()] = br

    updated_count = 0
    created_count = 0

    for item in FLIPKART_AUTHENTIC_CATALOG:
        cat_slug = item["category_slug"]
        cat_obj = categories_dict.get(cat_slug)
        if not cat_obj:
            cat_obj = await Category.find_one(Category.slug == cat_slug)
            if not cat_obj:
                cat_obj = Category(name=cat_slug.replace("-", " ").title(), slug=cat_slug)
                await cat_obj.insert()
                categories_dict[cat_slug] = cat_obj

        brand_name = item.get("brand_name", "ShopVerse Official")
        brand_obj = brands_dict.get(brand_name.lower())
        if not brand_obj:
            brand_obj = Brand(name=brand_name, slug=brand_name.lower().replace(" ", "-"))
            await brand_obj.insert()
            brands_dict[brand_name.lower()] = brand_obj

        # Calculate discount
        discount_pct = 0
        if item.get("compare_at_price_paise") and item["compare_at_price_paise"] > item["base_price_paise"]:
            discount_pct = int(
                ((item["compare_at_price_paise"] - item["base_price_paise"]) / item["compare_at_price_paise"]) * 100
            )

        # Build variants
        variants_list = []
        total_stock = 0
        for v in item["variants"]:
            v_attrs = [VariantAttribute(name=a["name"], value=a["value"]) for a in v.get("attr", [])]
            variant_obj = ProductVariant(
                variant_id=v["sku"].lower(),
                sku=v["sku"],
                attributes=v_attrs,
                price_paise=v["price"],
                compare_at_price_paise=v.get("compare"),
                stock=v["stock"],
            )
            variants_list.append(variant_obj)
            total_stock += v["stock"]

        images_list = [
            ProductImage(url=img_url, alt=item["title"], is_primary=(idx == 0), display_order=idx)
            for idx, img_url in enumerate(item["images"])
        ]

        specs_list = [
            ProductSpecification(group=s["group"], name=s["name"], value=s["value"])
            for s in item.get("specs", [])
        ]
        highlights_list = [
            ProductHighlight(text=h) for h in item.get("highlights", [])
        ]

        existing_prod = await Product.find_one(Product.slug == item["slug"])
        if existing_prod:
            existing_prod.title = item["title"]
            existing_prod.description = item["description"]
            existing_prod.short_description = item.get("short_description")
            existing_prod.base_price_paise = item["base_price_paise"]
            existing_prod.compare_at_price_paise = item.get("compare_at_price_paise")
            existing_prod.discount_pct = discount_pct
            existing_prod.total_stock = total_stock
            existing_prod.variants = variants_list
            existing_prod.images = images_list
            existing_prod.specifications = specs_list
            existing_prod.highlights = highlights_list
            existing_prod.tags = item.get("tags", [])
            existing_prod.avg_rating = item.get("rating", 4.8)
            existing_prod.review_count = item.get("reviews", 500)
            existing_prod.is_published = True
            existing_prod.is_deleted = False
            await existing_prod.save()
            updated_count += 1
        else:
            new_prod = Product(
                seller_id=seller_id,
                category_id=cat_obj.id,
                category_slug=cat_obj.slug,
                brand_id=brand_obj.id,
                brand_name=brand_obj.name,
                title=item["title"],
                slug=item["slug"],
                description=item["description"],
                short_description=item.get("short_description"),
                tags=item.get("tags", []),
                images=images_list,
                variants=variants_list,
                specifications=specs_list,
                highlights=highlights_list,
                base_price_paise=item["base_price_paise"],
                compare_at_price_paise=item.get("compare_at_price_paise"),
                discount_pct=discount_pct,
                total_stock=total_stock,
                avg_rating=item.get("rating", 4.8),
                review_count=item.get("reviews", 500),
                is_published=True,
                is_deleted=False,
            )
            await new_prod.insert()
            created_count += 1

    total_prods = await Product.find(Product.is_deleted == False).count()
    print(f"\n Catalog synchronization complete!")
    print(f"Created: {created_count} products | Updated: {updated_count} products")
    print(f"Total Live Products with verified MRP & HD Images: {total_prods}")


if __name__ == "__main__":
    asyncio.run(sync_authentic_catalog())
