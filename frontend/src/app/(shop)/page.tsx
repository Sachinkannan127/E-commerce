import Link from "next/link";
import Image from "next/image";
import {
  Zap,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Share2,
  TrendingUp,
  Gift,
  Truck,
  RotateCcw,
  Sparkles,
  CheckCircle,
  Star,
  Layers,
  Search,
  Lock,
  Smartphone,
  Store,
  ChevronRight,
  Flame,
  Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export const metadata = {
  title: "ShopVerse - The Next-Gen Multi-Vendor Commerce Platform",
  description: "Experience India's premier multi-vendor e-commerce platform. Shop 500+ top brands, resell with zero investment, and scale your business.",
};

const STATS = [
  { value: "500+", label: "Curated Products", change: "Across 10 Categories" },
  { value: "100+", label: "Verified Sellers", change: "Direct from Hubs" },
  { value: "₹0", label: "Reseller Investment", change: "Start in 60 seconds" },
  { value: "24-48h", label: "Express Delivery", change: "Pan-India Reach" },
];

const PILLARS = [
  {
    icon: ShoppingBag,
    title: "Mega Marketplace",
    badge: "Amazon & Flipkart Level",
    badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    desc: "Lightning-fast catalog search, multi-variant options, verified ratings, 1-click checkout, and instant festive promo codes.",
    link: "/home",
    cta: "Enter Marketplace",
  },
  {
    icon: Share2,
    title: "Zero-Investment Reselling",
    badge: "Meesho Model",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    desc: "Add your custom profit margin, share directly on WhatsApp & Instagram, and let verified suppliers fulfill the orders automatically.",
    link: "/reseller",
    cta: "Start Reselling",
  },
  {
    icon: TrendingUp,
    title: "Curated Fashion & Trends",
    badge: "Ajio Style Curations",
    badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    desc: "Handpicked premium streetwear, ethnic couture, footwear drops, and luxury electronics with rich lookbooks and high-res media.",
    link: "/products?category_slug=fashion",
    cta: "Explore Fashion",
  },
  {
    icon: Gift,
    title: "Daily Spin & Win Rewards",
    badge: "Gamified Loyalty",
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    desc: "Spin the fortune wheel every 24 hours for instant flat 50% discount coupons, wallet cash, and free shipping vouchers.",
    link: "/spin-and-win",
    cta: "Spin the Wheel",
  },
];

const POPULAR_CATEGORIES = [
  { name: "Electronics", slug: "electronics", image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80", count: "100+ Items" },
  { name: "Smartphones", slug: "mobiles", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80", count: "50+ Models" },
  { name: "Fashion & Trends", slug: "fashion", image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&q=80", count: "120+ Styles" },
  { name: "Footwear", slug: "footwear", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80", count: "60+ Pairs" },
  { name: "Home & Cookware", slug: "home-kitchen", image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&q=80", count: "80+ Items" },
  { name: "Beauty & Personal", slug: "beauty", image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80", count: "70+ Brands" },
];

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    role: "Fashion Reseller, Delhi",
    text: "ShopVerse changed my home business. I added ₹250 margin per saree and earned ₹38,000 in my first month without holding any stock!",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80",
  },
  {
    name: "Rahul Verma",
    role: "Verified Electronics Seller",
    text: "The seller analytics dashboard and automated commission settlement make scaling seamless. Best e-commerce hub in India.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80",
  },
  {
    name: "Ananya Iyer",
    role: "Verified Customer, Bangalore",
    text: "Ordered a Dyson vacuum and Nike sneakers. Both arrived in pristine packaging in under 36 hours. The 1-click checkout is amazing.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&q=80",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground overflow-hidden">
      {/* Glow Ambient Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[650px] overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-32 left-1/4 w-96 h-96 bg-primary/25 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-purple-500/25 rounded-full blur-3xl" />
        <div className="absolute top-48 left-1/2 -translate-x-1/2 w-[600px] h-72 bg-amber-500/15 rounded-full blur-3xl" />
      </div>

      {/* Hero Section */}
      <section className="container pt-10 pb-16 md:pt-16 md:pb-24 text-center space-y-8 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border bg-background/80 backdrop-blur-md shadow-sm text-xs font-semibold animate-pulse">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span>India&apos;s Ultimate Multi-Vendor Super App</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">500+ Items Live</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.1]">
          Shop Smart. Resell & Earn. <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-primary via-purple-500 to-amber-500 bg-clip-text text-transparent">
            Sell to Millions.
          </span>
        </h1>

        <p className="text-base sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          The all-in-one commerce ecosystem combining the speed of <strong>Amazon</strong>, 
          the resale power of <strong>Meesho</strong>, and the curated trends of <strong>Ajio</strong>.
        </p>

        {/* Primary Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/home" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto text-base font-black px-8 py-6 rounded-2xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white shadow-xl shadow-primary/25 gap-2 group transition-all hover:scale-105"
            >
              Enter Store & Explore Marketplace
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>

          <Link href="/reseller" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto text-base font-bold px-8 py-6 rounded-2xl border-2 hover:bg-muted/50 gap-2"
            >
              <Share2 className="h-5 w-5 text-emerald-500" />
              Start Reselling (₹0 Inv.)
            </Button>
          </Link>

          <Link href="/seller/onboarding" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="ghost"
              className="w-full sm:w-auto text-base font-bold px-6 py-6 rounded-2xl hover:bg-muted/30 gap-2"
            >
              <Store className="h-5 w-5 text-primary" />
              Become a Seller
            </Button>
          </Link>
        </div>

        {/* Floating Live Feature Badges */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4 text-emerald-500" /> 100% Verified Sellers
          </span>
          <span className="flex items-center gap-1.5">
            <Truck className="h-4 w-4 text-blue-500" /> Express 24-48h Delivery
          </span>
          <span className="flex items-center gap-1.5">
            <RotateCcw className="h-4 w-4 text-amber-500" /> 7-Day Easy Returns
          </span>
          <span className="flex items-center gap-1.5">
            <Lock className="h-4 w-4 text-purple-500" /> Encrypted UPI / Card Checkout
          </span>
        </div>
      </section>

      {/* Stats Counter Bar */}
      <section className="container pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-8 rounded-3xl border bg-card/60 backdrop-blur-xl shadow-lg">
          {STATS.map((stat, i) => (
            <div key={i} className="text-center space-y-1 p-3">
              <div className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm font-bold text-foreground">{stat.label}</div>
              <div className="text-[11px] text-muted-foreground">{stat.change}</div>
            </div>
          ))}
        </div>
      </section>

      {/* The 4 Ecosystem Pillars */}
      <section className="container space-y-10 pb-20">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <Badge variant="outline" className="text-xs uppercase tracking-wider">
            Built for Everyone
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            One Platform. Infinite Possibilities.
          </h2>
          <p className="text-sm text-muted-foreground">
            Whether you want to shop top products, build a passive resale income, or scale your brand nationally.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PILLARS.map((p, idx) => {
            const Icon = p.icon;
            return (
              <Card
                key={idx}
                className="group p-8 rounded-3xl border-2 hover:border-primary/40 transition-all hover:shadow-xl bg-card/50 backdrop-blur-sm flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="h-7 w-7" />
                    </div>
                    <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${p.badgeColor}`}>
                      {p.badge}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold">{p.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                </div>

                <div>
                  <Link href={p.link}>
                    <Button variant="outline" className="rounded-xl gap-2 font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      {p.cta} <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Category Spotlight Grid */}
      <section className="container space-y-6 pb-20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Popular Marketplace Hubs</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Explore 500+ products curated across key categories</p>
          </div>
          <Link href="/home" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
            Enter Store <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {POPULAR_CATEGORIES.map((cat) => (
            <Link key={cat.slug} href={`/products?category_slug=${cat.slug}`}>
              <Card className="group overflow-hidden rounded-2xl hover:shadow-md transition-all hover:border-primary/50 text-center p-3">
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-muted mb-2">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 50vw, 20vw"
                  />
                </div>
                <h3 className="font-semibold text-sm line-clamp-1">{cat.name}</h3>
                <span className="text-xs text-primary font-medium">
                  {cat.count}
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Interactive Reseller Showcase Section */}
      <section className="container pb-20">
        <div className="rounded-3xl bg-gradient-to-br from-emerald-950/40 via-background to-teal-950/30 border-2 border-emerald-500/20 p-8 sm:p-14 md:p-16 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="space-y-6 max-w-xl">
            <Badge className="bg-emerald-500 text-white font-bold text-xs px-3 py-1">
              Meesho-Style Reseller Hub
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Start Your Own Online Business with <span className="text-emerald-400">Zero Investment</span>
            </h2>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold mt-0.5">
                  1
                </div>
                <div>
                  <strong className="text-foreground">Browse 500+ Wholesale Catalogs</strong>
                  <p className="text-xs">Pick trending sarees, kurtis, smartwatches, or home essentials.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold mt-0.5">
                  2
                </div>
                <div>
                  <strong className="text-foreground">Set Your Custom Profit Margin</strong>
                  <p className="text-xs">Example: Wholesale ₹499 → Add ₹300 Margin → Customer pays ₹799.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold mt-0.5">
                  3
                </div>
                <div>
                  <strong className="text-foreground">Share on WhatsApp & Pocket Profits</strong>
                  <p className="text-xs">We ship directly in your brand name; profit gets deposited to your bank.</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link href="/reseller">
                <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-2xl px-8 shadow-lg shadow-emerald-500/20 gap-2">
                  Launch Reseller Business <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Visual Reseller Mock Card */}
          <Card className="w-full max-w-md p-6 rounded-3xl border-2 border-emerald-500/30 bg-card/90 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <span className="text-xs font-bold text-muted-foreground">Reseller Order Simulator</span>
              <Badge variant="secondary" className="text-[10px] text-emerald-500 bg-emerald-500/10">
                Live Preview
              </Badge>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-16 w-16 rounded-xl bg-muted overflow-hidden relative flex-shrink-0">
                <Image
                  src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80"
                  alt="Smart Watch"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h4 className="font-bold text-sm">Ultra Smart Watch Pro Max</h4>
                <p className="text-xs text-muted-foreground">Supplier Base Price: ₹1,299</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Your Added Margin</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">+₹500.00</span>
              </div>
              <div className="flex justify-between font-black text-sm pt-2 border-t text-foreground">
                <span>Final Customer Bill</span>
                <span>₹1,799.00</span>
              </div>
            </div>

            <div className="text-center text-[11px] text-muted-foreground">
              💰 Direct Payout to your bank upon delivery
            </div>
          </Card>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container space-y-8 pb-20">
        <div className="text-center space-y-2">
          <Badge variant="outline" className="text-xs uppercase">
            Community Love
          </Badge>
          <h2 className="text-3xl font-black">Trusted by Shoppers, Sellers & Resellers</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <Card key={idx} className="p-6 rounded-3xl border bg-card/40 backdrop-blur-sm space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {Array.from({ length: t.rating }).map((_, r) => (
                  <Star key={r} className="h-4 w-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground italic leading-relaxed">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-2">
                <div className="h-10 w-10 rounded-full overflow-hidden relative">
                  <Image src={t.avatar} alt={t.name} fill className="object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-foreground">{t.name}</h4>
                  <span className="text-[11px] text-muted-foreground">{t.role}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Grand Bottom CTA */}
      <section className="container pb-20">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-950 p-10 sm:p-16 text-center text-white space-y-6 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
              Ready to Experience India&apos;s Next-Gen Marketplace?
            </h2>
            <p className="text-sm sm:text-base text-indigo-200">
              Join thousands of shoppers and resellers enjoying massive discounts, instant loyalty rewards, and 24-48h delivery.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/home">
                <Button
                  size="lg"
                  className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-base px-10 py-6 rounded-2xl shadow-xl shadow-amber-500/20 gap-2"
                >
                  Enter Homepage & Shop Now <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/seller/onboarding">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 rounded-2xl px-8 py-6 font-bold"
                >
                  Register as Seller
                </Button>
              </Link>
            </div>
          </div>

          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -top-20 w-80 h-80 rounded-full bg-indigo-500/30 blur-3xl pointer-events-none" />
        </div>
      </section>
    </div>
  );
}
