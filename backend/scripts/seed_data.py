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
    {"name": "Boat", "slug": "boat", "logo": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120&q=80"},
    {"name": "Philips", "slug": "philips", "logo": "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=120&q=80"},
    {"name": "Noise", "slug": "noise", "logo": "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=120&q=80"},
]

PRODUCT_TEMPLATES = {
    "electronics": [
        ("Noise Cancelling Wireless Headphones Pro", "Ultra-crisp sound with 40dB active noise cancellation and 40h battery.", 1299900, 1999900, ["Color"], ["Midnight Black", "Platinum Silver"]),
        ("Ultrabook Thin & Light 14-inch Laptop", "Intel Core i7 13th Gen, 16GB RAM, 1TB SSD, 2.8K OLED Display.", 8499900, 10999900, ["Storage", "Color"], ["512GB", "1TB"]),
        ("Smart Fitness Watch with AMOLED Display", "SpO2 monitor, Bluetooth calling, 100+ sports modes, 7-day battery.", 399900, 799900, ["Strap Color"], ["Obsidian Black", "Ocean Blue", "Forest Green"]),
        ("Professional 4K Vlogging Mirrorless Camera", "24.2MP sensor, 4K60p video, real-time eye autofocus with flip screen.", 6499900, 7499900, ["Kit"], ["Body Only", "16-50mm Lens Kit"]),
    ],
    "mobiles": [
        ("Flagship Ultra 5G Smartphone (12GB RAM)", "Snapdragon 8 Gen 3, 200MP Quad Camera, 120Hz Dynamic AMOLED.", 7999900, 9499900, ["Color", "Storage"], ["Phantom Black (256GB)", "Titanium Gray (512GB)"]),
        ("Fast 20000mAh Power Bank (65W Quick Charge)", "Triple output ports, charges laptops and phones at lightning speed.", 249900, 449900, ["Color"], ["Matte Black", "Space Gray"]),
        ("MagSafe Compatible Military Grade Armor Case", "Drop-tested up to 10 feet with shock-absorbing corner bumpers.", 89900, 199900, ["Color"], ["Clear Frosted", "Smoke Black"]),
        ("65W GaN Dual-Port Fast Charger", "Compact gallium nitride wall charger for iPhone, Samsung, and MacBook.", 149900, 299900, ["Color"], ["White", "Black"]),
    ],
    "fashion": [
        ("Men's Premium Oxford Cotton Casual Shirt", "Tailored fit, breathable 100% long-staple cotton for all-day comfort.", 149900, 299900, ["Size", "Color"], ["M / Navy Blue", "L / Crisp White", "XL / Sage Green"]),
        ("Women's Handcrafted Silk Blend Anarkali Kurta Set", "Intricate embroidery with dupatta and matching trousers.", 299900, 699900, ["Size", "Color"], ["S / Ruby Red", "M / Emerald Green", "L / Royal Blue"]),
        ("Men's Slim Fit Stretchable Denim Jeans", "Classic 5-pocket styling with flexible stretch denim fabric.", 189900, 349900, ["Waist Size"], ["30", "32", "34", "36"]),
        ("Women's Floral Print Summer Maxi Dress", "Lightweight flowy chiffon dress with adjustable belt.", 169900, 329900, ["Size"], ["XS", "S", "M", "L"]),
    ],
    "footwear": [
        ("Men's Lightweight Cloudfoam Running Shoes", "Responsive cushioning with breathable mesh upper for marathon comfort.", 249900, 499900, ["Size"], ["UK 7", "UK 8", "UK 9", "UK 10"]),
        ("Classic High-Top Retro Streetwear Sneakers", "Durable canvas build with vulcanized rubber grip sole.", 219900, 399900, ["Size", "Color"], ["UK 8 / Vintage White", "UK 9 / Classic Black"]),
        ("Handcrafted Italian Leather Oxford Formal Shoes", "Genuine full-grain leather with cushioned inner sole.", 399900, 799900, ["Size", "Color"], ["UK 7 / Tan", "UK 8 / Dark Brown", "UK 9 / Jet Black"]),
    ],
    "home-kitchen": [
        ("Non-Stick Die-Cast Granito Cookware Set (3 Pcs)", "Induction friendly frying pan, kadhai with glass lid, and dosa tawa.", 249900, 599900, ["Color"], ["Granite Grey", "Ruby Red"]),
        ("Instant Vortex 6-in-1 Digital Air Fryer (5.7L)", "EvenCrisp technology for healthy oil-free crispy cooking.", 699900, 1199900, ["Color"], ["Piano Black"]),
        ("100% Egyptian Cotton 400TC Queen Bedding Set", "Includes fitted sheet, flat sheet, and 2 luxury pillowcases.", 199900, 449900, ["Color"], ["Charcoal Grey", "Ivory White", "Powder Blue"]),
    ],
    "beauty": [
        ("Vitamin C 10% Radiance Glow Face Serum (30ml)", "Enriched with Hyaluronic Acid and Ferulic Acid for bright skin.", 59900, 99900, ["Size"], ["30ml", "50ml"]),
        ("Deep Hydration Moroccan Argan Oil Hair Mask", "Intensive nourishing hair therapy for frizz-free silky hair.", 69900, 129900, ["Size"], ["200g"]),
        ("Luxury Eau De Parfum Woody & Citrus (100ml)", "Long-lasting fragrance notes of Bergamot, Amber, and Vetiver.", 189900, 349900, ["Volume"], ["100ml"]),
    ],
    "sports-fitness": [
        ("Adjustable Quick-Select Dumbbell Set (2.5 - 24kg)", "Space-saving compact home gym selector dumbbells.", 1499900, 2499900, ["Weight"], ["24kg Single", "24kg Pair"]),
        ("Eco-Friendly Non-Slip TPE Yoga Mat (6mm)", "Extra cushioning with dual-texture grip and carry strap.", 89900, 189900, ["Color"], ["Dual Tone Teal/Grey", "Purple/Pink"]),
        ("100% Whey Protein Isolate Powder (2kg)", "27g protein per scoop with zero added sugar and digestive enzymes.", 489900, 699900, ["Flavor"], ["Rich Chocolate Fudge", "Vanilla Bean", "Cafe Mocha"]),
    ],
    "books-stationery": [
        ("Atomic Habits by James Clear (Hardcover Edition)", "The proven framework for improving every day.", 49900, 89900, ["Format"], ["Hardcover", "Paperback"]),
        ("Psychology of Money by Morgan Housel", "Timeless lessons on wealth, greed, and happiness.", 34900, 59900, ["Format"], ["Paperback"]),
        ("Premium Leatherbound Bullet Journal Dot Grid Notebook", "160 GSM bleed-proof bamboo paper with bookmark ribbon.", 69900, 129900, ["Color"], ["Emerald Green", "Midnight Blue"]),
    ],
    "toys-baby": [
        ("STEM Programmable Robotics Kit for Kids", "Build & code 10 different interactive robots with app control.", 299900, 549900, ["Edition"], ["Starter Kit", "Advanced Kit"]),
        ("Premium Lightweight Compact Folding Baby Stroller", "One-hand fold with multi-position reclining seat and sun canopy.", 649900, 1199900, ["Color"], ["Jet Black", "Heather Grey"]),
    ],
    "groceries": [
        ("California Whole Raw Almonds Jumbo Size (1kg)", "Vacuum-packed premium crispy nuts rich in Vitamin E & protein.", 89900, 139900, ["Weight"], ["500g", "1kg"]),
        ("Single Origin Organic Arabica Dark Roast Coffee Beans (500g)", "Notes of dark cocoa, roasted hazelnut, and caramel finish.", 64900, 99900, ["Grind"], ["Whole Bean", "Fine Espresso Grind", "Coarse French Press"]),
    ],
}

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
    print("Connecting to MongoDB for seeding...")
    motor_client = AsyncIOMotorClient(settings.MONGODB_URI)
    db = motor_client[settings.MONGODB_DB_NAME]

    document_models = [
        User, SellerProfile, Address, Category, Brand, Product,
        Cart, Order, PaymentTransaction, Review, Wishlist, Coupon,
        Banner, InAppNotification, SellerPayout, AuditLog, SearchLog,
        RecentlyViewed, OtpCode,
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
        wallet_balance_paise=25000, # ₹250
        loyalty_points=450,
        referral_code="AARAV100",
        is_active=True,
        is_verified=True,
    )
    await demo_customer.insert()

    # Create 5 realistic Verified Sellers
    seller_users = []
    seller_profiles = []
    seller_names = [
        ("TechHub Retailers", "seller1@shopverse.in", "+919876543221"),
        ("Urban Threads Apparel", "seller2@shopverse.in", "+919876543222"),
        ("Kavita Crafts & Home", "seller3@shopverse.in", "+919876543223"),
        ("Glow & Radiance Beauty", "seller4@shopverse.in", "+919876543224"),
        ("ProFit Sporting Goods", "seller5@shopverse.in", "+919876543225"),
    ]

    for name, email, phone in seller_names:
        u = User(
            email=email,
            phone=phone,
            hashed_password=get_password_hash("Seller@1234"),
            full_name=f"{name} Rep",
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
            store_slug=name.lower().replace(" ", "-").replace("&", "and"),
            status=SellerStatus.APPROVED,
            gst_number="27AABCU9603R1ZN",
            pan_number="AABCU9603R",
            bank_details=BankDetails(
                account_holder_name=name,
                account_number="987654321098",
                ifsc_code="HDFC0001234",
                bank_name="HDFC Bank",
                upi_id=f"{name.lower().replace(' ', '')}@hdfcbank",
            ),
            commission_rate_pct=8.0,
            lifetime_earnings_paise=15000000, # ₹1.5L
            avg_seller_rating=4.7,
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
    created_brands = []
    for b in BRANDS_DATA:
        brand = Brand(
            name=b["name"],
            slug=b["slug"],
            logo_url=b["logo"],
            is_featured=True,
        )
        await brand.insert()
        created_brands.append(brand)

    print("Generating 200+ Products across 10 categories...")
    product_count = 0
    now = datetime.now(timezone.utc)

    for cat_key, templates in PRODUCT_TEMPLATES.items():
        root_cat = created_categories.get(cat_key)
        sub_cats = [c for c in created_categories.values() if c.parent_id == root_cat.id]

        # Generate 20+ variations per category to exceed 200 items
        for i in range(22):
            base_template = random.choice(templates)
            title_prefix = random.choice(["Premium", "Ultra", "Elite", "Classic", "Smart", "Compact", "Pro", "Deluxe"])
            title = f"{title_prefix} {base_template[0]} - Gen {i+1}"
            slug = f"{title.lower().replace(' ', '-').replace('&', 'and').replace('/', '-')}-{random.randint(1000, 9999)}"
            
            chosen_brand = random.choice(created_brands)
            chosen_seller = random.choice(seller_profiles)
            chosen_sub = random.choice(sub_cats) if sub_cats else root_cat

            base_price = base_template[2] + random.randint(-50000, 50000)
            base_price = max(base_price, 29900)
            compare_price = int(base_price * random.uniform(1.2, 1.6))
            discount = int(((compare_price - base_price) / compare_price) * 100)

            # Build variants
            variant_list = []
            options = base_template[4]
            values = base_template[5]
            for v_idx, val in enumerate(values):
                v_price = base_price + (v_idx * 50000)
                v_compare = int(v_price * 1.3)
                variant_list.append(
                    ProductVariant(
                        variant_id=f"var-{i}-{v_idx}",
                        sku=f"SKU-{slug[:8].upper()}-{v_idx+1}",
                        attributes=[VariantAttribute(name=options[0], value=val)],
                        price_paise=v_price,
                        compare_at_price_paise=v_compare,
                        stock=random.randint(10, 150),
                        images=[ProductImage(url=random.choice(STOCK_IMAGES), is_primary=v_idx==0)],
                    )
                )

            is_flash = (product_count % 7 == 0)
            product = Product(
                seller_id=chosen_seller.id,
                category_id=chosen_sub.id,
                category_slug=chosen_sub.slug,
                brand_id=chosen_brand.id,
                brand_name=chosen_brand.name,
                title=title,
                slug=slug,
                description=base_template[1] + f" Designed with precision for reliable daily performance. Includes 1-year official brand warranty.",
                short_description=base_template[1],
                tags=[cat_key, chosen_brand.slug, "bestseller" if i % 3 == 0 else "trending"],
                images=[
                    ProductImage(url=random.choice(STOCK_IMAGES), is_primary=True, display_order=1),
                    ProductImage(url=random.choice(STOCK_IMAGES), is_primary=False, display_order=2),
                ],
                variants=variant_list,
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
                compare_at_price_paise=compare_price,
                discount_pct=discount,
                total_stock=sum(v.stock for v in variant_list),
                avg_rating=round(random.uniform(4.0, 4.9), 1),
                review_count=random.randint(15, 340),
                view_count=random.randint(120, 4500),
                sales_count=random.randint(10, 890),
                is_published=True,
                is_featured=(product_count % 5 == 0),
                is_bestseller=(product_count % 4 == 0),
                is_trending=(product_count % 6 == 0),
                is_flash_deal=is_flash,
                flash_deal_end_at=now + timedelta(hours=18) if is_flash else None,
            )
            await product.insert()
            product_count += 1

    print(f"Successfully created {product_count} products.")

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
            title="The Grand Electronics Sale",
            subtitle="Up to 60% Off on Premium Headphones, Smartwatches & Laptops",
            image_url="https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1600&q=80",
            link_url="/products?category_slug=electronics",
            position="HERO_HOME",
            sort_order=1,
            is_active=True,
        ),
        Banner(
            title="Trending Autumn & Festive Fashion",
            subtitle="Ethnic & Western collections starting at just ₹499",
            image_url="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80",
            link_url="/products?category_slug=fashion",
            position="HERO_HOME",
            sort_order=2,
            is_active=True,
        ),
        Banner(
            title="Mega Kitchen & Smart Living Deals",
            subtitle="Upgrade your home with modern cookware and digital appliances",
            image_url="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1600&q=80",
            link_url="/products?category_slug=home-kitchen",
            position="HERO_HOME",
            sort_order=3,
            is_active=True,
        ),
    ]
    for bn in banners:
        await bn.insert()

    print("\n Seed completed successfully!")
    print(f"Total Products seeded: {product_count}")
    print("Default Test Accounts:")
    print("  Admin    : admin@shopverse.in / Admin@ShopVerse2026")
    print("  Customer : customer@shopverse.in / Customer@1234")
    print("  Seller   : seller1@shopverse.in / Seller@1234")


if __name__ == "__main__":
    asyncio.run(seed_database())
