import Link from "next/link";
import Image from "next/image";
import { Zap, ArrowRight, ShieldCheck, Flame, Tag, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export const revalidate = 60; // ISR cache for 60 seconds

const CATEGORY_CARDS = [
  { name: "Electronics", slug: "electronics", image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80", discount: "Up to 50% Off" },
  { name: "Smartphones", slug: "mobiles", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80", discount: "From ₹6,999" },
  { name: "Fashion & Trends", slug: "fashion", image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&q=80", discount: "Min 40% Off" },
  { name: "Footwear", slug: "footwear", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80", discount: "Under ₹1,999" },
  { name: "Home & Cookware", slug: "home-kitchen", image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&q=80", discount: "Special Deals" },
  { name: "Beauty & Care", slug: "beauty", image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80", discount: "Extra 15% Off" },
];

export default function HomePage() {
  return (
    <div className="space-y-10 pb-16">
      {/* Hero Banner Section */}
      <section className="container pt-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white shadow-2xl p-8 sm:p-14 md:p-16 flex flex-col justify-center min-h-[380px]">
          <div className="relative z-10 max-w-2xl space-y-4">
            <Badge variant="deal" className="animate-bounce">
              Grand Shopping Festival
            </Badge>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
              India&apos;s Ultimate <span className="text-amber-300">Mega Deals</span> Are Live!
            </h1>
            <p className="text-sm sm:text-base text-indigo-100 max-w-lg leading-relaxed">
              Explore 200+ verified top products across 10 categories with express doorstep
              delivery, seamless returns, and instant coupon savings.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/products">
                <Button size="lg" className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold rounded-full gap-2 shadow-lg">
                  Explore Catalog <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/seller/onboarding">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-full">
                  Sell on ShopVerse
                </Button>
              </Link>
            </div>
          </div>

          {/* Decorative Glowing Elements */}
          <div className="absolute -right-16 -top-16 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />
          <div className="absolute right-12 -bottom-12 h-64 w-64 rounded-full bg-indigo-500/30 blur-2xl pointer-events-none" />
        </div>
      </section>

      {/* Featured Categories Grid */}
      <section className="container space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Shop by Category</h2>
            <p className="text-sm text-muted-foreground">Handpicked selections across top categories</p>
          </div>
          <Link href="/products" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORY_CARDS.map((cat) => (
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
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  {cat.discount}
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Flash Deals with Live Countdown Bar */}
      <section className="container">
        <div className="rounded-3xl border bg-gradient-to-br from-amber-500/10 via-rose-500/5 to-purple-500/10 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-500 text-white shadow-md">
                <Flame className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight">Flash Deals of the Day</h2>
                <p className="text-xs text-muted-foreground">Limited inventory deals refreshed daily</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm font-semibold bg-background/80 backdrop-blur px-4 py-2 rounded-2xl border">
              <Clock className="h-4 w-4 text-rose-500" />
              <span>Ends in:</span>
              <span className="text-rose-600 dark:text-rose-400 font-mono">14h : 22m : 45s</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Quick Preview Flash Deals */}
            {[
              { title: "Noise Cancelling Headphones Pro", price: "₹12,999", old: "₹19,999", off: "35% OFF", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80" },
              { title: "Smart Fitness Watch AMOLED", price: "₹3,999", old: "₹7,999", off: "50% OFF", img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80" },
              { title: "Non-Stick Granito Cookware 3 Pcs", price: "₹2,499", old: "₹5,999", off: "58% OFF", img: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&q=80" },
              { title: "Men's Cloudfoam Running Shoes", price: "₹2,499", old: "₹4,999", off: "50% OFF", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80" },
            ].map((deal, idx) => (
              <Card key={idx} className="overflow-hidden rounded-2xl p-3 space-y-3 hover:shadow-lg transition-all">
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-muted">
                  <Image
                    src={deal.img}
                    alt={deal.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                  <Badge variant="deal" className="absolute top-2 left-2 text-[10px]">
                    {deal.off}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm line-clamp-1">{deal.title}</h4>
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-bold text-foreground">{deal.price}</span>
                    <span className="text-xs text-muted-foreground line-through">{deal.old}</span>
                  </div>
                </div>
                <Link href="/products">
                  <Button variant="outline" size="sm" className="w-full rounded-xl mt-2 font-medium">
                    Grab Deal
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
