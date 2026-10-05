"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Sparkles } from "lucide-react";

const FLIPKART_CATEGORIES = [
  {
    name: "Top Offers",
    slug: "deals",
    href: "/products?min_discount=30",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=120&q=80",
    badge: "50-80% Off",
    hasDropdown: false,
  },
  {
    name: "Mobiles & Tablets",
    slug: "mobiles",
    href: "/products?category_slug=mobiles",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=120&q=80",
    badge: null,
    hasDropdown: true,
  },
  {
    name: "Electronics",
    slug: "electronics",
    href: "/products?category_slug=electronics",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=120&q=80",
    badge: null,
    hasDropdown: true,
  },
  {
    name: "TVs & Appliances",
    slug: "appliances",
    href: "/products?category_slug=home-kitchen",
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=120&q=80",
    badge: null,
    hasDropdown: true,
  },
  {
    name: "Fashion",
    slug: "fashion",
    href: "/products?category_slug=fashion",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=120&q=80",
    badge: null,
    hasDropdown: true,
  },
  {
    name: "Beauty & Toys",
    slug: "beauty",
    href: "/products?category_slug=beauty",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=120&q=80",
    badge: null,
    hasDropdown: true,
  },
  {
    name: "Home & Kitchen",
    slug: "home-kitchen",
    href: "/products?category_slug=home-kitchen",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=120&q=80",
    badge: null,
    hasDropdown: true,
  },
  {
    name: "Footwear",
    slug: "footwear",
    href: "/products?category_slug=footwear",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&q=80",
    badge: null,
    hasDropdown: false,
  },
  {
    name: "Sports & Fitness",
    slug: "sports-fitness",
    href: "/products?category_slug=sports-fitness",
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=120&q=80",
    badge: null,
    hasDropdown: false,
  },
  {
    name: "Grocery & Gourmet",
    slug: "groceries",
    href: "/products?category_slug=groceries",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=120&q=80",
    badge: "Express",
    hasDropdown: false,
  },
];

export function MegaMenu() {
  return (
    <div className="bg-card border-b shadow-xs sticky top-16 z-40">
      <div className="container py-3">
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar scroll-smooth">
          {FLIPKART_CATEGORIES.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="group flex flex-col items-center justify-center min-w-[76px] sm:min-w-[88px] px-1 py-1 text-center transition-transform hover:-translate-y-0.5"
            >
              {/* Category Circle Image with subtle ring */}
              <div className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-full overflow-hidden bg-muted mb-1.5 ring-2 ring-transparent group-hover:ring-primary/40 group-hover:shadow-md transition-all">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="64px"
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {item.badge && (
                  <span className="absolute bottom-0 inset-x-0 bg-primary/90 text-primary-foreground text-[8px] font-black uppercase py-0.5 tracking-tighter">
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Title & Dropdown chevron */}
              <div className="flex items-center gap-0.5 text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                <span className="truncate max-w-[80px]">{item.name}</span>
                {item.hasDropdown && (
                  <ChevronDown className="h-3 w-3 text-muted-foreground group-hover:text-primary group-hover:rotate-180 transition-transform hidden sm:inline-block" />
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
