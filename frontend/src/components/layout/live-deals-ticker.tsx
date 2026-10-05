"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Zap, Flame, Sparkles, Clock, ArrowRight } from "lucide-react";

const REALTIME_DEALS = [
  { text: "⚡ FLASH SALE: Dyson V12 Cordless Vacuum @ 42% Off - Only 3 Units Left!", link: "/products" },
  { text: "🔥 SPONSORED: iPhone 15 Pro Max with Extra ₹6,000 HDFC Instant Cashback", link: "/products?category_slug=mobiles" },
  { text: "🎁 DAILY JACKPOT: 1,840 Shoppers Won ₹500 Wallet Cash in Spin & Win Today", link: "/spin-and-win" },
  { text: "👟 SNEAKER DROP: Nike Air Max Pulse Restocked at ₹4,999 - Deal Ends Soon!", link: "/products?category_slug=footwear" },
  { text: "🛍️ AJIO MANIA: Flat 60% - 80% Off on Zara, Levi's & Tommy Hilfiger", link: "/products?category_slug=fashion" },
];

export function LiveDealsTicker() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % REALTIME_DEALS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const currentDeal = REALTIME_DEALS[index];

  return (
    <div className="bg-gradient-to-r from-amber-500 via-rose-600 to-purple-700 text-white py-1.5 px-4 text-xs font-bold shadow-inner overflow-hidden">
      <div className="container flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 overflow-hidden">
          <span className="flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider flex-shrink-0">
            <Flame className="h-3.5 w-3.5 fill-amber-300 text-amber-300 animate-bounce" /> Live Deals
          </span>
          <Link
            href={currentDeal.link}
            className="truncate hover:underline flex items-center gap-1 transition-all duration-300"
          >
            <span>{currentDeal.text}</span>
          </Link>
        </div>

        <Link
          href="/products"
          className="hidden sm:flex items-center gap-1 text-[11px] bg-white/20 hover:bg-white/30 px-2.5 py-0.5 rounded-full transition-colors flex-shrink-0"
        >
          View All Live Deals <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
