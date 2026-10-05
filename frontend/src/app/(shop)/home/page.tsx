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
  ExternalLink,
  Percent,
  CheckCircle2,
  Users,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const HERO_ADS = [
  {
    id: 1,
    tag: "Sponsored Mega Carnival",
    pill: "Flat 20% Code: FESTIVE20",
    title: "Apple & Samsung Flagship Mega Fest",
    highlight: "Up to ₹15,000 Instant Bank Off",
    desc: "iPhone 15 Pro Max & Galaxy S24 Ultra with No Cost EMI from ₹2,499/mo + Free 1-Year Apple Care+ / Galaxy Buds 2 Pro.",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80",
    categorySlug: "mobiles",
    cta: "Shop Flagships Now",
    gradient: "from-indigo-950 via-purple-900 to-indigo-900",
  },
  {
    id: 2,
    tag: "Ajio Style Week",
    pill: "Min 50% - 80% Off",
    title: "Curated Luxury & Streetwear Drops",
    highlight: "Tommy Hilfiger, Zara & Nike",
    desc: "Redefine your wardrobe with runway apparel, limited-edition couture, and verified original sneakers.",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80",
    categorySlug: "fashion",
    cta: "Explore Runway Drops",
    gradient: "from-purple-950 via-fuchsia-900 to-slate-950",
  },
  {
    id: 3,
    tag: "Smart Living Ad",
    pill: "Flat ₹5,000 Instant Off",
    title: "Dyson & Smart Home Revolution",
    highlight: "Cordless V12 & Air Purifiers",
    desc: "Experience acoustic suction power, HEPA air purification, and smart kitchen cookware at festive pricing.",
    image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&q=80",
    categorySlug: "home-kitchen",
    cta: "Claim Dyson Deals",
    gradient: "from-zinc-950 via-teal-950 to-slate-900",
  },
  {
    id: 4,
    tag: "Audio Bonanza",
    pill: "Starting ₹799",
    title: "Sony & boAt Spatial Sound Fest",
    highlight: "Noise Cancellation Earbuds & Bars",
    desc: "Cinematic Dolby Atmos bass and 60-hour playtime bluetooth earbuds with free extended warranty.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    categorySlug: "electronics",
    cta: "Grab Audio Deals",
    gradient: "from-slate-950 via-rose-950 to-black",
  },
];

const LIGHTNING_BLITZ_DEALS = [
  {
    title: "Dyson V12 Detect Slim Total Clean Cordless Vacuum",
    price: "₹44,990",
    originalPrice: "₹57,900",
    discount: "22% OFF",
    claimedPct: 88,
    unitsLeft: 3,
    viewers: 34,
    image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400&q=80",
    categorySlug: "home-kitchen",
  },
  {
    title: "Sony WH-1000XM5 Wireless Active Noise Cancelling",
    price: "₹24,990",
    originalPrice: "₹34,990",
    discount: "29% OFF",
    claimedPct: 76,
    unitsLeft: 5,
    viewers: 21,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",
    categorySlug: "electronics",
  },
  {
    title: "Nike Air Max Pulse Men's Athletic Running Shoes",
    price: "₹4,999",
    originalPrice: "₹10,995",
    discount: "55% OFF",
    claimedPct: 94,
    unitsLeft: 2,
    viewers: 49,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
    categorySlug: "footwear",
  },
  {
    title: "Samsung Galaxy S24 Ultra AI 5G (Titanium Gray, 256GB)",
    price: "₹1,19,999",
    originalPrice: "₹1,34,999",
    discount: "11% OFF",
    claimedPct: 65,
    unitsLeft: 8,
    viewers: 62,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80",
    categorySlug: "mobiles",
  },
];

const UNDER_999_DEALS = [
  { title: "boAt BassHeads 100 Wired Earphones", price: "₹399", old: "₹999", off: "60% OFF", img: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=300&q=80" },
  { title: "Fastrack Limitless FS1 Smartwatch", price: "₹999", old: "₹2,495", off: "60% OFF", img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80" },
  { title: "Cotton Rich Oversized Graphic Tee", price: "₹499", old: "₹1,299", off: "62% OFF", img: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300&q=80" },
  { title: "Stainless Steel Insulated Water Flask", price: "₹449", old: "₹999", off: "55% OFF", img: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300&q=80" },
];

const SPONSORED_BRANDS = [
  { name: "Apple", logo: "🍎", tag: "Authorised Reseller", discount: "Up to ₹10,000 Off", slug: "mobiles" },
  { name: "Samsung", logo: "📱", tag: "Galaxy Festival", discount: "Flat 25% Cashback", slug: "mobiles" },
  { name: "Nike", logo: "👟", tag: "Official Sports Hub", discount: "Min 40% Off", slug: "footwear" },
  { name: "Puma", logo: "🐆", tag: "Motorsport Collection", discount: "Buy 1 Get 1 at 50%", slug: "footwear" },
  { name: "Dyson", logo: "🌀", tag: "Smart Living Partner", discount: "Flat ₹5,000 Off", slug: "home-kitchen" },
  { name: "boAt", logo: "🎧", tag: "Audio King", discount: "Starting ₹899", slug: "electronics" },
];

const BANK_OFFERS = [
  { bank: "HDFC Bank", offer: "10% Instant Discount", sub: "Up to ₹1,500 on Cards & EMI", color: "from-blue-600 to-indigo-700" },
  { bank: "ICICI Bank", offer: "Flat ₹2,000 Cashback", sub: "On Mobiles & Laptops", color: "from-amber-600 to-orange-700" },
  { bank: "SBI Card", offer: "5% Unlimited Cashback", sub: "On all Fashion & Home", color: "from-sky-600 to-blue-800" },
  { bank: "UPI / Google Pay", offer: "Assured ₹100 - ₹500", sub: "On orders above ₹999", color: "from-emerald-600 to-teal-700" },
];

export default function StoreHomePage() {
  const [activeAdIndex, setActiveAdIndex] = useState(0);

  // Auto rotate hero ads every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveAdIndex((prev) => (prev + 1) % HERO_ADS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const currentAd = HERO_ADS[activeAdIndex];

  return (
    <div className="space-y-10 pb-20">
      {/* 1. INTERACTIVE ROTATING HERO AD CAROUSEL */}
      <section className="container pt-4">
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${currentAd.gradient} text-white shadow-2xl p-6 sm:p-10 md:p-12 transition-all duration-700`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 min-h-[360px]">
            <div className="relative z-10 max-w-xl space-y-4 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <Badge variant="deal" className="animate-bounce">
                  {currentAd.tag}
                </Badge>
                <Badge className="bg-amber-400 text-slate-950 font-bold">
                  {currentAd.pill}
                </Badge>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                {currentAd.title}
              </h1>

              <p className="text-sm font-bold text-amber-300">
                {currentAd.highlight}
              </p>

              <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                {currentAd.desc}
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                <Link href={`/products?category_slug=${currentAd.categorySlug}`}>
                  <Button size="lg" className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold rounded-full gap-2 shadow-lg">
                    {currentAd.cta} <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/spin-and-win">
                  <Button size="lg" variant="outline" className="border-amber-300 text-amber-300 hover:bg-amber-400/10 rounded-full font-bold">
                    🎁 Daily Spin & Win
                  </Button>
                </Link>
              </div>
            </div>

            {/* Visual Hero Ad Graphic */}
            <div className="relative w-full max-w-xs sm:max-w-sm aspect-square rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 flex-shrink-0">
              <Image
                src={currentAd.image}
                alt={currentAd.title}
                fill
                className="object-cover transition-all duration-500 hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4 text-white">
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">Ad • Verified Partner</span>
                <p className="text-xs font-semibold">{currentAd.highlight}</p>
              </div>
            </div>
          </div>

          {/* Ad Carousel Controls */}
          <div className="flex items-center justify-center gap-2 pt-6">
            {HERO_ADS.map((ad, idx) => (
              <button
                key={ad.id}
                onClick={() => setActiveAdIndex(idx)}
                className={`h-2.5 rounded-full transition-all ${
                  activeAdIndex === idx ? "w-8 bg-amber-400" : "w-2.5 bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Glowing Ambient Blobs */}
          <div className="absolute -right-16 -top-16 h-80 w-80 rounded-full bg-purple-500/25 blur-3xl pointer-events-none" />
          <div className="absolute left-12 -bottom-12 h-64 w-64 rounded-full bg-indigo-500/30 blur-2xl pointer-events-none" />
        </div>
      </section>

      {/* 2. REAL-TIME LIGHTNING BLITZ DEALS WITH STOCK PROGRESS BAR */}
      <section className="container">
        <div className="rounded-3xl border-2 border-rose-500/30 bg-gradient-to-br from-rose-500/10 via-amber-500/5 to-purple-500/10 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-500 text-white shadow-lg animate-pulse">
                <Flame className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black tracking-tight text-foreground">Real-Time Lightning Blitz Deals</h2>
                  <Badge className="bg-rose-500 text-white text-[10px] font-bold animate-pulse">
                    Live Stock Decrement
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">High-demand deals expiring in real-time. Lock your cart before stock runs out!</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm font-semibold bg-background/90 backdrop-blur px-4 py-2 rounded-2xl border shadow-xs">
              <Clock className="h-4 w-4 text-rose-500 animate-spin" />
              <span>Deal Ends In:</span>
              <span className="text-rose-600 dark:text-rose-400 font-mono font-bold">02h : 14m : 55s</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {LIGHTNING_BLITZ_DEALS.map((deal, idx) => (
              <Card key={idx} className="overflow-hidden rounded-2xl p-3.5 space-y-3 hover:shadow-xl transition-all border-2 hover:border-rose-500/50 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-muted">
                    <Image
                      src={deal.image}
                      alt={deal.title}
                      fill
                      className="object-cover"
                    />
                    <Badge variant="deal" className="absolute top-2 left-2 text-[10px] font-black">
                      {deal.discount}
                    </Badge>
                    <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Users className="h-3 w-3 text-amber-300" /> {deal.viewers} viewing now
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-semibold text-xs line-clamp-2">{deal.title}</h4>
                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-base font-black text-foreground">{deal.price}</span>
                      <span className="text-xs text-muted-foreground line-through">{deal.originalPrice}</span>
                    </div>
                  </div>

                  {/* Stock Claim Progress Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-rose-600 dark:text-rose-400">{deal.claimedPct}% Claimed</span>
                      <span className="text-amber-600 dark:text-amber-400">Only {deal.unitsLeft} Left!</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-rose-600 rounded-full transition-all"
                        style={{ width: `${deal.claimedPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <Link href={`/products?category_slug=${deal.categorySlug}`} className="pt-2">
                  <Button size="sm" className="w-full rounded-xl font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-md">
                    Claim Deal Now
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 3. BANK & PAYMENT CASHBACK OFFERS AD STRIP */}
      <section className="container">
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Partner Bank & Payment Promotions</h3>
          </div>
          <span className="text-[11px] text-muted-foreground">Instant Discount Applied at Checkout</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {BANK_OFFERS.map((b, idx) => (
            <Card
              key={idx}
              className={`p-4 rounded-2xl bg-gradient-to-br ${b.color} text-white shadow-md flex items-center justify-between gap-3 border-0 hover:scale-102 transition-transform`}
            >
              <div className="space-y-0.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-white/80">{b.bank}</span>
                <h4 className="text-sm font-bold">{b.offer}</h4>
                <p className="text-[11px] text-white/90">{b.sub}</p>
              </div>
              <Percent className="h-7 w-7 text-white/40 flex-shrink-0" />
            </Card>
          ))}
        </div>
      </section>

      {/* 4. DUAL SPONSORED ADS (Audio + Sneaker Drop) */}
      <section className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ad 1: Audio */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-zinc-900 to-black text-white p-6 sm:p-8 flex flex-col justify-between min-h-[260px] shadow-xl border border-zinc-800">
            <div className="relative z-10 space-y-3 max-w-sm">
              <Badge className="bg-rose-500 text-white text-[10px] uppercase font-bold">
                Sponsored • Audio Fest
              </Badge>
              <h3 className="text-2xl font-black">Sony & boAt Spatial Audio</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Active Noise Cancellation earbuds and Dolby Atmos soundbars with up to 60% instant savings.
              </p>
              <div>
                <Link href="/products?category_slug=electronics">
                  <Button size="sm" className="rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold gap-1.5 shadow-md">
                    Explore Audio Deals <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-60 md:opacity-90 pointer-events-none">
              <Image
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80"
                alt="Headphones Ad"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Ad 2: Sneakers */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 text-white p-6 sm:p-8 flex flex-col justify-between min-h-[260px] shadow-xl border border-indigo-900/50">
            <div className="relative z-10 space-y-3 max-w-sm">
              <Badge className="bg-amber-400 text-slate-950 text-[10px] uppercase font-black">
                Sponsored • Sneaker Hub
              </Badge>
              <h3 className="text-2xl font-black">Nike & Puma Air Drops</h3>
              <p className="text-xs text-indigo-200 leading-relaxed">
                Limited edition running kicks, high-top street trainers, and gym wear at flat 45% off.
              </p>
              <div>
                <Link href="/products?category_slug=footwear">
                  <Button size="sm" className="rounded-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold gap-1.5 shadow-md">
                    Claim Sneaker Drop <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-60 md:opacity-90 pointer-events-none">
              <Image
                src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80"
                alt="Sneakers Ad"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 5. BUDGET SUPER-SAVERS (UNDER ₹499 & ₹999) MEESHO-STYLE CORNER */}
      <section className="container space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-emerald-500" />
            <div>
              <h2 className="text-xl font-bold tracking-tight">Budget Super Savers • Under ₹499 & ₹999</h2>
              <p className="text-xs text-muted-foreground">Meesho & Flipkart style high-demand everyday essentials</p>
            </div>
          </div>
          <Link href="/products" className="text-xs sm:text-sm font-semibold text-primary hover:underline flex items-center gap-1">
            View All Savers <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {UNDER_999_DEALS.map((deal, idx) => (
            <Card key={idx} className="p-3 rounded-2xl space-y-2 hover:shadow-md transition-all group border">
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-muted">
                <Image src={deal.img} alt={deal.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                <Badge variant="deal" className="absolute top-2 left-2 text-[10px]">
                  {deal.off}
                </Badge>
              </div>
              <h4 className="font-semibold text-xs line-clamp-1">{deal.title}</h4>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-black text-foreground">{deal.price}</span>
                <span className="text-[11px] text-muted-foreground line-through">{deal.old}</span>
              </div>
              <Link href="/products">
                <Button size="sm" variant="outline" className="w-full rounded-xl text-xs font-bold mt-1">
                  Buy Under ₹999
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      {/* 6. OFFICIAL SPONSORED BRAND STORES RIBBON */}
      <section className="container space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            <h2 className="text-xl font-bold tracking-tight">Official Sponsored Brand Stores</h2>
          </div>
          <span className="text-xs text-muted-foreground">100% Genuine Certified Brands</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {SPONSORED_BRANDS.map((brand, idx) => (
            <Link key={idx} href={`/products?category_slug=${brand.slug}`}>
              <Card className="p-4 rounded-2xl text-center space-y-2 hover:shadow-md transition-all hover:border-primary/50 group bg-card/60">
                <div className="text-3xl">{brand.logo}</div>
                <h3 className="font-bold text-sm text-foreground">{brand.name}</h3>
                <p className="text-[11px] text-muted-foreground">{brand.tag}</p>
                <Badge variant="secondary" className="text-[10px] text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {brand.discount}
                </Badge>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* 7. MEESHO-STYLE RESELLER EARNINGS PROMO BANNER */}
      <section className="container">
        <div className="rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 text-white p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-emerald-700/30">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <Badge className="bg-emerald-400 text-slate-950 font-bold text-xs">
              Ad • Reseller Opportunity
            </Badge>
            <h3 className="text-2xl sm:text-3xl font-black">
              Earn ₹25,000+ / Month by Sharing Products on WhatsApp
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
              Zero stock investment required. Add your margin on 500+ wholesale products, share with friends and family, and get daily direct bank payouts.
            </p>
          </div>
          <div>
            <Link href="/reseller">
              <Button size="lg" className="bg-emerald-400 hover:bg-emerald-500 text-slate-950 font-bold rounded-2xl px-8 shadow-lg">
                Start Earning Today <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
