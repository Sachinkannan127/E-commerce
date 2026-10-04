"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid, ShoppingBag, Heart, User } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { Badge } from "@/components/ui/badge";

export function MobileBottomNav() {
  const pathname = usePathname();
  const itemCount = useCartStore((state) => state.getItemCount());

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Categories", href: "/products", icon: Grid },
    { label: "Cart", href: "/cart", icon: ShoppingBag, count: itemCount },
    { label: "Wishlist", href: "/account/wishlist", icon: Heart },
    { label: "Account", href: "/account/profile", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full border-t bg-background/95 backdrop-blur-md md:hidden">
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
                isActive ? "text-primary font-semibold" : "text-muted-foreground"
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {item.count !== undefined && item.count > 0 && (
                  <Badge
                    variant="deal"
                    className="absolute -top-1.5 -right-2.5 h-4 min-w-4 px-1 text-[9px] rounded-full flex items-center justify-center"
                  >
                    {item.count}
                  </Badge>
                )}
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
