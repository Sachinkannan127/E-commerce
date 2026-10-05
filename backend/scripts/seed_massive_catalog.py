import asyncio
import os
import sys
import random
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie, PydanticObjectId

# Add parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.config import settings
from app.models import (
    User,
    SellerProfile,
    Category,
    Brand,
    Product,
    ProductVariant,
    ProductImage,
    ProductSpecification,
    ProductHighlight,
    VariantAttribute,
    Coupon,
    Banner,
    Address,
    Cart,
    Order,
    PaymentTransaction,
    Review,
    Wishlist,
    InAppNotification,
    SellerPayout,
    AuditLog,
    SearchLog,
    RecentlyViewed,
    OtpCode,
    SpinLog,
    ResellerProfile,
    ResellerSharedCatalog,
    ResellerOrderRecord,
)

# Comprehensive Amazon & Flipkart Inspired Catalog Matrix
AMAZON_FLIPKART_PRODUCTS = [
    # 1. SMARTPHONES & TABLETS
    {
        "category_slug": "mobiles",
        "brand_name": "Apple",
        "title": "Apple iPhone 16 Pro Max (256 GB) - Natural Titanium",
        "slug": "apple-iphone-16-pro-max-256gb-natural-titanium",
        "description": "The definitive flagship smartphone with aerospace-grade titanium design, Camera Control button, A18 Pro chip with 6-core GPU, 48MP Fusion camera system with 5x Telephoto lens, and industry-leading all-day battery life.",
        "short_description": "A18 Pro Chip, 48MP Fusion Camera, 6.9-inch Super Retina XDR, Titanium Build",
        "base_price_paise": 14490000,
        "compare_at_price_paise": 15990000,
        "tags": ["iphone", "apple", "5g", "flagship", "titanium", "camera", "mobile"],
        "images": [
            "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80",
            "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80",
        ],
        "variants": [
            {"name": "256GB / Natural Titanium", "sku": "IP16PM-256-NT", "price": 14490000, "compare": 15990000, "stock": 45, "attr": [{"name": "Storage", "value": "256GB"}, {"name": "Color", "value": "Natural Titanium"}]},
            {"name": "512GB / Natural Titanium", "sku": "IP16PM-512-NT", "price": 16490000, "compare": 17990000, "stock": 30, "attr": [{"name": "Storage", "value": "512GB"}, {"name": "Color", "value": "Natural Titanium"}]},
            {"name": "1TB / Desert Titanium", "sku": "IP16PM-1TB-DT", "price": 18490000, "compare": 19990000, "stock": 18, "attr": [{"name": "Storage", "value": "1TB"}, {"name": "Color", "value": "Desert Titanium"}]},
        ],
        "specs": [
            {"group": "General", "name": "Processor", "value": "A18 Pro Bionic Chip"},
            {"group": "Display", "name": "Screen Size", "value": "6.9 inches Super Retina XDR OLED (120Hz ProMotion)"},
            {"group": "Camera", "name": "Rear Camera", "value": "48MP Fusion + 48MP Ultra-Wide + 12MP 5x Telephoto"},
            {"group": "Battery", "name": "Battery Life", "value": "Up to 33 hours video playback"},
        ],
        "highlights": ["A18 Pro chip with 6-core GPU", "Grade 5 Titanium frame", "48MP Fusion camera with 5x optical zoom", "Camera Control button"],
        "rating": 4.9,
        "reviews": 1280,
    },
    {
        "category_slug": "mobiles",
        "brand_name": "Samsung",
        "title": "Samsung Galaxy S24 Ultra 5G AI Smartphone (Titanium Black, 12GB RAM, 256GB)",
        "slug": "samsung-galaxy-s24-ultra-5g-ai-256gb-titanium-black",
        "description": "Meet Galaxy S24 Ultra with Galaxy AI, Titanium exterior, 6.8-inch Flat Dynamic AMOLED 2X Display, built-in S Pen, 200MP camera system with ProVisual engine, and Snapdragon 8 Gen 3 for Galaxy.",
        "short_description": "Galaxy AI, 200MP Quad Tele Camera, S Pen Built-In, Snapdragon 8 Gen 3",
        "base_price_paise": 11999900,
        "compare_at_price_paise": 13499900,
        "tags": ["samsung", "galaxy", "s24 ultra", "5g", "ai", "s-pen", "mobile"],
        "images": [
            "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80",
            "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&q=80",
        ],
        "variants": [
            {"name": "12GB + 256GB / Titanium Black", "sku": "S24U-12-256-TB", "price": 11999900, "compare": 13499900, "stock": 50, "attr": [{"name": "RAM/Storage", "value": "12GB/256GB"}, {"name": "Color", "value": "Titanium Black"}]},
            {"name": "12GB + 512GB / Titanium Gray", "sku": "S24U-12-512-TG", "price": 12999900, "compare": 14499900, "stock": 35, "attr": [{"name": "RAM/Storage", "value": "12GB/512GB"}, {"name": "Color", "value": "Titanium Gray"}]},
        ],
        "specs": [
            {"group": "General", "name": "Processor", "value": "Qualcomm Snapdragon 8 Gen 3 for Galaxy"},
            {"group": "Display", "name": "Screen Size", "value": "6.8 inches QHD+ Dynamic AMOLED 2X 120Hz"},
            {"group": "Camera", "name": "Rear Camera", "value": "200MP Main + 50MP 5x + 12MP Ultra-Wide + 10MP 3x"},
            {"group": "Battery", "name": "Battery Capacity", "value": "5000 mAh with 45W Fast Charging"},
        ],
        "highlights": ["Circle to Search with Google", "Live Translate & Note Assist", "200MP Space Zoom camera", "Corning Gorilla Armor anti-reflective glass"],
        "rating": 4.8,
        "reviews": 940,
    },
    {
        "category_slug": "mobiles",
        "brand_name": "Google",
        "title": "Google Pixel 9 Pro 5G (Obsidian, 16GB RAM, 128GB)",
        "slug": "google-pixel-9-pro-5g-obsidian-128gb",
        "description": "Google's most powerful phone yet with Google Tensor G4 chip, pro-level triple rear camera with 30x Super Res Zoom, 24-hour battery with Extreme Battery Saver up to 100 hours, and Gemini AI built-in.",
        "short_description": "Google Tensor G4, Gemini AI, 50MP Triple Camera System, Super Actua Display",
        "base_price_paise": 10699900,
        "compare_at_price_paise": 11999900,
        "tags": ["google", "pixel", "pixel 9 pro", "gemini", "android", "5g"],
        "images": [
            "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80",
        ],
        "variants": [
            {"name": "16GB + 128GB / Obsidian", "sku": "PIX9P-16-128-OB", "price": 10699900, "compare": 11999900, "stock": 25, "attr": [{"name": "Storage", "value": "128GB"}, {"name": "Color", "value": "Obsidian"}]},
            {"name": "16GB + 256GB / Porcelain", "sku": "PIX9P-16-256-PO", "price": 11699900, "compare": 12999900, "stock": 20, "attr": [{"name": "Storage", "value": "256GB"}, {"name": "Color", "value": "Porcelain"}]},
        ],
        "specs": [
            {"group": "General", "name": "Processor", "value": "Google Tensor G4 with Titan M2 Coprocessor"},
            {"group": "Display", "name": "Screen", "value": "6.3-inch Super Actua LTPO OLED (1-120Hz)"},
            {"group": "Camera", "name": "Camera", "value": "50MP Wide + 48MP Ultra-Wide + 48MP 5x Telephoto"},
        ],
        "highlights": ["Gemini AI deeply integrated", "7 years of OS and security updates", "Best Video Boost with Night Sight", "Magic Editor & Best Take"],
        "rating": 4.7,
        "reviews": 460,
    },
    {
        "category_slug": "mobiles",
        "brand_name": "OnePlus",
        "title": "OnePlus 12 5G (Silky Black, 16GB RAM, 512GB Storage)",
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
            {"group": "General", "name": "Processor", "value": "Snapdragon 8 Gen 3"},
            {"group": "Charging", "name": "Wired Charging", "value": "100W SUPERVOOC (0-100% in 26 mins)"},
            {"group": "Camera", "name": "Camera System", "value": "50MP Sony LYT-808 + 64MP 3x Periscope + 48MP UW"},
        ],
        "highlights": ["100W Wired + 50W AIRVOOC Wireless", "Dual Cryo-velocity VC cooling system", "4th Gen Hasselblad camera", "2K 120Hz Display with 4500 nits peak brightness"],
        "rating": 4.8,
        "reviews": 890,
    },
    {
        "category_slug": "mobiles",
        "brand_name": "Apple",
        "title": "Apple iPad Pro 13-inch (M4 Chip, Wi-Fi, 256GB) - Space Black",
        "slug": "apple-ipad-pro-13-inch-m4-256gb-space-black",
        "description": "Thinpossible design with breakthrough Ultra Retina XDR tandem OLED display, outrageous performance of the Apple M4 chip, and all-day battery life.",
        "short_description": "Apple M4 Chip, Tandem OLED Ultra Retina XDR, 5.1mm Ultrathin Design",
        "base_price_paise": 12990000,
        "compare_at_price_paise": 13990000,
        "tags": ["ipad", "apple", "tablet", "m4", "oled", "pro"],
        "images": [
            "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80",
        ],
        "variants": [
            {"name": "256GB / Space Black", "sku": "IPADP13-256-SB", "price": 12990000, "compare": 13990000, "stock": 25, "attr": [{"name": "Storage", "value": "256GB"}, {"name": "Color", "value": "Space Black"}]},
            {"name": "512GB / Silver", "sku": "IPADP13-512-SV", "price": 14990000, "compare": 15990000, "stock": 15, "attr": [{"name": "Storage", "value": "512GB"}, {"name": "Color", "value": "Silver"}]},
        ],
        "specs": [
            {"group": "Performance", "name": "Chipset", "value": "Apple M4 9-Core CPU / 10-Core GPU"},
            {"group": "Display", "name": "Display", "value": "13-inch Tandem OLED Ultra Retina XDR (1600 nits peak)"},
        ],
        "highlights": ["World's most advanced Tandem OLED display", "Powered by groundbreaking Apple M4 chip", "Thinnest Apple product ever at 5.1 mm", "Supports Apple Pencil Pro"],
        "rating": 4.9,
        "reviews": 310,
    },

    # 2. LAPTOPS & COMPUTING
    {
        "category_slug": "electronics",
        "brand_name": "Apple",
        "title": "Apple MacBook Air 15-inch with M3 Chip (16GB Unified Memory, 512GB SSD) - Midnight",
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
            {"name": "16GB RAM / 512GB SSD / Starlight", "sku": "MBA15-16-512-SL", "price": 14490000, "compare": 15490000, "stock": 25, "attr": [{"name": "RAM/SSD", "value": "16GB/512GB"}, {"name": "Color", "value": "Starlight"}]},
        ],
        "specs": [
            {"group": "Processor", "name": "CPU/GPU", "value": "Apple M3 8-Core CPU / 10-Core GPU with Hardware Ray Tracing"},
            {"group": "Memory", "name": "Unified Memory", "value": "16GB Fast Unified RAM"},
            {"group": "Battery", "name": "Battery Life", "value": "Up to 18 Hours"},
        ],
        "highlights": ["Fanless, completely silent operation", "Stunning 15.3-inch Liquid Retina Display with 500 nits", "Supports up to two external displays", "MagSafe 3 charging port"],
        "rating": 4.9,
        "reviews": 1150,
    },
    {
        "category_slug": "electronics",
        "brand_name": "ASUS",
        "title": "ASUS ROG Zephyrus G16 (2024) Gaming Laptop (Intel Core Ultra 9, RTX 4080, 32GB RAM, 2TB SSD, OLED 240Hz)",
        "slug": "asus-rog-zephyrus-g16-core-ultra-9-rtx-4080-oled-240hz",
        "description": "Precision gaming in an ultra-sleek CNC aluminum chassis. Features ROG Nebula 2.5K OLED 240Hz/0.2ms display, NVIDIA GeForce RTX 4080 GPU, Intel Core Ultra 9 185H with AI NPU, and ROG Intelligent Cooling with vapor chamber.",
        "short_description": "Intel Core Ultra 9, RTX 4080 12GB, 2.5K OLED 240Hz, 32GB LPDDR5X, 2TB SSD",
        "base_price_paise": 24999000,
        "compare_at_price_paise": 27999000,
        "tags": ["asus", "rog", "gaming laptop", "rtx 4080", "oled", "intel ultra 9"],
        "images": [
            "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80",
            "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80",
        ],
        "variants": [
            {"name": "Core Ultra 9 / RTX 4080 / 32GB / 2TB / Eclipse Gray", "sku": "ROG-G16-4080", "price": 24999000, "compare": 27999000, "stock": 12, "attr": [{"name": "GPU", "value": "RTX 4080"}, {"name": "RAM/SSD", "value": "32GB/2TB"}]},
        ],
        "specs": [
            {"group": "Processor", "name": "CPU", "value": "Intel Core Ultra 9 185H (16 Cores, 22 Threads, 5.1GHz)"},
            {"group": "Graphics", "name": "GPU", "value": "NVIDIA GeForce RTX 4080 12GB GDDR6 (115W TGP)"},
            {"group": "Display", "name": "Screen", "value": "16.0-inch 2.5K (2560 x 1600) OLED 240Hz 0.2ms, 100% DCI-P3, G-Sync"},
        ],
        "highlights": ["1.85 kg ultra-thin CNC aluminum unibody", "ROG Nebula OLED 240Hz display with true blacks", "Slash Lighting array on lid", "6-speaker system with Dolby Atmos"],
        "rating": 4.9,
        "reviews": 240,
    },
    {
        "category_slug": "electronics",
        "brand_name": "Dell",
        "title": "Dell XPS 15 9530 Premium Laptop (Intel Core i9-13900H, 32GB RAM, 1TB SSD, 3.5K OLED Touch, RTX 4070)",
        "slug": "dell-xps-15-core-i9-32gb-1tb-oled-touch-rtx-4070",
        "description": "Crafted from CNC machined aluminum and carbon fiber palm rest. Featuring an immersive 15.6-inch 3.5K OLED InfinityEdge touchscreen, 13th Gen Intel Core i9, and NVIDIA GeForce RTX 4070 graphics.",
        "short_description": "Intel Core i9-13900H, RTX 4070, 3.5K OLED Touch, 32GB DDR5, 1TB NVMe SSD",
        "base_price_paise": 22499000,
        "compare_at_price_paise": 24999000,
        "tags": ["dell", "xps", "creator laptop", "oled", "intel i9", "rtx 4070"],
        "images": [
            "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80",
        ],
        "variants": [
            {"name": "i9-13900H / RTX 4070 / 32GB / 1TB / Platinum Silver", "sku": "DELL-XPS15-I9", "price": 22499000, "compare": 24999000, "stock": 15, "attr": [{"name": "CPU/GPU", "value": "i9/RTX 4070"}]},
        ],
        "specs": [
            {"group": "Processor", "name": "CPU", "value": "13th Gen Intel Core i9-13900H (14 Cores, 5.4 GHz)"},
            {"group": "Display", "name": "Display", "value": "15.6-inch 3.5K (3456x2160) OLED Touch InfinityEdge 400 nits"},
        ],
        "highlights": ["3.5K OLED InfinityEdge 4-sided ultra-thin bezel", "CNC aluminum with aerospace-grade carbon fiber", "Quad-speaker design with Waves Nx 3D audio"],
        "rating": 4.8,
        "reviews": 195,
    },

    # 3. AUDIO & WEARABLES
    {
        "category_slug": "electronics",
        "brand_name": "Apple",
        "title": "Apple AirPods Max Wireless Over-Ear Headphones with Active Noise Cancellation - Space Gray",
        "slug": "apple-airpods-max-space-gray",
        "description": "High-fidelity audio with industry-leading Active Noise Cancellation, Transparency mode, Personalized Spatial Audio with dynamic head tracking, and stunning acoustic mesh canopy design.",
        "short_description": "Custom Acoustic Design, Active Noise Cancellation, Spatial Audio, 20 Hours Battery",
        "base_price_paise": 5490000,
        "compare_at_price_paise": 5990000,
        "tags": ["airpods", "apple", "headphones", "anc", "spatial audio", "audio"],
        "images": [
            "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80",
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
        ],
        "variants": [
            {"name": "Space Gray", "sku": "APM-SG", "price": 5490000, "compare": 5990000, "stock": 40, "attr": [{"name": "Color", "value": "Space Gray"}]},
            {"name": "Silver", "sku": "APM-SV", "price": 5490000, "compare": 5990000, "stock": 30, "attr": [{"name": "Color", "value": "Silver"}]},
            {"name": "Sky Blue", "sku": "APM-SB", "price": 5490000, "compare": 5990000, "stock": 20, "attr": [{"name": "Color", "value": "Sky Blue"}]},
        ],
        "specs": [
            {"group": "Audio", "name": "Driver", "value": "Apple-designed 40mm dynamic driver with dual neodymium motor"},
            {"group": "Battery", "name": "Battery Life", "value": "Up to 20 hours with ANC / Spatial Audio enabled"},
        ],
        "highlights": ["Apple-designed dynamic driver delivers high-fidelity audio", "Active Noise Cancellation blocks outside noise", "Personalized Spatial Audio with dynamic head tracking", "Knit-mesh canopy and memory foam ear cushions"],
        "rating": 4.8,
        "reviews": 1620,
    },
    {
        "category_slug": "electronics",
        "brand_name": "Sony",
        "title": "Sony WH-1000XM5 Wireless Industry Leading Noise Cancelling Headphones (Auto NC Optimizer, 30h Battery, Mic for Calls) - Black",
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
            {"name": "Silver", "sku": "SONY-XM5-SLV", "price": 2699000, "compare": 3499000, "stock": 45, "attr": [{"name": "Color", "value": "Silver"}]},
            {"name": "Midnight Blue", "sku": "SONY-XM5-MBL", "price": 2799000, "compare": 3499000, "stock": 25, "attr": [{"name": "Color", "value": "Midnight Blue"}]},
        ],
        "specs": [
            {"group": "Audio", "name": "Noise Cancellation", "value": "HD Noise Cancelling Processor QN1 + V1"},
            {"group": "Battery", "name": "Battery Life", "value": "30 hours (3 min quick charge for 3 hours playback)"},
        ],
        "highlights": ["Industry-leading ANC with 8 microphones", "Ultra-comfortable soft fit leather design", "Speak-to-chat technology and multi-point pairing", "Crystal clear calls with AI noise reduction"],
        "rating": 4.8,
        "reviews": 3450,
    },
    {
        "category_slug": "electronics",
        "brand_name": "Apple",
        "title": "Apple Watch Ultra 2 (GPS + Cellular 49mm) Smartwatch - Titanium Case with Orange Ocean Band",
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
            {"name": "49mm Titanium / Blue/Black Trail Loop", "sku": "AWU2-49-TL", "price": 8490000, "compare": 8990000, "stock": 25, "attr": [{"name": "Case/Band", "value": "Titanium/Trail Loop"}]},
        ],
        "specs": [
            {"group": "Display", "name": "Brightness", "value": "Always-On Retina display, 3000 nits peak"},
            {"group": "Durability", "name": "Water Resistance", "value": "100m water resistant, EN13319 certified for scuba diving to 40m"},
        ],
        "highlights": ["Rugged corrosion-resistant 49mm titanium case", "Double tap gesture to answer calls and stop timers", "Customizable Action button", "Precision dual-frequency GPS (L1 and L5)"],
        "rating": 4.9,
        "reviews": 820,
    },
    {
        "category_slug": "electronics",
        "brand_name": "boAt",
        "title": "boAt Nirvana Ion TWS Earbuds with 120 Hours Total Playback, Dual EQ Modes & Crystal Bionic Sound",
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
            {"name": "Ivory White", "sku": "BOAT-ION-WHT", "price": 199900, "compare": 799000, "stock": 150, "attr": [{"name": "Color", "value": "Ivory White"}]},
        ],
        "specs": [
            {"group": "Battery", "name": "Playback Time", "value": "120 Hours Total (24 Hours in Earbuds)"},
            {"group": "Connectivity", "name": "Bluetooth", "value": "v5.2 with In-Ear Detection"},
        ],
        "highlights": ["Massive 24hr nonstop single charge battery", "HiFi DSP tuned Crystal Bionic Sound", "Quad Mics with ENx Technology", "Beast Mode 60ms low latency for gaming"],
        "rating": 4.5,
        "reviews": 6420,
    },

    # 4. HOME & KITCHEN APPLIANCES
    {
        "category_slug": "home-kitchen",
        "brand_name": "Dyson",
        "title": "Dyson V12 Detect Slim Total Clean Cordless Vacuum Cleaner (Laser Slim Fluffy, Piezo Sensor, Hair Screw Tool)",
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
            {"name": "Yellow / Nickel Total Clean", "sku": "DYS-V12-TC", "price": 4499000, "compare": 5790000, "stock": 40, "attr": [{"name": "Model", "value": "Total Clean"}]},
        ],
        "specs": [
            {"group": "Performance", "name": "Suction Power", "value": "150 Air Watts"},
            {"group": "Weight", "name": "Weight", "value": "2.2 kg (Lightweight Ergonomic)"},
            {"group": "Filtration", "name": "Filtration", "value": "Advanced whole-machine filtration captures 99.99% of particles down to 0.3 microns"},
        ],
        "highlights": ["Laser reveals invisible microscopic dust on hard floors", "Piezo sensor automatically adapts suction power", "LCD screen shows scientific proof of a deep clean", "Hair screw tool picks up long hair and pet hair without tangling"],
        "rating": 4.9,
        "reviews": 1540,
    },
    {
        "category_slug": "home-kitchen",
        "brand_name": "Philips",
        "title": "Philips Digital Air Fryer XXL with Rapid Air Technology & Fat Removal Technology (7.2L Capacity, 2000W)",
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
            {"name": "Black / Rose Gold 7.2L", "sku": "PHI-AF-XXL", "price": 1199900, "compare": 1699500, "stock": 80, "attr": [{"name": "Capacity", "value": "7.2 Litres"}]},
        ],
        "specs": [
            {"group": "Cooking", "name": "Power", "value": "2000 Watts Rapid Heat"},
            {"group": "Capacity", "name": "Basket Capacity", "value": "7.2L (1.4 kg Fries Capacity)"},
        ],
        "highlights": ["Up to 90% less fat with Twin TurboStar technology", "Touchscreen with 7 preset cooking programs", "Keep warm mode for flexible serving time", "QuickClean basket with non-stick mesh"],
        "rating": 4.7,
        "reviews": 2980,
    },

    # 5. FASHION, FOOTWEAR & LUXURY (AJIO & MYNTRA LEVEL)
    {
        "category_slug": "footwear",
        "brand_name": "Nike",
        "title": "Nike Air Jordan 1 Retro High OG Men's Basketball Sneakers - Chicago Lost & Found",
        "slug": "nike-air-jordan-1-retro-high-og-chicago",
        "description": "The iconic sneaker that started it all. Featuring premium cracked leather overlays, vintage sail midsole, authentic retro packaging, and encapsulated Nike Air cushioning in the heel.",
        "short_description": "Iconic High-Top Silhouette, Premium Leather Uppers, Encapsulated Air Sole",
        "base_price_paise": 1699500,
        "compare_at_price_paise": 1999500,
        "tags": ["nike", "air jordan", "sneakers", "jordan 1", "footwear", "streetwear"],
        "images": [
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
            "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&q=80",
        ],
        "variants": [
            {"name": "UK 8 / Varsity Red & White", "sku": "AJ1-OG-UK8", "price": 1699500, "compare": 1999500, "stock": 18, "attr": [{"name": "Size", "value": "UK 8"}, {"name": "Color", "value": "Varsity Red/White"}]},
            {"name": "UK 9 / Varsity Red & White", "sku": "AJ1-OG-UK9", "price": 1699500, "compare": 1999500, "stock": 25, "attr": [{"name": "Size", "value": "UK 9"}, {"name": "Color", "value": "Varsity Red/White"}]},
            {"name": "UK 10 / Varsity Red & White", "sku": "AJ1-OG-UK10", "price": 1699500, "compare": 1999500, "stock": 14, "attr": [{"name": "Size", "value": "UK 10"}, {"name": "Color", "value": "Varsity Red/White"}]},
        ],
        "specs": [
            {"group": "Material", "name": "Upper", "value": "100% Genuine Full-Grain & Cracked Leather"},
            {"group": "Sole", "name": "Outsole", "value": "Solid Rubber with Deep Flex Grooves"},
        ],
        "highlights": ["Collector's edition Lost & Found vintage aesthetic", "Padded collar for ankle comfort", "Nike Air unit in heel for lightweight cushioning", "Solid rubber outsole with pivot circle"],
        "rating": 4.9,
        "reviews": 1890,
    },
    {
        "category_slug": "fashion",
        "brand_name": "Levi's",
        "title": "Levi's Men's 511 Slim Fit Stretch Denim Jeans (Dark Indigo Rinse)",
        "slug": "levis-mens-511-slim-fit-stretch-denim-jeans-indigo",
        "description": "A modern slim with room to move. The 511 Slim Fit Stretch Jeans are a classic since right now. These jeans sit below the waist with a slim leg from hip to ankle. Crafted with +All Seasons Tech.",
        "short_description": "Slim Leg from Hip to Ankle, Premium Stretch Denim, Classic 5-Pocket Styling",
        "base_price_paise": 249900,
        "compare_at_price_paise": 419900,
        "tags": ["levis", "jeans", "denim", "fashion", "menswear", "pants"],
        "images": [
            "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80",
        ],
        "variants": [
            {"name": "30W x 32L / Dark Indigo", "sku": "LEV-511-30", "price": 249900, "compare": 419900, "stock": 60, "attr": [{"name": "Waist/Length", "value": "30W x 32L"}]},
            {"name": "32W x 32L / Dark Indigo", "sku": "LEV-511-32", "price": 249900, "compare": 419900, "stock": 80, "attr": [{"name": "Waist/Length", "value": "32W x 32L"}]},
            {"name": "34W x 32L / Dark Indigo", "sku": "LEV-511-34", "price": 249900, "compare": 419900, "stock": 50, "attr": [{"name": "Waist/Length", "value": "34W x 32L"}]},
        ],
        "specs": [
            {"group": "Fabric", "name": "Composition", "value": "99% Cotton, 1% Elastane (Lycra)"},
            {"group": "Fit", "name": "Fit", "value": "Slim Fit, Sits Below Waist, Zip Fly"},
        ],
        "highlights": ["Engineered with innovative stretch for maximum comfort", "Iconic Arcuate stitch on back pockets", "Durable copper rivets at stress points", "Machine wash friendly with minimal shrinkage"],
        "rating": 4.6,
        "reviews": 3200,
    },
    {
        "category_slug": "fashion",
        "brand_name": "Zara",
        "title": "Zara Women's Pleated Floral Satin Maxi Dress with Belt",
        "slug": "zara-womens-pleated-floral-satin-maxi-dress",
        "description": "Flowing maxi dress featuring a V-neckline with lapel collar, long cuffed sleeves, matching fabric belt with buckle, pleated skirt, and front button fastening.",
        "short_description": "Satin Finish, Pleated Skirt, Belt with Buckle, Vibrant Botanical Floral Print",
        "base_price_paise": 399000,
        "compare_at_price_paise": 599000,
        "tags": ["zara", "dress", "womens fashion", "maxi dress", "floral", "ajio"],
        "images": [
            "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=80",
        ],
        "variants": [
            {"name": "Small (S) / Floral Print", "sku": "ZAR-DR-S", "price": 399000, "compare": 599000, "stock": 25, "attr": [{"name": "Size", "value": "S"}]},
            {"name": "Medium (M) / Floral Print", "sku": "ZAR-DR-M", "price": 399000, "compare": 599000, "stock": 40, "attr": [{"name": "Size", "value": "M"}]},
            {"name": "Large (L) / Floral Print", "sku": "ZAR-DR-L", "price": 399000, "compare": 599000, "stock": 30, "attr": [{"name": "Size", "value": "L"}]},
        ],
        "specs": [
            {"group": "Fabric", "name": "Material", "value": "100% Recycled Polyester Satin"},
        ],
        "highlights": ["Premium fluid satin with soft sheen", "Flattering adjustable waist tie belt", "Perfect for weddings, dinners, and brunch events"],
        "rating": 4.7,
        "reviews": 420,
    },

    # 6. MEESHO HIT VALUE & RESELLER ETHNIC WEAR
    {
        "category_slug": "fashion",
        "brand_name": "Saree Sansar",
        "title": "Pure Banarasi Jacquard Zari Woven Soft Silk Saree with Unstitched Blouse Piece",
        "slug": "pure-banarasi-jacquard-zari-soft-silk-saree",
        "description": "Exquisite Banarasi silk saree adorned with rich golden zari floral motifs, grand pallu with tassels, and lustrous contrast border. Top bestseller on Meesho & Amazon for weddings and festivals.",
        "short_description": "Pure Soft Art Silk, Rich Gold Zari Work, Grand Pallu, Includes Blouse Piece",
        "base_price_paise": 119900,
        "compare_at_price_paise": 399900,
        "tags": ["saree", "banarasi", "ethnic wear", "meesho", "silk saree", "reseller hit"],
        "images": [
            "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80",
        ],
        "variants": [
            {"name": "Royal Maroon & Gold Zari", "sku": "SAR-BAN-MRN", "price": 119900, "compare": 399900, "stock": 150, "attr": [{"name": "Color", "value": "Royal Maroon"}]},
            {"name": "Peacock Green & Gold Zari", "sku": "SAR-BAN-GRN", "price": 119900, "compare": 399900, "stock": 120, "attr": [{"name": "Color", "value": "Peacock Green"}]},
            {"name": "Mustard Yellow & Gold Zari", "sku": "SAR-BAN-YLW", "price": 119900, "compare": 399900, "stock": 100, "attr": [{"name": "Color", "value": "Mustard Yellow"}]},
        ],
        "specs": [
            {"group": "Saree Details", "name": "Fabric", "value": "Kanjivaram/Banarasi Soft Art Silk"},
            {"group": "Length", "name": "Length", "value": "5.5 Meters Saree + 0.8 Meter Blouse"},
        ],
        "highlights": ["Top Reseller Favorite: High margin potential of ₹300-₹500 per sale", "Intricate gold zari weaving across body and grand pallu", "Lightweight and breathable drape"],
        "rating": 4.6,
        "reviews": 5120,
    },
]


from app.core.database import init_db

async def seed_massive_products():
    print("Connecting to MongoDB Atlas to seed massive Amazon & Flipkart catalog...")
    await init_db()

    # Fetch default seller and categories
    default_seller = await SellerProfile.find_one()
    seller_id = default_seller.id if default_seller else PydanticObjectId()

    categories_dict = {}
    async for cat in Category.find():
        categories_dict[cat.slug] = cat

    brands_dict = {}
    async for br in Brand.find():
        brands_dict[br.name.lower()] = br

    created_count = 0
    updated_count = 0

    for item in AMAZON_FLIPKART_PRODUCTS:
        cat_slug = item["category_slug"]
        cat_obj = categories_dict.get(cat_slug)
        if not cat_obj:
            cat_obj = await Category.find_one(Category.slug == cat_slug)
            if not cat_obj:
                cat_obj = Category(name=cat_slug.title(), slug=cat_slug)
                await cat_obj.insert()
                categories_dict[cat_slug] = cat_obj

        brand_name = item.get("brand_name", "ShopVerse Verified")
        brand_obj = brands_dict.get(brand_name.lower())
        if not brand_obj:
            brand_obj = Brand(name=brand_name, slug=brand_name.lower().replace(" ", "-"))
            await brand_obj.insert()
            brands_dict[brand_name.lower()] = brand_obj

        # Build variants
        variants_list: list[ProductVariant] = []
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

        # Build images
        images_list = [
            ProductImage(url=img_url, alt=item["title"], is_primary=(idx == 0), display_order=idx)
            for idx, img_url in enumerate(item["images"])
        ]

        # Build specs & highlights
        specs_list = [
            ProductSpecification(group=s["group"], name=s["name"], value=s["value"])
            for s in item.get("specs", [])
        ]
        highlights_list = [
            ProductHighlight(text=h) for h in item.get("highlights", [])
        ]

        discount_pct = 0
        if item.get("compare_at_price_paise") and item["compare_at_price_paise"] > item["base_price_paise"]:
            discount_pct = int(
                ((item["compare_at_price_paise"] - item["base_price_paise"]) / item["compare_at_price_paise"]) * 100
            )

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
    print(f"\n Catalog expansion complete!")
    print(f"Created: {created_count} new flagship products")
    print(f"Updated: {updated_count} existing products")
    print(f"Total Active Products in Database: {total_prods}")


if __name__ == "__main__":
    asyncio.run(seed_massive_products())
