"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingCart,
  Heart,
  User as UserIcon,
  Mic,
  Menu,
  Moon,
  Sun,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useTheme } from "next-themes";
import { SearchBar } from "./search-bar";
import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import { LiveDealsTicker } from "./live-deals-ticker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function Header() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user } = useAuthStore();
  const itemCount = useCartStore((state) => state.getItemCount());
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      {/* Realtime Live Deals Ticker */}
      <LiveDealsTicker />

      {/* Top Banner Bar */}
      <div className="hidden md:flex items-center justify-between px-4 sm:px-8 py-1.5 text-xs bg-primary text-primary-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 font-medium">
            <Zap className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
            Mega Festive Carnival: Flat 20% Instant Discount with Code <strong>FESTIVE20</strong>
          </span>
          <Link href="/spin-and-win" className="inline-flex items-center gap-1 font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full hover:bg-amber-300 transition-colors">
            🎁 Daily Spin & Win
          </Link>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/seller/onboarding" className="hover:underline">
            Become a Seller
          </Link>
          <Link href="/reseller" className="hover:underline font-semibold text-amber-300">
            Resell & Earn
          </Link>
          <Link href="/compare" className="hover:underline">
            Compare
          </Link>
          <Link href="/help" className="hover:underline">
            24x7 Support
          </Link>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white font-black text-xl shadow-md">
            S
          </div>
          <span className="text-xl font-bold tracking-tight">
            Shop<span className="text-primary">Verse</span>
          </span>
        </Link>

        {/* Search Bar with instant autocomplete and voice search */}
        <div className="hidden md:flex flex-1 max-w-xl">
          <SearchBar />
        </div>

        {/* Actions & Account */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full"
            aria-label="Toggle theme"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Wishlist */}
          <Link href="/account/wishlist">
            <Button variant="ghost" size="icon" className="rounded-full" aria-label="Wishlist">
              <Heart className="h-5 w-5" />
            </Button>
          </Link>

          {/* Cart with Live Count */}
          <Link href="/cart">
            <Button variant="outline" className="relative rounded-full gap-2 px-4 shadow-sm">
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline font-semibold">Cart</span>
              {itemCount > 0 && (
                <Badge variant="deal" className="h-5 min-w-5 px-1.5 text-xs rounded-full">
                  {itemCount}
                </Badge>
              )}
            </Button>
          </Link>

          {/* User Profile / Login */}
          {user ? (
            <Link href="/account/profile">
              <Button variant="ghost" className="rounded-full gap-2">
                <UserIcon className="h-4 w-4" />
                <span className="hidden sm:inline font-medium">{user.full_name.split(" ")[0]}</span>
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button variant="default" className="rounded-full px-5">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
