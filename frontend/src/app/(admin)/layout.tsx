"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShieldAlert,
  Users,
  Store,
  Package,
  FolderTree,
  Tag,
  Image,
  FileSpreadsheet,
  LogOut,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { logoutApi } from "@/services/auth";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const navItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: ShieldAlert },
    { label: "Manage Sellers", href: "/admin/sellers", icon: Store },
    { label: "Product Moderation", href: "/admin/products", icon: Package },
    { label: "Categories", href: "/admin/categories", icon: FolderTree },
    { label: "Coupons & Promos", href: "/admin/coupons", icon: Tag },
    { label: "CMS & Banners", href: "/admin/cms", icon: Image },
    { label: "Financial Reports", href: "/admin/reports", icon: FileSpreadsheet },
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
          {/* Logo */}
          <div className="flex items-center justify-between px-2">
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center text-white font-black">
                A
              </div>
              <span className="font-bold text-base tracking-tight">
                Shop<span className="text-primary">Admin</span> Tower
              </span>
            </Link>
          </div>

          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs space-y-1">
            <div className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" /> Super Administrator
            </div>
            <p className="text-[10px] text-muted-foreground">{user?.email || "admin@shopverse.in"}</p>
          </div>

          {/* Navigation links */}
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
                      ? "bg-primary text-primary-foreground shadow-sm font-bold"
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
