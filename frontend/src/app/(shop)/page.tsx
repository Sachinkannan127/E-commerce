"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Zap,
  ArrowRight,
  ShieldCheck,
  Flame,
  Tag,
  Clock,
  Sparkles,
  Award,
  CreditCard,
  Gift,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  TrendingUp,
  Percent,
  Truck,
  RotateCcw,
  Star,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { fetchProducts } from "@/services/catalog";
import { ProductSummary } from "@/types/product";
import { ProductCard } from "@/components/product/product-card";
import { Skeleton } from "@/components/ui/skeleton";

// 1. FLIPKART BIG HERO BANNERS
const HERO_SLIDES = [
  {
    id: 1,
    badge: "Big Billion Days Carnival",
    pill: "Flat 20% Off Code: FESTIVE20",
    title: "Flagship Smartphones & Gadgets",
    subtitle: "iPhone 15 Pro Max & Galaxy S24 Ultra",
    desc: "Starting at ₹2,499/mo No Cost EMI + Instant ₹10,000 Bank Cashback & 1-Year Free Screen Replacement.",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900&q=80",
    categorySlug: "mobiles",
    cta: "Shop Flagships Now",
    gradient: "from-blue-950 via-indigo-900 to-slate-950",
  },
  {
    id: 2,
    badge: "Ajio & Flipkart Style Fest",
    pill: "50% - 80% Off",
    title: "Trending Runway Fashion & Sneakers",
    subtitle: "Nike, Puma, Zara & Tommy Hilfiger",
    desc: "Step up your seasonal wardrobe with premium streetwear, ethnic couture, and verified original kicks.",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=900&q=80",
    categorySlug: "fashion",
    cta: "Explore Fashion Deals",
    gradient: "from-purple-950 via-fuchsia-950 to-slate-950",
  },
  {
    id: 3,
    badge: "Smart Living Revolution",
    pill: "Flat ₹5,000 Instant Off",
    title: "Dyson & Smart Home Appliances",
    subtitle: "Cordless V12, Air Purifiers & Kitchen",
    desc: "Upgrade your living space with intelligent acoustic suction, smart air purifiers, and automated kitchenware.",
    image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=900&q=80",
    categorySlug: "home-kitchen",
    cta: "Claim Smart Home Offers",
    gradient: "from-teal-950 via-slate-900 to-cyan-950",
  },
  {
    id: 4,
    badge: "Audio & Entertainment Fest",
    pill: "Starting at ₹799",
    title: "Sony & boAt Spatial Bass Fest",
    subtitle: "Dolby Atmos Soundbars & ANC Earbuds",
    desc: "Active noise cancellation wireless earbuds with up to 60h playback and free 1-year extended warranty.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&q=80",
    categorySlug: "electronics",
    cta: "Grab Audio Deals",
    gradient: "from-rose-950 via-zinc-900 to-black",
  },
];

// 2. FLIPKART SIGNATURE 4-IN-1 QUADRANT CARDS
const QUADRANT_SECTIONS = [
  {
    title: "Best of Electronics",
    viewAllHref: "/products?category_slug=electronics",
    items: [
      { name: "Smartwatches", offer: "From ₹999", img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80", slug: "electronics" },
      { name: "Wireless Audio", offer: "Min 50% Off", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80", slug: "electronics" },
      { name: "Fast Chargers", offer: "From ₹299", img: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=300&q=80", slug: "mobiles" },
      { name: "DSLR & Cameras", offer: "Up to ₹15,000 Off", img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&q=80", slug: "electronics" },
    ],
  },
  {
    title: "Top Deals on Fashion",
    viewAllHref: "/products?category_slug=fashion",
    items: [
      { name: "Running Shoes", offer: "Min 40% Off", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80", slug: "footwear" },
      { name: "Men's Graphic Tees", offer: "Under ₹499", img: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300&q=80", slug: "fashion" },
      { name: "Women's Ethnic", offer: "50-70% Off", img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300&q=80", slug: "fashion" },
      { name: "Casual Sneakers", offer: "From ₹799", img: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=300&q=80", slug: "footwear" },
    ],
  },
  {
    title: "Home & Kitchen Essentials",
    viewAllHref: "/products?category_slug=home-kitchen",
    items: [
      { name: "Cookware Sets", offer: "From ₹499", img: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=300&q=80", slug: "home-kitchen" },
      { name: "Smart Vacuums", offer: "Up to 40% Off", img: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=300&q=80", slug: "home-kitchen" },
      { name: "Home Decor Lamps", offer: "Under ₹399", img: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=300&q=80", slug: "home-kitchen" },
      { name: "Air Purifiers", offer: "Flat ₹3,000 Off", img: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=300&q=80", slug: "home-kitchen" },
    ],
  },
  {
    title: "Beauty, Food & More",
    viewAllHref: "/products?category_slug=beauty",
    items: [
      { name: "Skincare Serums", offer: "Buy 1 Get 1", img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&q=80", slug: "beauty" },
      { name: "Artisanal Coffee", offer: "From ₹349", img: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&q=80", slug: "groceries" },
      { name: "Luxury Perfumes", offer: "Min 35% Off", img: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=300&q=80", slug: "beauty" },
      { name: "Gym Supplements", offer: "Up to 50% Off", img: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300&q=80", slug: "sports-fitness" },
    ],
  },
];

// 3. FLIPKART BANK CASHBACK STRIP
const BANK_OFFERS = [
  { bank: "Axis Bank", offer: "5% Unlimited Cashback", sub: "On Flipkart & ShopVerse Axis Card", color: "from-rose-600 to-red-800" },
  { bank: "HDFC Bank", offer: "10% Instant Discount", sub: "Up to ₹1,500 on Credit & EMI", color: "from-blue-600 to-indigo-800" },
  { bank: "ICICI Bank", offer: "Flat ₹2,000 Off", sub: "On Laptops, Phones & TVs", color: "from-amber-600 to-orange-700" },
  { bank: "UPI / Paytm", offer: "Assured ₹100 Cashback", sub: "On orders above ₹999", color: "from-emerald-600 to-teal-800" },
];

export default function StoreHomePage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [electronicsProducts, setElectronicsProducts] = useState<ProductSummary[]>([]);
  const [fashionProducts, setFashionProducts] = useState<ProductSummary[]>([]);
  const [suggestedProducts, setSuggestedProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Auto rotate hero slides every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Fetch live products for Flipkart product carousels
  useEffect(() => {
    async function loadCatalog() {
      try {
        const [elecRes, fashRes, sugRes] = await Promise.all([
          fetchProducts({ category_slug: "electronics", limit: 6 }),
          fetchProducts({ category_slug: "fashion", limit: 6 }),
          fetchProducts({ limit: 12, sort: "relevance" }),
        ]);
        setElectronicsProducts(elecRes.items || []);
        setFashionProducts(fashRes.items || []);
        setSuggestedProducts(sugRes.items || []);
      } catch (err) {
        console.error("Failed to load home products:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCatalog();
  }, []);

  const currentSlide = HERO_SLIDES[activeSlide];

  return (
    <div className="space-y-6 pb-20 bg-muted/20">
      {/* 1. FLIPKART WIDESCREEN HERO BANNER SLIDER */}
      <section className="container pt-3">
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${currentSlide.gradient} text-white shadow-2xl p-6 sm:p-10 md:p-12 transition-all duration-700`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 min-h-[340px]">
            <div className="relative z-10 max-w-xl space-y-4 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <Badge className="bg-amber-400 text-slate-950 font-black text-xs px-3 py-1 animate-pulse">
                  {currentSlide.badge}
                </Badge>
                <Badge variant="outline" className="border-white/40 text-white font-bold text-xs">
                  {currentSlide.pill}
                </Badge>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                {currentSlide.title}
              </h1>

              <p className="text-sm font-bold text-amber-300">
                {currentSlide.subtitle}
              </p>

              <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                {currentSlide.desc}
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                <Link href={`/products?category_slug=${currentSlide.categorySlug}`}>
                  <Button size="lg" className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-full px-8 gap-2 shadow-xl shadow-amber-500/20">
                    {currentSlide.cta} <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/spin-and-win">
                  <Button size="lg" variant="outline" className="border-amber-300 text-amber-300 hover:bg-amber-400/10 rounded-full font-bold">
                    🎁 Daily SuperCoins Spin
                  </Button>
                </Link>
              </div>
            </div>

            {/* Visual Slide Image Card */}
            <div className="relative w-full max-w-xs sm:max-w-sm aspect-square rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 flex-shrink-0">
              <Image
                src={currentSlide.image}
                alt={currentSlide.title}
                fill
                priority
                className="object-cover transition-all duration-500 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4 text-white">
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">Big Billion Fest • Verified Partner</span>
                <p className="text-xs font-semibold">{currentSlide.subtitle}</p>
              </div>
            </div>
          </div>

          {/* Slider Prev / Next Controls */}
          <div className="absolute inset-y-0 left-2 sm:left-4 flex items-center">
            <button
              onClick={() => setActiveSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
              className="h-10 w-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm transition-colors"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          </div>
          <div className="absolute inset-y-0 right-2 sm:right-4 flex items-center">
            <button
              onClick={() => setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
              className="h-10 w-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm transition-colors"
              aria-label="Next Slide"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* Pill Indicators */}
          <div className="flex items-center justify-center gap-2 pt-6">
            {HERO_SLIDES.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setActiveSlide(idx)}
                className={`h-2.5 rounded-full transition-all ${
                  activeSlide === idx ? "w-8 bg-amber-400" : "w-2.5 bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 2. FLIPKART SIGNATURE "BEST OF ELECTRONICS" DEAL CAROUSEL */}
      <section className="container">
        <div className="flex flex-col lg:flex-row gap-4 p-4 rounded-3xl bg-card border shadow-xs">
          {/* Left Promo Card */}
          <div className="lg:w-64 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-700 to-blue-800 text-white p-6 flex flex-col justify-between items-center text-center space-y-4 flex-shrink-0">
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-300">Mega Savings</span>
              <h2 className="text-2xl font-black">Best of Electronics</h2>
              <p className="text-xs text-blue-100">Top Rated Audio, Smartwatches & Laptops</p>
            </div>
            <Link href="/products?category_slug=electronics" className="w-full">
              <Button size="sm" className="w-full font-bold bg-white text-blue-700 hover:bg-blue-50 rounded-xl shadow-md">
                VIEW ALL
              </Button>
            </Link>
          </div>

          {/* Horizontal Product Scroller */}
          <div className="flex-1 overflow-x-auto no-scrollbar py-1">
            <div className="flex items-stretch gap-3 min-w-max">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="w-48 p-3 rounded-2xl border space-y-3">
                      <Skeleton className="aspect-square w-full rounded-xl" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))
                : electronicsProducts.map((p) => (
                    <Link
                      key={p.id}
                      href={`/products/${p.slug}`}
                      className="group w-48 p-3 rounded-2xl border bg-card hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between text-center space-y-2"
                    >
                      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-muted">
                        <Image
                          src={p.thumbnail_url || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80"}
                          alt={p.name}
                          fill
                          sizes="180px"
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                        {p.discount_pct > 0 && (
                          <Badge variant="deal" className="absolute top-2 left-2 text-[10px]">
                            {p.discount_pct}% OFF
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="font-semibold text-xs text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                          {p.name}
                        </h4>
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block">
                          ₹{(p.price_paise / 100).toLocaleString("en-IN")}
                        </span>
                        <span className="text-[10px] text-muted-foreground line-through">
                          ₹{(p.compare_at_price_paise / 100).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </Link>
                  ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. FLIPKART 4-IN-1 QUADRANT MULTI-DEAL BOXES */}
      <section className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {QUADRANT_SECTIONS.map((sec, idx) => (
            <Card key={idx} className="p-4 rounded-3xl border shadow-xs space-y-3 flex flex-col justify-between">
              <div className="flex items-center justify-between pb-1 border-b">
                <h3 className="font-bold text-sm text-foreground">{sec.title}</h3>
                <Link href={sec.viewAllHref} className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              {/* 2x2 Grid of items */}
              <div className="grid grid-cols-2 gap-2.5">
                {sec.items.map((item, i) => (
                  <Link
                    key={i}
                    href={`/products?category_slug=${item.slug}`}
                    className="group block p-2 rounded-xl border border-border/50 hover:border-primary/40 bg-muted/20 hover:bg-card transition-all text-center space-y-1"
                  >
                    <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-muted">
                      <Image
                        src={item.img}
                        alt={item.name}
                        fill
                        sizes="100px"
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <h4 className="text-[11px] font-semibold line-clamp-1">{item.name}</h4>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block">
                      {item.offer}
                    </span>
                  </Link>
                ))}
              </div>

              <Link href={sec.viewAllHref}>
                <Button size="sm" variant="ghost" className="w-full text-xs font-bold text-primary hover:bg-primary/10 rounded-xl">
                  Explore More Deals
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      {/* 4. BANK & INSTANT PAYMENT DISCOUNTS RIBBON */}
      <section className="container">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {BANK_OFFERS.map((b, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl bg-gradient-to-br ${b.color} text-white shadow-md flex items-center justify-between gap-3`}
            >
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-white/80">{b.bank}</span>
                <h4 className="text-xs font-bold">{b.offer}</h4>
                <p className="text-[10px] text-white/90">{b.sub}</p>
              </div>
              <Percent className="h-6 w-6 text-white/40 flex-shrink-0" />
            </div>
          ))}
        </div>
      </section>

      {/* 5. FLIPKART "TOP DEALS ON FASHION" HORIZONTAL PRODUCT CAROUSEL */}
      <section className="container">
        <div className="flex flex-col lg:flex-row gap-4 p-4 rounded-3xl bg-card border shadow-xs">
          {/* Left Promo Card */}
          <div className="lg:w-64 rounded-2xl bg-gradient-to-br from-fuchsia-700 via-purple-800 to-indigo-900 text-white p-6 flex flex-col justify-between items-center text-center space-y-4 flex-shrink-0">
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-300">Ajio Style Week</span>
              <h2 className="text-2xl font-black">Top Deals on Fashion</h2>
              <p className="text-xs text-purple-100">Handpicked Sneakers, Kurtis & Streetwear</p>
            </div>
            <Link href="/products?category_slug=fashion" className="w-full">
              <Button size="sm" className="w-full font-bold bg-white text-purple-800 hover:bg-purple-50 rounded-xl shadow-md">
                VIEW ALL
              </Button>
            </Link>
          </div>

          {/* Horizontal Product Scroller */}
          <div className="flex-1 overflow-x-auto no-scrollbar py-1">
            <div className="flex items-stretch gap-3 min-w-max">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="w-48 p-3 rounded-2xl border space-y-3">
                      <Skeleton className="aspect-square w-full rounded-xl" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))
                : fashionProducts.map((p) => (
                    <Link
                      key={p.id}
                      href={`/products/${p.slug}`}
                      className="group w-48 p-3 rounded-2xl border bg-card hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between text-center space-y-2"
                    >
                      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-muted">
                        <Image
                          src={p.thumbnail_url || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80"}
                          alt={p.name}
                          fill
                          sizes="180px"
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                        {p.discount_pct > 0 && (
                          <Badge variant="deal" className="absolute top-2 left-2 text-[10px]">
                            {p.discount_pct}% OFF
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="font-semibold text-xs text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                          {p.name}
                        </h4>
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block">
                          ₹{(p.price_paise / 100).toLocaleString("en-IN")}
                        </span>
                        <span className="text-[10px] text-muted-foreground line-through">
                          ₹{(p.compare_at_price_paise / 100).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </Link>
                  ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. SUGGESTED FOR YOU / TRENDING NOW LIVE MARKETPLACE CATALOG */}
      <section className="container space-y-4 pt-4">
        <div className="flex items-center justify-between pb-2 border-b">
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">Suggested for You</h2>
            <p className="text-xs text-muted-foreground">Based on your activity & trending customer orders</p>
          </div>
          <Link href="/products" className="text-xs sm:text-sm font-bold text-primary hover:underline flex items-center gap-1">
            Explore All 500+ Items <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="p-3.5 rounded-2xl border bg-card space-y-3">
                <Skeleton className="aspect-square w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {suggestedProducts.map((p) => (
              <ProductCard key={p.id} product={p} viewMode="grid" />
            ))}
          </div>
        )}
      </section>

      {/* 7. MEESHO-STYLE RESELLER OPPORTUNITY BANNER */}
      <section className="container pt-4">
        <div className="rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 text-white p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-emerald-700/30">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <Badge className="bg-emerald-400 text-slate-950 font-bold text-xs">
              Meesho-Style Reseller Hub
            </Badge>
            <h3 className="text-2xl sm:text-3xl font-black">
              Earn ₹25,000+ / Month with Zero Investment
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
              Add your custom profit margin on 500+ wholesale catalogs, share directly on WhatsApp & Instagram, and let verified suppliers fulfill the orders automatically.
            </p>
          </div>
          <div>
            <Link href="/reseller">
              <Button size="lg" className="bg-emerald-400 hover:bg-emerald-500 text-slate-950 font-black rounded-2xl px-8 shadow-lg">
                Start Reselling Now <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 8. FLIPKART TRUST & CUSTOMER ASSURANCE RIBBON */}
      <section className="container pt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-3xl bg-card border shadow-xs text-center">
          <div className="flex flex-col items-center space-y-1 p-2">
            <div className="h-12 w-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-1">
              <Truck className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-xs text-foreground">Express Pan-India Delivery</h4>
            <p className="text-[11px] text-muted-foreground">Free shipping on orders above ₹499</p>
          </div>

          <div className="flex flex-col items-center space-y-1 p-2">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-1">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-xs text-foreground">100% Genuine Certified</h4>
            <p className="text-[11px] text-muted-foreground">Directly sourced from verified brand sellers</p>
          </div>

          <div className="flex flex-col items-center space-y-1 p-2">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-1">
              <RotateCcw className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-xs text-foreground">7-Day Easy Replacement</h4>
            <p className="text-[11px] text-muted-foreground">Hassle-free doorstep returns & exchanges</p>
          </div>

          <div className="flex flex-col items-center space-y-1 p-2">
            <div className="h-12 w-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-1">
              <CreditCard className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-xs text-foreground">Secure Payment Gateway</h4>
            <p className="text-[11px] text-muted-foreground">UPI, Cards, EMI & Cash on Delivery</p>
          </div>
        </div>
      </section>
    </div>
  );
}
