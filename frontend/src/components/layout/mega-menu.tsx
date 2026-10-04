"use client";

import Link from "next/link";
import {
  Laptop,
  Smartphone,
  Shirt,
  Footprints,
  UtensilsCrossed,
  Sparkles,
  Dumbbell,
  BookOpen,
  Baby,
  ShoppingBag,
} from "lucide-react";

const CATEGORY_ITEMS = [
  { name: "Electronics", slug: "electronics", icon: Laptop },
  { name: "Mobiles", slug: "mobiles", icon: Smartphone },
  { name: "Fashion", slug: "fashion", icon: Shirt },
  { name: "Footwear", slug: "footwear", icon: Footprints },
  { name: "Home & Kitchen", slug: "home-kitchen", icon: UtensilsCrossed },
  { name: "Beauty", slug: "beauty", icon: Sparkles },
  { name: "Sports", slug: "sports-fitness", icon: Dumbbell },
  { name: "Books", slug: "books-stationery", icon: BookOpen },
  { name: "Toys & Baby", slug: "toys-baby", icon: Baby },
  { name: "Groceries", slug: "groceries", icon: ShoppingBag },
];

export function MegaMenu() {
  return (
    <div className="border-b bg-muted/20 overflow-x-auto no-scrollbar">
      <div className="container flex items-center justify-between gap-1 py-2 text-sm font-medium">
        {CATEGORY_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.slug}
              href={`/products?category_slug=${item.slug}`}
              className="flex items-center gap-2 whitespace-nowrap px-3 py-1.5 rounded-lg hover:bg-background/80 hover:text-primary transition-all text-muted-foreground hover:shadow-xs"
            >
              <Icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
