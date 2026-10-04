# 🛒 ShopVerse - Enterprise Multi-Vendor E-Commerce Platform

[![CI/CD Pipeline](https://github.com/Sachinkannan127/E-commerce/actions/workflows/ci.yml/badge.svg)](https://github.com/Sachinkannan127/E-commerce/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11+](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248.svg)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-7.0-DC382D.svg)](https://redis.io/)

**ShopVerse** is a full-stack, enterprise-grade, multi-vendor e-commerce platform inspired by the best features of **Amazon**, **Flipkart**, and **Meesho**. It comes with end-to-end multi-vendor selling, social reselling with custom margins, daily gamification rewards, real-time faceted search, atomic inventory reservation, and a high-performance admin control tower.

---

## 🌟 Key Features

### 🛍️ Customer Experience (Amazon / Flipkart Inspired)
* **Real-Time Faceted Search & Autocomplete**: Debounced search suggest, trending queries, category hierarchy filters, price range sliders, brand checkboxes, and customer review star filters.
* **Interactive Product Detail (PDP)**: Magnifying glass image zoom lens, interactive variant selector (colors, sizes, storage, RAM) with dynamic stock/price updates, Indian PIN code delivery checker, and mobile sticky buy bar.
* **Frequently Bought Together**: Bundle companion recommendations with 5% extra bundle discounts and 1-click multi-item cart addition.
* **Side-by-Side Product Comparison (`/compare`)**: Side-by-side spec diff matrix for up to 4 items with difference highlighting and floating tray.
* **3-Step Frictionless Checkout (`/checkout`)**: Saved addresses, order breakdown, dynamic coupon application (`WELCOME100`, `FESTIVE20`, `FREESHIP`), wallet payment, UPI, Cards, and COD options.
* **PDF Tax Invoice Generator**: Downloadable GST-compliant PDF invoice generated via ReportLab (`/api/v1/orders/{id}/invoice`).
* **Customer Account Portal (`/account`)**: Order timeline tracking, 1-click return/cancellation requests, wishlist, address book, and wallet management.

### 📱 Meesho-Style Social Reselling (`/reseller`)
* **Zero-Investment Reselling**: Users can select wholesale products from the catalog, set their custom profit margin, and generate shareable catalogs.
* **1-Click WhatsApp Pitch Generator**: Formatted WhatsApp pitch with product photo, wholesale discount callouts, and customer direct order prompt.
* **Customer Order on Behalf**: Place orders for contacts with customer delivery address and COD option; profit margin automatically credited on fulfillment.
* **Instant Wallet Cashout**: Transfer available margin earnings directly to the user's ShopVerse Wallet.

### 🎡 Daily Gamification (`/spin-and-win`)
* **Interactive 8-Segment Lucky Wheel**: Animated SVG wheel awarding instant wallet cash (₹100), discount coupons (₹50 OFF, ₹200 Mega OFF, 10% OFF, Free Delivery), and loyalty gems.
* **24-Hour Cooldown & Fair Play**: Server-enforced once-a-day spin limit with live countdown timer and celebratory `canvas-confetti` animations.

### 🏬 Multi-Vendor Seller Portal (`/seller`)
* **KYC Onboarding (`/seller/onboarding`)**: GSTIN, PAN, Bank Details, and Warehouse address verification.
* **Seller Executive Dashboard (`/seller/dashboard`)**: Real-time sales metrics, pending payouts, and low stock inventory alerts.
* **Product CRUD & Multi-Variant Generator (`/seller/products/new`)**: Attributes matrix generator, image uploads, and highlights.
* **Order Fulfillment Workflow (`/seller/orders`)**: Pack -> Ship with tracking number -> Mark Delivered.
* **Payouts Ledger (`/seller/payouts`)**: Automated 8% platform fee commission deduction with transparent payout request ledger.

### 🏛️ Admin Control Tower (`/admin`)
* **Executive Metrics**: Platform Gross Merchandise Value (GMV), net commission fee earnings, and active sellers.
* **KYC Moderation Queue (`/admin/sellers`)**: One-click approval, rejection, or suspension of seller stores.
* **Catalog Moderation (`/admin/products`)**: Instant publish/unpublish toggle across multi-vendor listings.
* **Coupons Studio (`/admin/coupons`)**: Create promo codes with percentage or flat discounts, usage caps, and minimum order values.
* **Financial CSV Exporter (`/admin/reports`)**: Streaming financial audit CSV export for accounting and reconciliation.

---

## 🛠️ Architecture & Tech Stack

```
                                  ┌────────────────────────┐
                                  │      Client Device     │
                                  │ (Desktop/Mobile Web/PWA│
                                  └───────────┬────────────┘
                                              │
                                              ▼
                                  ┌────────────────────────┐
                                  │   Next.js 14 Frontend  │
                                  │  (App Router, SSR, TS) │
                                  └───────────┬────────────┘
                                              │ HTTP / JSON
                                              ▼
                                  ┌────────────────────────┐
                                  │  FastAPI Backend Core  │
                                  │ (Async Python 3.11+)   │
                                  └─────┬────────────┬─────┘
                                        │            │
                     ┌──────────────────┴─┐        ┌─┴──────────────────┐
                     ▼                    ▼        ▼                    ▼
             ┌───────────────┐    ┌─────────────┐ ┌───────────────┐ ┌───────────────┐
             │ MongoDB 7.0   │    │  Redis 7.0  │ │ Celery Worker │ │ Payment Gateways│
             │ (Beanie ODM)  │    │  (Cache/TTL)│ │ (Async Tasks) │ │(Stripe/Razorpay)│
             └───────────────┘    └─────────────┘ └───────────────┘ └───────────────┘
```

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, TanStack Query, Zustand, Lucide Icons |
| **Backend** | Python 3.11+, FastAPI, Pydantic v2, Beanie ODM (Motor async MongoDB driver), Passlib/bcrypt, ReportLab |
| **Database** | MongoDB 7.0 (Text search indexes, TTL indexes, Unique compound constraints) |
| **Cache & Tasks**| Redis 7.0, Celery background worker |
| **DevOps** | Docker, Docker Compose, GitHub Actions CI/CD |

---

## 🚀 Quick Start (Docker Compose)

The entire ShopVerse platform (MongoDB, Redis, FastAPI Backend, Celery Worker, and Next.js Frontend) can be started with a single command:

```bash
# 1. Clone the repository
git clone https://github.com/Sachinkannan127/E-commerce.git
cd E-commerce

# 2. Configure environment variables
cp .env.example .env

# 3. Spin up all 5 containers
docker compose up --build -d
```

### 🌐 Service Endpoints
* **Storefront Web App**: [http://localhost:3000](http://localhost:3000)
* **Backend REST API**: [http://localhost:8000](http://localhost:8000)
* **Interactive Swagger Docs**: [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs)
* **ReDoc Documentation**: [http://localhost:8000/api/v1/redoc](http://localhost:8000/api/v1/redoc)

---

## 🔑 Demo Accounts & Credentials

Run the database seed script to populate 220+ products across 10 categories, 5 seller stores, and demo accounts:

```bash
# Execute seed script inside backend container
docker compose exec backend python scripts/seed_data.py
```

| Role | Email | Password | Access Area |
|---|---|---|---|
| **Admin** | `admin@shopverse.in` | `Admin@123` | Control Tower (`/admin/dashboard`) |
| **Seller** | `seller1@shopverse.in` | `Seller@123` | Seller Portal (`/seller/dashboard`) |
| **Customer** | `customer@shopverse.in` | `Customer@123` | Shop, Cart, Reseller & Account |

---

## 🧪 Running Automated Tests

```bash
# Run pytest async test suite inside backend container
docker compose exec backend pytest -v

# Or run locally (with local Python virtual environment)
cd backend
pytest
```

---

## 📜 Active Promo Coupons

| Promo Code | Discount Type | Min Order | Usage |
|---|---|---|---|
| `WELCOME100` | Flat ₹100 OFF | ₹499 | New customer first purchase |
| `FESTIVE20` | 20% Instant OFF (Max ₹500) | ₹999 | Festive carnival sale |
| `FREESHIP` | 100% Free Shipping | ₹0 | Zero delivery fee |

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
