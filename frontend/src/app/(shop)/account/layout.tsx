"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  User,
  Package,
  MapPin,
  Heart,
  Wallet,
  Bell,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { logoutApi } from "@/services/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/currency";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const navItems = [
    { label: "My Profile", href: "/account/profile", icon: User },
    { label: "My Orders", href: "/account/orders", icon: Package },
    { label: "Saved Addresses", href: "/account/addresses", icon: MapPin },
    { label: "Wishlist", href: "/account/wishlist", icon: Heart },
    { label: "Wallet & Loyalty", href: "/account/wallet", icon: Wallet },
    { label: "Notifications", href: "/account/notifications", icon: Bell },
  ];

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch (e) {}
    logout();
    router.push("/login");
  };

  return (
    <div className="container py-8 space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Customer Account</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your profile, track shipments, check saved addresses & wallet rewards
          </p>
        </div>
        {user && (
          <div className="flex items-center gap-3">
            <div className="text-right text-xs hidden sm:block">
              <span className="font-bold text-foreground block">{user.full_name}</span>
              <span className="text-muted-foreground">{user.email || user.phone}</span>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black">
              {user.full_name[0]}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <aside className="space-y-4">
          <Card className="p-2 rounded-2xl overflow-hidden divide-y">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/account/profile" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-4 py-3 text-xs font-semibold rounded-xl transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                </Link>
              );
            })}
          </Card>

          {/* Quick Wallet Summary Card */}
          {user && (
            <Card className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-primary/5 to-purple-500/10 border space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-foreground">
                <span className="flex items-center gap-1.5">
                  <Wallet className="h-4 w-4 text-amber-500" /> Wallet Balance
                </span>
                <span>{formatPrice(user.wallet_balance_paise || 0)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Loyalty Points:</span>
                <span className="font-bold text-primary">{user.loyalty_points || 0} pts</span>
              </div>
            </Card>
          )}

          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-xs font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-xl"
          >
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </aside>

        {/* Account Page Content */}
        <main className="col-span-1 md:col-span-3">{children}</main>
      </div>
    </div>
  );
}
