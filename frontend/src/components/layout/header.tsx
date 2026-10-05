"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingCart,
  Heart,
  User as UserIcon,
  Store,
  Sparkles,
  ChevronDown,
  Package,
  Gift,
  Bell,
  LogOut,
  Moon,
  Sun,
  ShieldCheck,
  Award,
  Zap,
} from "lucide-react";
import { useTheme } from "next-themes";
import { SearchBar } from "./search-bar";
import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import { LiveDealsTicker } from "./live-deals-ticker";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Header() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const itemCount = useCartStore((state) => state.getItemCount());
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md">
      {/* Realtime Live Deals Ticker */}
      <LiveDealsTicker />

      {/* Main Flipkart-Style Blue / Brand Header */}
      <div className="container flex h-16 items-center justify-between gap-4 sm:gap-6">
        {/* Brand Logo with Flipkart Plus Style Subtext */}
        <Link href="/" className="flex flex-col items-start leading-none group">
          <div className="flex items-center gap-1.5">
            <span className="text-2xl font-black italic tracking-tight text-primary">
              Shop<span className="text-amber-500">Verse</span>
            </span>
          </div>
          <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-0.5 group-hover:text-primary transition-colors">
            Explore <span className="text-amber-500 font-extrabold flex items-center gap-0.5">Plus <Sparkles className="h-2.5 w-2.5 fill-amber-500 text-amber-500 inline" /></span>
          </span>
        </Link>

        {/* Search Bar - Center */}
        <div className="hidden md:flex flex-1 max-w-2xl">
          <SearchBar />
        </div>

        {/* Right Navigation & Action Items */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* User Account / Login Button with Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setAccountMenuOpen(true)}
            onMouseLeave={() => setAccountMenuOpen(false)}
          >
            {user ? (
              <Button
                variant="ghost"
                className="rounded-xl gap-1.5 font-bold text-sm px-3 hover:bg-primary/10 hover:text-primary"
              >
                <UserIcon className="h-4 w-4 text-primary" />
                <span className="hidden sm:inline">{user.full_name.split(" ")[0]}</span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            ) : (
              <Link href="/login">
                <Button className="rounded-xl px-5 font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs gap-1.5">
                  <UserIcon className="h-4 w-4" />
                  <span>Login</span>
                </Button>
              </Link>
            )}

            {/* Account Dropdown Menu */}
            {accountMenuOpen && (
              <div className="absolute right-0 top-full pt-1.5 w-60 z-50 animate-in fade-in-50 slide-in-from-top-2">
                <div className="rounded-2xl border bg-card/95 backdrop-blur-xl shadow-2xl p-2 space-y-1 text-xs">
                  <div className="px-3 py-2 border-b mb-1">
                    <span className="font-bold text-foreground block">
                      {user ? user.full_name : "Welcome to ShopVerse"}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {user ? user.email : "To access account and manage orders"}
                    </span>
                  </div>

                  <Link
                    href="/account/profile"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-muted font-medium text-foreground transition-colors"
                  >
                    <UserIcon className="h-4 w-4 text-primary" /> My Profile
                  </Link>

                  <Link
                    href="/spin-and-win"
                    className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      <Sparkles className="h-4 w-4" /> SuperCoins & Lucky Spin
                    </span>
                    <Badge className="bg-amber-500 text-slate-950 text-[9px] px-1.5 py-0">VIP</Badge>
                  </Link>

                  <Link
                    href="/account/orders"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-muted font-medium text-foreground transition-colors"
                  >
                    <Package className="h-4 w-4 text-primary" /> Orders & Tracking
                  </Link>

                  <Link
                    href="/account/wishlist"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-muted font-medium text-foreground transition-colors"
                  >
                    <Heart className="h-4 w-4 text-rose-500" /> Wishlist
                  </Link>

                  <Link
                    href="/account/notifications"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-muted font-medium text-foreground transition-colors"
                  >
                    <Bell className="h-4 w-4 text-primary" /> Notifications
                  </Link>

                  {user && (
                    <div className="pt-1 border-t mt-1">
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-500/10 text-rose-600 font-bold transition-colors text-left"
                      >
                        <LogOut className="h-4 w-4" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Become a Seller */}
          <Link href="/seller/onboarding" className="hidden lg:flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl hover:bg-muted transition-colors">
            <Store className="h-4 w-4 text-primary" />
            <span>Become a Seller</span>
          </Link>

          {/* Resell (Meesho Model) */}
          <Link href="/reseller" className="hidden xl:flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 px-3 py-2 rounded-xl hover:bg-emerald-500/10 transition-colors">
            <span>Resell & Earn</span>
            <Badge className="bg-emerald-500 text-white text-[9px] px-1.5 py-0">₹0</Badge>
          </Link>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-xl h-9 w-9"
            aria-label="Toggle theme"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Cart with Live Count */}
          <Link href="/cart">
            <Button variant="outline" className="relative rounded-xl gap-2 px-3.5 h-10 font-bold border-2 hover:border-primary/50 shadow-xs">
              <ShoppingCart className="h-4 w-4 text-primary" />
              <span className="hidden sm:inline">Cart</span>
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 h-5 min-w-5 px-1 bg-amber-500 text-slate-950 text-xs font-black rounded-full flex items-center justify-center shadow-md animate-bounce">
                  {itemCount}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
