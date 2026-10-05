"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, X, Zap } from "lucide-react";

const RECENT_PURCHASES = [
  {
    name: "Pooja S.",
    city: "Mumbai",
    item: "Dyson V12 Detect Slim Vacuum",
    price: "₹44,990",
    saved: "Saved ₹12,000",
    image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=120&q=80",
    time: "Just now",
  },
  {
    name: "Vikram R.",
    city: "Bangalore",
    item: "Nike Air Max Pulse Sneakers",
    price: "₹4,999",
    saved: "50% Off Grabbed",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&q=80",
    time: "1 min ago",
  },
  {
    name: "Ananya M.",
    city: "Delhi",
    item: "Sony WH-1000XM5 ANC Headphones",
    price: "₹24,990",
    saved: "Saved ₹5,000",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120&q=80",
    time: "2 mins ago",
  },
  {
    name: "Karan D.",
    city: "Hyderabad",
    item: "Samsung Galaxy S24 Ultra 512GB",
    price: "₹1,19,999",
    saved: "Free Galaxy Watch Included",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=120&q=80",
    time: "3 mins ago",
  },
];

export function RealtimeDealToast() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show toast periodically
    const showInterval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % RECENT_PURCHASES.length);
      setVisible(true);

      const hideTimeout = setTimeout(() => {
        setVisible(false);
      }, 5000);

      return () => clearTimeout(hideTimeout);
    }, 12000);

    // Initial show after 3 seconds
    const initialTimer = setTimeout(() => {
      setVisible(true);
      setTimeout(() => setVisible(false), 5000);
    }, 3000);

    return () => {
      clearInterval(showInterval);
      clearTimeout(initialTimer);
    };
  }, []);

  if (!visible) return null;

  const current = RECENT_PURCHASES[currentIdx];

  return (
    <div className="fixed bottom-20 left-4 z-40 max-w-xs sm:max-w-sm w-full animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="p-3 rounded-2xl bg-card/95 backdrop-blur-md border-2 border-primary/30 shadow-2xl flex items-center gap-3 text-xs text-foreground relative">
        <button
          onClick={() => setVisible(false)}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground p-0.5 rounded-full"
          aria-label="Close"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <div className="relative h-12 w-12 rounded-xl bg-muted overflow-hidden flex-shrink-0">
          <Image src={current.image} alt={current.item} fill className="object-cover" />
        </div>

        <div className="space-y-0.5 pr-4 flex-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            <Zap className="h-3 w-3 fill-emerald-500 text-emerald-500" />
            <span>Verified Purchase ({current.time})</span>
          </div>
          <p className="text-xs font-semibold line-clamp-1">{current.item}</p>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-muted-foreground font-medium">{current.name} in {current.city}</span>
            <span className="font-bold text-primary">{current.saved}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
