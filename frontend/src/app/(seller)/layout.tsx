"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Boxes,
  Truck,
  DollarSign,
  Store,
  LogOut,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { logoutApi } from "@/services/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const navItems = [
    { label: "Overview", href: "/seller/dashboard", icon: LayoutDashboard },
    { label: "Products", href: "/seller/products", icon: Package },
    { label: "Inventory", href: "/seller/inventory", icon: Boxes },
    { label: "Orders & Shipping", href: "/seller/orders", icon: Truck },
    { label: "Payouts & Earnings", href: "/seller/payouts", icon: DollarSign },
  ];

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch (e) {}
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar Nav */}
      <aside className="w-full md:w-64 border-r bg-card p-4 flex flex-col justify-between space-y-6">
        <div className="space-y-6">
          {/* Brand */}
          <div className="flex items-center justify-between px-2">
            <Link href="/seller/dashboard" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white font-black">
                S
              </div>
              <span className="font-bold text-base tracking-tight">
                Shop<span className="text-amber-500">Seller</span> Hub
              </span>
            </Link>
          </div>

          {/* Seller Store Badge */}
          <div className="p-3 rounded-2xl bg-muted/40 border space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <Store className="h-3.5 w-3.5 text-amber-500" />
              <span className="truncate">{user?.full_name || "Verified Store"}</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              <ShieldCheck className="h-3 w-3" /> Verified Merchant (8% Comm.)
            </div>
          </div>

          {/* Nav items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-amber-500 text-slate-950 shadow-sm font-bold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="space-y-2 pt-4 border-t text-xs">
          <Link href="/" target="_blank">
            <Button variant="ghost" size="sm" className="w-full justify-start text-xs rounded-xl gap-2">
              <ExternalLink className="h-3.5 w-3.5" /> View Storefront
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start text-xs rounded-xl gap-2 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
