import asyncio
import os
import sys
import random
from datetime import datetime, timezone, timedelta
from faker import Faker
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie

# Add parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.config import settings
from app.core.security import get_password_hash
from app.models import (
    User,
    UserRole,
    AuthProvider,
    SellerProfile,
    SellerStatus,
    BankDetails,
    Category,
    Brand,
    Product,
    ProductVariant,
    ProductImage,
    ProductSpecification,
    ProductHighlight,
    VariantAttribute,
    Coupon,
    DiscountType,
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

fake = Faker("en_IN")

CATEGORIES_DATA = [
    {
        "name": "Electronics & Gadgets",
        "slug": "electronics",
        "icon": "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=100&q=80",
        "subs": [
            {"name": "Laptops & Computers", "slug": "laptops"},
            {"name": "Headphones & Audio", "slug": "audio"},
            {"name": "Smartwatches & Wearables", "slug": "smartwatches"},
            {"name": "Cameras & Photography", "slug": "cameras"},
        ],
    },
    {
        "name": "Mobiles & Accessories",
        "slug": "mobiles",
        "icon": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100&q=80",
        "subs": [
            {"name": "Smartphones", "slug": "smartphones"},
            {"name": "Power Banks", "slug": "power-banks"},
            {"name": "Phone Cases & Covers", "slug": "phone-cases"},
            {"name": "Fast Chargers & Cables", "slug": "chargers"},
        ],
    },
    {
        "name": "Fashion & Apparel",
        "slug": "fashion",
        "icon": "https://images.unsplash.com/photo-1445205170230-053b83016050?w=100&q=80",
        "subs": [
            {"name": "Men's Clothing", "slug": "mens-clothing"},
            {"name": "Women's Ethnic Wear", "slug": "womens-ethnic"},
            {"name": "Women's Western Wear", "slug": "womens-western"},
            {"name": "Kids Fashion", "slug": "kids-fashion"},
        ],
    },
    {
        "name": "Footwear",
        "slug": "footwear",
        "icon": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&q=80",
        "subs": [
            {"name": "Running & Sports Shoes", "slug": "sports-shoes"},
            {"name": "Casual Sneakers", "slug": "sneakers"},
            {"name": "Formal Shoes", "slug": "formal-shoes"},
            {"name": "Sandals & Slippers", "slug": "sandals"},
        ],
    },
    {
        "name": "Home & Kitchen",
        "slug": "home-kitchen",
        "icon": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=100&q=80",
        "subs": [
            {"name": "Cookware & Dining", "slug": "cookware"},
            {"name": "Home Decor & Lighting", "slug": "home-decor"},
            {"name": "Bedding & Linen", "slug": "bedding"},
            {"name": "Kitchen Appliances", "slug": "kitchen-appliances"},
        ],
    },
    {
        "name": "Beauty & Personal Care",
        "slug": "beauty",
        "icon": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=100&q=80",
        "subs": [
            {"name": "Skincare", "slug": "skincare"},
            {"name": "Haircare", "slug": "haircare"},
            {"name": "Fragrances & Perfumes", "slug": "fragrances"},
            {"name": "Grooming Appliances", "slug": "grooming"},
        ],
    },
    {
        "name": "Sports & Fitness",
        "slug": "sports-fitness",
        "icon": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=100&q=80",
        "subs": [
            {"name": "Gym Equipment", "slug": "gym-equipment"},
            {"name": "Yoga & Pilates", "slug": "yoga"},
            {"name": "Sporting Goods", "slug": "sporting-goods"},
            {"name": "Supplements & Nutrition", "slug": "nutrition"},
        ],
    },
    {
        "name": "Books & Stationery",
        "slug": "books-stationery",
        "icon": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=100&q=80",
        "subs": [
            {"name": "Bestselling Fiction", "slug": "fiction-books"},
            {"name": "Business & Self-Help", "slug": "self-help"},
            {"name": "Stationery & Notebooks", "slug": "stationery"},
            {"name": "Office Supplies", "slug": "office-supplies"},
        ],
    },
    {
        "name": "Toys & Baby Care",
        "slug": "toys-baby",
        "icon": "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=100&q=80",
        "subs": [
            {"name": "Action Figures & Dolls", "slug": "action-figures"},
            {"name": "Educational Toys", "slug": "educational-toys"},
            {"name": "Baby Diapers & Wipes", "slug": "baby-care"},
            {"name": "Strollers & Gear", "slug": "strollers"},
        ],
    },
    {
        "name": "Gourmet & Groceries",
        "slug": "groceries",
        "icon": "https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&q=80",
        "subs": [
            {"name": "Organic Dry Fruits & Nuts", "slug": "dry-fruits"},
            {"name": "Artisanal Coffee & Tea", "slug": "coffee-tea"},
            {"name": "Healthy Snacks", "slug": "snacks"},
            {"name": "Spices & Condiments", "slug": "spices"},
        ],
    },
]

BRANDS_DATA = [
    {"name": "Apple", "slug": "apple", "logo": "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=120&q=80"},
    {"name": "Samsung", "slug": "samsung", "logo": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=120&q=80"},
    {"name": "Sony", "slug": "sony", "logo": "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=120&q=80"},
    {"name": "Nike", "slug": "nike", "logo": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&q=80"},
    {"name": "Adidas", "slug": "adidas", "logo": "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=120&q=80"},
    {"name": "Puma", "slug": "puma", "logo": "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=120&q=80"},
    {"name": "Levi's", "slug": "levis", "logo": "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=120&q=80"},
    {"name": "boAt", "slug": "boat", "logo": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120&q=80"},
    {"name": "Philips", "slug": "philips", "logo": "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=120&q=80"},
    {"name": "Noise", "slug": "noise", "logo": "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=120&q=80"},
    {"name": "Prestige", "slug": "prestige", "logo": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=120&q=80"},
    {"name": "Xiaomi", "slug": "xiaomi", "logo": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=120&q=80"},
    {"name": "OnePlus", "slug": "oneplus", "logo": "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=120&q=80"},
    {"name": "Dyson", "slug": "dyson", "logo": "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=120&q=80"},
    {"name": "Titan", "slug": "titan", "logo": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=120&q=80"},
    {"name": "Zara", "slug": "zara", "logo": "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=120&q=80"},
    {"name": "H&M", "slug": "hm", "logo": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=120&q=80"},
    {"name": "Ray-Ban", "slug": "rayban", "logo": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=120&q=80"},
    {"name": "Minimalist", "slug": "minimalist", "logo": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=120&q=80"},
    {"name": "Milton", "slug": "milton", "logo": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=120&q=80"},
]

# Curated Iconic Products across Amazon, Flipkart, Ajio & Meesho
ICONIC_PRODUCTS = [
    # --- AMAZON & FLIPKART ELECTRONICS & MOBILES ---
    {
        "title": "Apple iPhone 15 Pro (128 GB) - Natural Titanium",
        "category_slug": "smartphones",
        "brand_slug": "apple",
        "description": "Forged in titanium and featuring the groundbreaking A17 Pro chip, customizable Action button, 48MP main camera with 3x Telephoto lens, and USB-C connectivity with USB 3 speeds.",
        "short_description": "A17 Pro Chip, 48MP Camera, Titanium Design, Super Retina XDR display with ProMotion.",
        "base_price_paise": 12799000,
        "compare_at_price_paise": 13490000,
        "images": [
            "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80",
            "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80",
        ],
        "variants": [
            {"name": "Color & Storage", "val": "Natural Titanium (128GB)", "price": 12799000, "stock": 45},
            {"name": "Color & Storage", "val": "Blue Titanium (256GB)", "price": 13799000, "stock": 30},
            {"name": "Color & Storage", "val": "Black Titanium (512GB)", "price": 15799000, "stock": 20},
        ],
        "specs": {"Display": "6.1-inch Super Retina XDR OLED", "Processor": "A17 Pro Hexa Core", "Camera": "48MP + 12MP + 12MP", "Battery": "Up to 23 hours video playback"},
        "platform": "Amazon",
    },
    {
        "title": "Samsung Galaxy S24 Ultra 5G (Titanium Gray, 12GB RAM, 256GB Storage)",
        "category_slug": "smartphones",
        "brand_slug": "samsung",
        "description": "Welcome to the era of mobile AI. With Galaxy S24 Ultra in your hands, unleash whole new levels of creativity, productivity, and possibility with Circle to Search, Live Translate, and 200MP Quad Tele System.",
        "short_description": "Galaxy AI, 200MP Quad Camera, S Pen included, Snapdragon 8 Gen 3 for Galaxy.",
        "base_price_paise": 12999900,
        "compare_at_price_paise": 14499900,
        "images": [
            "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80",
            "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&q=80",
        ],
        "variants": [
            {"name": "Color", "val": "Titanium Gray (256GB)", "price": 12999900, "stock": 40},
            {"name": "Color", "val": "Titanium Black (512GB)", "price": 13999900, "stock": 25},
        ],
        "specs": {"Display": "6.8-inch Dynamic AMOLED 2X 120Hz", "Processor": "Snapdragon 8 Gen 3", "Camera": "200MP + 50MP + 12MP + 10MP", "Battery": "5000 mAh 45W Fast Charge"},
        "platform": "Amazon",
    },
    {
        "title": "Apple MacBook Air 13.6-inch M3 Chip (16GB Unified Memory, 512GB SSD)",
        "category_slug": "laptops",
        "brand_slug": "apple",
        "description": "Supercharged by the next-generation M3 chip, the redesigned MacBook Air combines incredible performance and up to 18 hours of battery life into a strikingly thin aluminum enclosure.",
        "short_description": "Apple M3 8-core CPU, 10-core GPU, 16GB RAM, 512GB SSD, Liquid Retina display.",
        "base_price_paise": 13490000,
        "compare_at_price_paise": 14490000,
        "images": [
            "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
            "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80",
        ],
        "variants": [
            {"name": "Color", "val": "Midnight (512GB)", "price": 13490000, "stock": 25},
            {"name": "Color", "val": "Starlight (512GB)", "price": 13490000, "stock": 30},
            {"name": "Color", "val": "Space Grey (256GB)", "price": 11490000, "stock": 40},
        ],
        "specs": {"Processor": "Apple M3 Chip (8-Core CPU)", "RAM": "16GB Unified Memory", "Storage": "512GB PCIe SSD", "Battery": "18 Hours Battery Life"},
        "platform": "Amazon",
    },
    {
        "title": "Sony WH-1000XM5 Wireless Active Noise Cancelling Headphones",
        "category_slug": "audio",
        "brand_slug": "sony",
        "description": "Two processors and eight microphones for unprecedented noise cancellation. Superb sound quality with the newly designed driver unit, crystal clear hands-free calling, and 30 hours of battery life with quick charging.",
        "short_description": "Industry Leading Noise Cancellation, 30H Battery, Multipoint Bluetooth Connection.",
        "base_price_paise": 2699000,
        "compare_at_price_paise": 3499000,
        "images": [
            "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80",
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
        ],
        "variants": [
            {"name": "Color", "val": "Silver", "price": 2699000, "stock": 50},
            {"name": "Color", "val": "Black", "price": 2699000, "stock": 60},
            {"name": "Color", "val": "Midnight Blue", "price": 2799000, "stock": 35},
        ],
        "specs": {"Driver Size": "30mm Carbon Fiber", "Battery Life": "30 Hours with ANC on", "Weight": "250g", "Bluetooth": "v5.2 with LDAC High-Res Audio"},
        "platform": "Amazon",
    },
    {
        "title": "boAt Nirvana Ion ANC True Wireless Earbuds (120 Hours Playtime, 32dB ANC)",
        "category_slug": "audio",
        "brand_slug": "boat",
        "description": "Equipped with Crystal Bionic Sound powered by HiFi DSP, 32dB Active Noise Cancellation, Quad Mics with ENx technology, and a monstrous 120 hours of total playback time.",
        "short_description": "120H Total Battery, 32dB Active Noise Cancellation, Dual EQ Modes, In-Ear Detection.",
        "base_price_paise": 249900,
        "compare_at_price_paise": 799000,
        "images": [
            "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80",
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
        ],
        "variants": [
            {"name": "Color", "val": "Charcoal Black", "price": 249900, "stock": 120},
            {"name": "Color", "val": "Ivory White", "price": 249900, "stock": 90},
        ],
        "specs": {"Noise Cancellation": "Up to 32dB ANC", "Total Playtime": "120 Hours", "Driver": "10mm Dual Drivers", "Water Resistance": "IPX4 Splash Proof"},
        "platform": "Flipkart",
    },
    {
        "title": "Noise ColorFit Pulse 3 AMOLED Bluetooth Calling Smartwatch",
        "category_slug": "smartwatches",
        "brand_slug": "noise",
        "description": "1.96-inch AMOLED display with 500 nits brightness, TruSync Bluetooth calling technology, 100+ sports modes, 24x7 continuous heart rate & SpO2 blood oxygen tracking.",
        "short_description": "1.96\" AMOLED Screen, Bluetooth Calling, 7-Day Battery Life, Metallic Finish.",
        "base_price_paise": 199900,
        "compare_at_price_paise": 599900,
        "images": [
            "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80",
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
        ],
        "variants": [
            {"name": "Strap Color", "val": "Jet Black", "price": 199900, "stock": 80},
            {"name": "Strap Color", "val": "Rose Gold / Pink", "price": 209900, "stock": 70},
            {"name": "Strap Color", "val": "Deep Wine", "price": 199900, "stock": 40},
        ],
        "specs": {"Display": "1.96-inch AMOLED (410x502)", "Battery": "7 Days Standard Use", "Sensors": "Heart Rate, SpO2, Sleep Monitor", "Compatibility": "Android & iOS"},
        "platform": "Flipkart",
    },
    {
        "title": "Dyson V12 Detect Slim Total Clean Cordless Vacuum Cleaner",
        "category_slug": "kitchen-appliances",
        "brand_slug": "dyson",
        "description": "Dyson's most powerful, compact cordless vacuum. A precisely-angled laser makes invisible dust visible on hard floors. Piezo sensor continuously sizes and counts dust particles.",
        "short_description": "Laser dust detection, 150AW suction power, 60 minutes run time, LCD screen.",
        "base_price_paise": 5290000,
        "compare_at_price_paise": 6590000,
        "images": [
            "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&q=80",
            "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80",
        ],
        "variants": [
            {"name": "Edition", "val": "Standard Yellow/Iron", "price": 5290000, "stock": 20},
            {"name": "Edition", "val": "Gold Edition with Extra Filter", "price": 5790000, "stock": 15},
        ],
        "specs": {"Suction Power": "150 AW", "Bin Volume": "0.35L", "Run Time": "Up to 60 Mins", "Filtration": "Whole-machine HEPA filtration"},
        "platform": "Amazon",
    },

    # --- AJIO LUXE & FASHION ---
    {
        "title": "Levi's Men's 511 Slim Fit Mid-Rise Dark Indigo Jeans",
        "category_slug": "mens-clothing",
        "brand_slug": "levis",
        "description": "A modern slim with room to move, the 511 Slim Fit Stretch Jeans are a classic since right now. These jeans sit below the waist with a slim leg from hip to ankle.",
        "short_description": "99% Cotton, 1% Elastane, Mid-Rise, Zip fly with button closure, Stretch Comfort.",
        "base_price_paise": 239900,
        "compare_at_price_paise": 399900,
        "images": [
            "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800&q=80",
            "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80",
        ],
        "variants": [
            {"name": "Waist & Length", "val": "30W x 32L", "price": 239900, "stock": 35},
            {"name": "Waist & Length", "val": "32W x 32L", "price": 239900, "stock": 50},
            {"name": "Waist & Length", "val": "34W x 32L", "price": 239900, "stock": 40},
            {"name": "Waist & Length", "val": "36W x 32L", "price": 239900, "stock": 25},
        ],
        "specs": {"Fabric": "99% Cotton, 1% Elastane", "Fit": "Slim Fit", "Rise": "Mid Rise", "Wash Care": "Machine Wash Cold"},
        "platform": "Ajio",
    },
    {
        "title": "Nike Air Force 1 '07 Low-Top Classic All-White Sneakers",
        "category_slug": "sneakers",
        "brand_slug": "nike",
        "description": "The radiance lives on in the Nike Air Force 1 '07, the b-ball icon that puts a fresh spin on what you know best: crisp leather, bold colors, and the perfect amount of flash to make you shine.",
        "short_description": "Real & Synthetic Leather, Air-Sole cushioning, Non-marking rubber cupsole.",
        "base_price_paise": 819500,
        "compare_at_price_paise": 969500,
        "images": [
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
            "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80",
        ],
        "variants": [
            {"name": "Size", "val": "UK 7 (EU 41)", "price": 819500, "stock": 30},
            {"name": "Size", "val": "UK 8 (EU 42.5)", "price": 819500, "stock": 45},
            {"name": "Size", "val": "UK 9 (EU 44)", "price": 819500, "stock": 50},
            {"name": "Size", "val": "UK 10 (EU 45)", "price": 819500, "stock": 20},
        ],
        "specs": {"Upper": "100% Genuine Leather", "Sole": "Air-Cushioned Rubber", "Closure": "Lace-Up", "Style": "Low-Top Lifestyle"},
        "platform": "Ajio",
    },
    {
        "title": "Puma RS-X Reinvention Unisex Colorblocked Chunky Sneakers",
        "category_slug": "sports-shoes",
        "brand_slug": "puma",
        "description": "RS-X is back. The future-retro silhouette of this sneaker returns with a progressive aesthetic and angular details, complete with nubuck and suede overlays for a statement look.",
        "short_description": "Running System cushioning technology, Mesh upper with suede overlays, Rubber outsole.",
        "base_price_paise": 449900,
        "compare_at_price_paise": 899900,
        "images": [
            "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80",
            "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&q=80",
        ],
        "variants": [
            {"name": "Size", "val": "UK 7", "price": 449900, "stock": 25},
            {"name": "Size", "val": "UK 8", "price": 449900, "stock": 40},
            {"name": "Size", "val": "UK 9", "price": 449900, "stock": 35},
        ],
        "specs": {"Midsole": "Puma RS Polyurethane", "Upper": "Textile Mesh & Suede", "Traction": "High-Grip Rubber", "Weight": "380g"},
        "platform": "Ajio",
    },
    {
        "title": "Zara Flowy Tiered Floral Print Midi Dress with Belt",
        "category_slug": "womens-western",
        "brand_slug": "zara",
        "description": "V-neck midi dress featuring long cuffed sleeves, tiered ruffle skirt hem, elasticated waist with coordinated braided tie belt, and vibrant floral botanical print.",
        "short_description": "100% Viscose, Tiered Ruffle Silhouette, Long Sleeve with Elastic Cuffs.",
        "base_price_paise": 329000,
        "compare_at_price_paise": 499000,
        "images": [
            "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80",
            "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80",
        ],
        "variants": [
            {"name": "Size", "val": "S (Bust 34\")", "price": 329000, "stock": 30},
            {"name": "Size", "val": "M (Bust 36\")", "price": 329000, "stock": 40},
            {"name": "Size", "val": "L (Bust 38\")", "price": 329000, "stock": 25},
        ],
        "specs": {"Material": "100% Sustainable Viscose", "Length": "Midi Length (48 inches)", "Care": "Hand wash or gentle cycle", "Occasion": "Casual & Brunch"},
        "platform": "Ajio",
    },
    {
        "title": "Ray-Ban Classic Aviator Polarized Sunglasses (Gold / G-15 Green)",
        "category_slug": "fashion",
        "brand_slug": "rayban",
        "description": "Originally designed for U.S. aviators in 1937, Ray-Ban Aviator Classic sunglasses are a timeless model that combines great aviator styling with exceptional quality, performance, and comfort.",
        "short_description": "100% UV400 Polarized crystal lenses, Lightweight metal frame, Adjustable nose pads.",
        "base_price_paise": 849000,
        "compare_at_price_paise": 1159000,
        "images": [
            "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80",
            "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80",
        ],
        "variants": [
            {"name": "Size & Lens", "val": "Standard 58mm (Polarized Green)", "price": 849000, "stock": 35},
            {"name": "Size & Lens", "val": "Large 62mm (Polarized Brown)", "price": 879000, "stock": 20},
        ],
        "specs": {"Frame Material": "Corrosion-resistant Metal Alloy", "Lens": "G-15 Polarized Mineral Glass", "UV Protection": "100% UV Protection (UV400)"},
        "platform": "Ajio",
    },

    # --- MEESHO HIGH-MARGIN RESELLING SPECIALS ---
    {
        "title": "Handloom Banarasi Soft Silk Zari Woven Saree with Unstitched Blouse",
        "category_slug": "womens-ethnic",
        "brand_slug": "zara",
        "description": "Richly woven pure Kanjivaram / Banarasi jacquard silk saree with traditional peacock and floral gold zari motifs throughout the body, heavy pallu, and matching designer blouse piece.",
        "short_description": "Pure Soft Silk Blend, Heavy Gold Zari Work, Saree Length 5.5M + 0.8M Blouse.",
        "base_price_paise": 99900,
        "compare_at_price_paise": 399900,
        "images": [
            "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80",
            "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80",
        ],
        "variants": [
            {"name": "Color", "val": "Royal Peacock Blue", "price": 99900, "stock": 100},
            {"name": "Color", "val": "Bridal Crimson Red", "price": 99900, "stock": 120},
            {"name": "Color", "val": "Emerald Green & Gold", "price": 104900, "stock": 80},
        ],
        "specs": {"Fabric": "Art Silk Jacquard", "Saree Length": "5.5 Meters", "Blouse Length": "0.8 Meters Unstitched", "Weave Type": "Powerloom Banarasi"},
        "platform": "Meesho",
    },
    {
        "title": "Jaipur Pure Cambric Cotton Printed Anarkali Kurti, Pant & Dupatta Set",
        "category_slug": "womens-ethnic",
        "brand_slug": "hm",
        "description": "Hand block printed Jaipuri cotton 3-piece festive ethnic suit set. Features a flared Anarkali kurta with gota patti lace border, matching straight trousers, and full-length malmal dupatta.",
        "short_description": "100% 60x60 Pure Cotton, Gota Patti Detailing, 3-Piece Complete Ensemble.",
        "base_price_paise": 84900,
        "compare_at_price_paise": 249900,
        "images": [
            "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80",
            "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80",
        ],
        "variants": [
            {"name": "Size", "val": "M (38\")", "price": 84900, "stock": 60},
            {"name": "Size", "val": "L (40\")", "price": 84900, "stock": 75},
            {"name": "Size", "val": "XL (42\")", "price": 84900, "stock": 80},
            {"name": "Size", "val": "XXL (44\")", "price": 84900, "stock": 45},
        ],
        "specs": {"Kurta Fabric": "100% Cambric Cotton (60s count)", "Pant Fabric": "Pure Cotton with Pocket", "Dupatta": "Pure Mulmul Cotton (2.25M)"},
        "platform": "Meesho",
    },
    {
        "title": "24K Gold Plated Temple Choker Necklace & Jhumka Jewellery Set",
        "category_slug": "womens-ethnic",
        "brand_slug": "titan",
        "description": "Traditional South Indian matte gold finish temple choker necklace embellished with ruby pink stones, faux pearls, and Goddess Lakshmi motif with matching heavy jhumka earrings.",
        "short_description": "Matte Gold Plating, Kundan & Pearl Accents, Skin-Safe Lead-Free Brass Alloy.",
        "base_price_paise": 44900,
        "compare_at_price_paise": 199900,
        "images": [
            "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80",
            "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80",
        ],
        "variants": [
            {"name": "Stone Color", "val": "Ruby Pink & Pearl", "price": 44900, "stock": 150},
            {"name": "Stone Color", "val": "Emerald Green & Pearl", "price": 44900, "stock": 100},
        ],
        "specs": {"Base Metal": "Brass Alloy", "Plating": "Micron Matte Gold Plated", "Necklace Type": "Adjustable Dori Choker", "Closure": "Drawstring / Hook"},
        "platform": "Meesho",
    },
    {
        "title": "Korean Velvet Matte Liquid Lipstick Box (Pack of 12 Trending Shades)",
        "category_slug": "skincare",
        "brand_slug": "minimalist",
        "description": "Waterproof, smudge-proof 16-hour long lasting transfer-proof liquid lipsticks. Non-drying hydrating formula with Vitamin E in 12 everyday nude, pink, and bold berry shades.",
        "short_description": "Pack of 12 Shades, Transfer-Proof, Ultra Matte Finish, Lightweight & Waterproof.",
        "base_price_paise": 34900,
        "compare_at_price_paise": 149900,
        "images": [
            "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&q=80",
            "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80",
        ],
        "variants": [
            {"name": "Set", "val": "Box of 12 Mini Liquid Lipsticks (2.5ml each)", "price": 34900, "stock": 200},
        ],
        "specs": {"Finish": "Velvet Matte", "Quantity": "12 x 2.5ml", "Formulation": "Enriched with Jojoba Oil & Vit E", "Wear Time": "Up to 16 Hours"},
        "platform": "Meesho",
    },
    {
        "title": "Sunset Projection 16-Color RGB Ambient Floor Lamp with Remote",
        "category_slug": "home-decor",
        "brand_slug": "philips",
        "description": "Create instant golden-hour aesthetic vibes in your bedroom or video setup. 360-degree rotatable aluminum optical lens with wireless remote and 16 color lighting modes.",
        "short_description": "16 RGB Colors, 360° Rotatable Head, USB Powered with Wireless Remote Control.",
        "base_price_paise": 49900,
        "compare_at_price_paise": 199900,
        "images": [
            "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80",
            "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80",
        ],
        "variants": [
            {"name": "Model", "val": "16 Colors + Remote (Black Stand)", "price": 49900, "stock": 140},
            {"name": "Model", "val": "App Control Bluetooth Smart Sunset Lamp", "price": 69900, "stock": 90},
        ],
        "specs": {"Power Supply": "USB 5V/2A", "Material": "Aluminum & Crystal Lens", "Modes": "16 Static Colors + 4 Dynamic Effects"},
        "platform": "Meesho",
    },

    # --- HOME & KITCHEN (PRESTIGE / PHILIPS / MILTON) ---
    {
        "title": "Prestige Deluxe Alpha Stainless Steel Pressure Cooker (3 Litres)",
        "category_slug": "cookware",
        "brand_slug": "prestige",
        "description": "Manufactured from high quality surgical grade stainless steel with an Alpha Base heavy sandwich bottom suitable for both gas and induction cooktops. Features pressure indicator and durable handles.",
        "short_description": "3.0L Capacity, Induction & Gas Compatible, Stainless Steel Alpha Base.",
        "base_price_paise": 199900,
        "compare_at_price_paise": 289000,
        "images": [
            "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&q=80",
            "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80",
        ],
        "variants": [
            {"name": "Capacity", "val": "3 Litres", "price": 199900, "stock": 60},
            {"name": "Capacity", "val": "5 Litres", "price": 259900, "stock": 45},
        ],
        "specs": {"Capacity": "3.0 Litres", "Material": "AISI 304 Food Grade Stainless Steel", "Base": "Alpha Sandwich Induction Base", "Warranty": "5 Years Prestige Warranty"},
        "platform": "Flipkart",
    },
    {
        "title": "Milton Thermosteel Flip Lid Vacuum Insulated Flask (1000ml)",
        "category_slug": "cookware",
        "brand_slug": "milton",
        "description": "Double walled 304 grade stainless steel vacuum insulated flask that keeps your beverages hot for 24 hours or cold for 24 hours. 100% leak proof with jacket included.",
        "short_description": "24H Hot & Cold Retention, 100% Rust-Proof 304 Stainless Steel, Free Carry Pouch.",
        "base_price_paise": 94900,
        "compare_at_price_paise": 129000,
        "images": [
            "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80",
            "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80",
        ],
        "variants": [
            {"name": "Capacity", "val": "1000 ml", "price": 94900, "stock": 90},
            {"name": "Capacity", "val": "500 ml", "price": 64900, "stock": 70},
        ],
        "specs": {"Capacity": "1000 ml", "Insulation": "Copper Coated Double Wall Vacuum", "Material": "18/8 Food-Grade Stainless Steel", "Warranty": "1 Year Milton Guarantee"},
        "platform": "Amazon",
    },
    {
        "title": "Minimalist 10% Niacinamide + Zinc Face Serum for Blemishes & Oil Control (30ml)",
        "category_slug": "skincare",
        "brand_slug": "minimalist",
        "description": "An oil-free, lightweight daily serum formulated with pure 10% Niacinamide (Vitamin B3) and 1% Zinc PCA to balance sebum activity, fade acne marks, and reduce pore appearance.",
        "short_description": "Fragrance-Free, 10% Niacinamide, Zinc PCA, Matmarine to reduce sebum and acne spots.",
        "base_price_paise": 56900,
        "compare_at_price_paise": 59900,
        "images": [
            "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80",
            "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80",
        ],
        "variants": [
            {"name": "Volume", "val": "30 ml Glass Dropper", "price": 56900, "stock": 150},
        ],
        "specs": {"Key Ingredients": "10% Niacinamide, 1% Zinc PCA, Matmarine", "Skin Type": "Oily, Combination & Acne-Prone", "Texture": "Lightweight Water Gel"},
        "platform": "Nykaa / Amazon",
    },
]

STOCK_IMAGES = [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
    "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80",
    "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=80",
    "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
    "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80",
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&q=80",
    "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&q=80",
    "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80",
]


async def seed_database():
    print("Connecting to MongoDB Atlas for expanded multi-platform seeding...")
    motor_client = AsyncIOMotorClient(settings.MONGODB_URI)
    db = motor_client[settings.MONGODB_DB_NAME]

    document_models = [
        User, SellerProfile, Address, Category, Brand, Product,
        Cart, Order, PaymentTransaction, Review, Wishlist, Coupon,
        Banner, InAppNotification, SellerPayout, AuditLog, SearchLog,
        RecentlyViewed, OtpCode, SpinLog, ResellerProfile,
        ResellerSharedCatalog, ResellerOrderRecord,
    ]
    await init_beanie(database=db, document_models=document_models)
    print("Database connected. Cleaning existing collections...")

    for model in document_models:
        await model.find_all().delete()

    print("Creating Root Users (Admin, Sellers, Customers)...")
    admin_user = User(
        email="admin@shopverse.in",
        phone="+919876543210",
        hashed_password=get_password_hash("Admin@ShopVerse2026"),
        full_name="ShopVerse Administrator",
        role=UserRole.ADMIN,
        referral_code="ADMIN001",
        is_active=True,
        is_verified=True,
    )
    await admin_user.insert()

    demo_customer = User(
        email="customer@shopverse.in",
        phone="+919876543211",
        hashed_password=get_password_hash("Customer@1234"),
        full_name="Aarav Sharma",
        role=UserRole.CUSTOMER,
        wallet_balance_paise=50000,  # ₹500
        loyalty_points=650,
        referral_code="AARAV100",
        is_active=True,
        is_verified=True,
    )
    await demo_customer.insert()

    # Create 5 Verified Multi-Platform Sellers (Amazon, Flipkart, Meesho, Ajio inspired stores)
    seller_users = []
    seller_profiles = []
    seller_names = [
        ("Cloudtail India Tech (Amazon Verified)", "seller1@shopverse.in", "+919876543221", "Bangalore, Karnataka"),
        ("RetailNet Lifestyle (Flipkart SuperSeller)", "seller2@shopverse.in", "+919876543222", "Mumbai, Maharashtra"),
        ("Jaipur Handloom & Silk Weaves (Meesho Top Reseller Hub)", "seller3@shopverse.in", "+919876543223", "Jaipur, Rajasthan"),
        ("Reliance Trends Luxe Brands (Ajio Partner)", "seller4@shopverse.in", "+919876543224", "Gurgaon, Haryana"),
        ("ProActive Sports & Nutrition Hub", "seller5@shopverse.in", "+919876543225", "Delhi NCR"),
    ]

    for name, email, phone, city in seller_names:
        u = User(
            email=email,
            phone=phone,
            hashed_password=get_password_hash("Seller@1234"),
            full_name=f"{name.split(' ')[0]} Manager",
            role=UserRole.SELLER,
            referral_code=f"SELL{random.randint(100,999)}",
            is_active=True,
            is_verified=True,
        )
        await u.insert()
        seller_users.append(u)

        sp = SellerProfile(
            user_id=u.id,
            store_name=name,
            store_slug=name.lower().replace(" ", "-").replace("&", "and").replace("(", "").replace(")", ""),
            status=SellerStatus.APPROVED,
            gst_number=f"27AABCU{random.randint(1000,9999)}R1ZN",
            pan_number=f"AABCU{random.randint(1000,9999)}R",
            bank_details=BankDetails(
                account_holder_name=name,
                account_number=f"98765432{random.randint(1000,9999)}",
                ifsc_code="HDFC0001234",
                bank_name="HDFC Bank",
                upi_id=f"{name.lower().split(' ')[0]}@hdfcbank",
            ),
            commission_rate_pct=8.0,
            lifetime_earnings_paise=random.randint(25000000, 85000000),
            avg_seller_rating=round(random.uniform(4.5, 4.9), 1),
        )
        await sp.insert()
        seller_profiles.append(sp)

    print(f"Created Admin and {len(seller_profiles)} verified sellers.")

    print("Creating Categories and Subcategories...")
    created_categories = {}
    for cat_data in CATEGORIES_DATA:
        root_cat = Category(
            name=cat_data["name"],
            slug=cat_data["slug"],
            icon_url=cat_data["icon"],
            level=0,
            is_featured=True,
            slug_path=[cat_data["slug"]],
        )
        await root_cat.insert()
        created_categories[cat_data["slug"]] = root_cat

        for sub in cat_data["subs"]:
            sub_cat = Category(
                name=sub["name"],
                slug=sub["slug"],
                parent_id=root_cat.id,
                level=1,
                slug_path=[cat_data["slug"], sub["slug"]],
            )
            await sub_cat.insert()
            created_categories[sub["slug"]] = sub_cat

    print("Creating Brands...")
    created_brands = {}
    for b in BRANDS_DATA:
        brand = Brand(
            name=b["name"],
            slug=b["slug"],
            logo_url=b["logo"],
            is_featured=True,
        )
        await brand.insert()
        created_brands[b["slug"]] = brand

    print("Seeding Curated Iconic Amazon, Flipkart, Ajio & Meesho Products...")
    product_count = 0
    now = datetime.now(timezone.utc)

    # 1. Insert Curated Iconic Products
    for item in ICONIC_PRODUCTS:
        cat = created_categories.get(item["category_slug"]) or created_categories.get("electronics")
        brand = created_brands.get(item["brand_slug"]) or list(created_brands.values())[0]
        seller = random.choice(seller_profiles)

        slug = f"{item['title'].lower().replace(' ', '-').replace('&', 'and').replace('/', '-').replace('(', '').replace(')', '').replace('+', 'plus')[:60]}-{random.randint(100, 999)}"
        discount_pct = int(((item["compare_at_price_paise"] - item["base_price_paise"]) / item["compare_at_price_paise"]) * 100)

        variant_objs = []
        for v_idx, v in enumerate(item["variants"]):
            variant_objs.append(
                ProductVariant(
                    variant_id=f"var-iconic-{product_count}-{v_idx}",
                    sku=f"SKU-{brand.name[:3].upper()}-{random.randint(1000, 9999)}-{v_idx+1}",
                    attributes=[VariantAttribute(name=v["name"], value=v["val"])],
                    price_paise=v["price"],
                    compare_at_price_paise=int(v["price"] * 1.25),
                    stock=v["stock"],
                    images=[ProductImage(url=item["images"][0], is_primary=v_idx == 0)],
                )
            )

        spec_objs = [
            ProductSpecification(group="General", name=k, value=v)
            for k, v in item.get("specs", {}).items()
        ] + [
            ProductSpecification(group="General", name="Platform Inspiration", value=item.get("platform", "ShopVerse Exclusive")),
            ProductSpecification(group="General", name="Warranty", value="1 Year Official Manufacturer Warranty"),
            ProductSpecification(group="General", name="Country of Origin", value="India"),
        ]

        p = Product(
            seller_id=seller.id,
            category_id=cat.id,
            category_slug=cat.slug,
            brand_id=brand.id,
            brand_name=brand.name,
            title=item["title"],
            slug=slug,
            description=item["description"],
            short_description=item["short_description"],
            tags=[cat.slug, brand.slug, "bestseller", item.get("platform", "").lower()],
            images=[
                ProductImage(url=img, is_primary=(idx == 0), display_order=idx + 1)
                for idx, img in enumerate(item["images"])
            ],
            variants=variant_objs,
            specifications=spec_objs,
            highlights=[
                ProductHighlight(icon="ShieldCheck", text="100% Original Brand Warranty"),
                ProductHighlight(icon="Truck", text="Free Doorstep Delivery on Prime/Festive orders"),
                ProductHighlight(icon="RefreshCw", text="7-Day Easy Return & Replacement"),
            ],
            base_price_paise=item["base_price_paise"],
            compare_at_price_paise=item["compare_at_price_paise"],
            discount_pct=discount_pct,
            total_stock=sum(v.stock for v in variant_objs),
            avg_rating=round(random.uniform(4.3, 4.9), 1),
            review_count=random.randint(85, 940),
            view_count=random.randint(500, 15000),
            sales_count=random.randint(40, 2300),
            is_published=True,
            is_featured=True,
            is_bestseller=True,
            is_trending=True,
            is_flash_deal=(product_count % 3 == 0),
            flash_deal_end_at=now + timedelta(hours=24) if (product_count % 3 == 0) else None,
        )
        await p.insert()
        product_count += 1

    # 2. Expand category catalog with 250+ additional multi-category products
    for cat_slug, cat_doc in created_categories.items():
        if cat_doc.level == 1:
            for i in range(12):
                brand = random.choice(list(created_brands.values()))
                seller = random.choice(seller_profiles)
                adj = random.choice(["Premium", "Ultra", "Classic", "Smart", "Organic", "Handcrafted", "High-Performance", "Comfort"])
                p_title = f"{brand.name} {adj} {cat_doc.name} - Series {i+1}"
                p_slug = f"{p_title.lower().replace(' ', '-').replace('&', 'and')}-{random.randint(1000, 9999)}"

                base_price = random.randint(49900, 4999900)
                comp_price = int(base_price * random.uniform(1.2, 1.8))
                disc = int(((comp_price - base_price) / comp_price) * 100)

                v_list = [
                    ProductVariant(
                        variant_id=f"var-gen-{product_count}-{v_i}",
                        sku=f"SKU-{brand.slug[:3].upper()}-{random.randint(1000,9999)}",
                        attributes=[VariantAttribute(name="Option", value=f"Standard Edition {v_i+1}")],
                        price_paise=base_price,
                        compare_at_price_paise=comp_price,
                        stock=random.randint(20, 180),
                        images=[ProductImage(url=random.choice(STOCK_IMAGES), is_primary=True)],
                    )
                    for v_i in range(random.randint(1, 3))
                ]

                prod = Product(
                    seller_id=seller.id,
                    category_id=cat_doc.id,
                    category_slug=cat_doc.slug,
                    brand_id=brand.id,
                    brand_name=brand.name,
                    title=p_title,
                    slug=p_slug,
                    description=f"Authentic {p_title}. Engineered for superior quality and performance, verified by top marketplace standards.",
                    short_description=f"Top rated {cat_doc.name} by {brand.name}.",
                    tags=[cat_slug, brand.slug, "popular"],
                    images=[
                        ProductImage(url=random.choice(STOCK_IMAGES), is_primary=True, display_order=1),
                        ProductImage(url=random.choice(STOCK_IMAGES), is_primary=False, display_order=2),
                    ],
                    variants=v_list,
                    specifications=[
                        ProductSpecification(group="General", name="Model Number", value=f"SV-{random.randint(1000, 9999)}"),
                        ProductSpecification(group="General", name="Warranty", value="1 Year Manufacturer Warranty"),
                        ProductSpecification(group="General", name="Country of Origin", value="India"),
                    ],
                    highlights=[
                        ProductHighlight(icon="ShieldCheck", text="100% Genuine Certified Product"),
                        ProductHighlight(icon="Truck", text="Free Express Delivery Available"),
                        ProductHighlight(icon="RefreshCw", text="7-Day Easy Return & Replacement"),
                    ],
                    base_price_paise=base_price,
                    compare_at_price_paise=comp_price,
                    discount_pct=disc,
                    total_stock=sum(v.stock for v in v_list),
                    avg_rating=round(random.uniform(4.0, 4.8), 1),
                    review_count=random.randint(20, 450),
                    view_count=random.randint(100, 5000),
                    sales_count=random.randint(10, 800),
                    is_published=True,
                    is_featured=(product_count % 4 == 0),
                    is_bestseller=(product_count % 5 == 0),
                    is_trending=(product_count % 3 == 0),
                    is_flash_deal=(product_count % 8 == 0),
                )
                await prod.insert()
                product_count += 1

    print(f"\n Successfully created {product_count} total multi-platform products across all categories!")

    print("Creating Promotional Coupons & Hero Banners...")
    coupons = [
        Coupon(
            code="WELCOME100",
            description="Flat ₹100 off on your first order above ₹499",
            discount_type=DiscountType.FIXED,
            discount_value=10000,
            min_cart_value_paise=49900,
            valid_until=now + timedelta(days=90),
            is_active=True,
        ),
        Coupon(
            code="FESTIVE20",
            description="20% Instant Discount on Electronics & Fashion up to ₹500",
            discount_type=DiscountType.PERCENTAGE,
            discount_value=20,
            min_cart_value_paise=99900,
            max_discount_paise=50000,
            valid_until=now + timedelta(days=30),
            is_active=True,
        ),
        Coupon(
            code="FREESHIP",
            description="Free delivery on all orders with zero minimum purchase",
            discount_type=DiscountType.FIXED,
            discount_value=4900,
            min_cart_value_paise=0,
            valid_until=now + timedelta(days=60),
            is_active=True,
        ),
    ]
    for cp in coupons:
        await cp.insert()

    banners = [
        Banner(
            title="The Grand Electronics & Smartphone Carnival",
            subtitle="Flagship iPhones, Galaxy S24 Ultra, MacBooks & Sony Audio at up to 60% OFF",
            image_url="https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1600&q=80",
            link_url="/products?category_slug=electronics",
            position="HERO_HOME",
            sort_order=1,
            is_active=True,
        ),
        Banner(
            title="Ajio Luxe & Trending Festive Fashion",
            subtitle="Levi's, Nike Air Force, Zara Dresses & Banarasi Silks starting at ₹499",
            image_url="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80",
            link_url="/products?category_slug=fashion",
            position="HERO_HOME",
            sort_order=2,
            is_active=True,
        ),
        Banner(
            title="Meesho Reseller Direct Wholesale Deals",
            subtitle="Zero investment. Share catalogs on WhatsApp, set your profit margin & earn daily!",
            image_url="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1600&q=80",
            link_url="/reseller",
            position="HERO_HOME",
            sort_order=3,
            is_active=True,
        ),
    ]
    for bn in banners:
        await bn.insert()

    print("\n Seed completed successfully on MongoDB Atlas!")
    print(f"Total Products seeded: {product_count}")
    print("Default Test Accounts:")
    print("  Admin    : admin@shopverse.in / Admin@ShopVerse2026")
    print("  Customer : customer@shopverse.in / Customer@1234")
    print("  Seller   : seller1@shopverse.in / Seller@1234")


if __name__ == "__main__":
    asyncio.run(seed_database())
