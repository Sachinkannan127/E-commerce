"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Store,
  Users,
  Package,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { fetchAdminStats, AdminStatsData } from "@/services/admin";
import { formatPrice } from "@/lib/currency";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchAdminStats();
        setStats(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading || !stats) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Platform Control Tower</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time analytics across buyers, verified sellers, transactions, and commissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/reports">
            <Button size="sm" variant="outline" className="rounded-xl text-xs font-semibold">
              Financial Reports & Tax Export
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* GMV */}
        <Card className="p-5 rounded-3xl space-y-2 border bg-gradient-to-br from-primary/10 via-background to-background">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Gross Merchandise Value (GMV)</span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-foreground">
            {formatPrice(stats.gmv_paise)}
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            Total sales processed across all sellers
          </p>
        </Card>

        {/* Platform Commission Revenue */}
        <Card className="p-5 rounded-3xl space-y-2 border bg-gradient-to-br from-emerald-500/10 via-background to-background">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Platform Net Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatPrice(stats.platform_revenue_paise)}
          </div>
          <p className="text-[11px] text-muted-foreground">8% Average Commission Revenue</p>
        </Card>

        {/* Orders Volume */}
        <Card className="p-5 rounded-3xl space-y-2 border">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Total Orders Placed</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-foreground">{stats.total_orders}</div>
          <p className="text-[11px] text-muted-foreground">Across customer accounts</p>
        </Card>

        {/* Sellers & Products */}
        <Card className="p-5 rounded-3xl space-y-2 border">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Active Merchants</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <Store className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-foreground">
            {stats.approved_sellers} <span className="text-sm font-normal text-muted-foreground">/ {stats.total_sellers}</span>
          </div>
          <p className="text-[11px] text-primary font-semibold">{stats.total_products} products in catalog</p>
        </Card>
      </div>

      {/* Recent Platform Orders Table */}
      <Card className="p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Latest Platform Transactions</h2>
          <span className="text-xs text-muted-foreground">Live Feed</span>
        </div>

        {stats.recent_orders && stats.recent_orders.length > 0 ? (
          <div className="border rounded-2xl overflow-hidden divide-y text-xs">
            <div className="grid grid-cols-6 p-3.5 bg-muted/50 font-bold text-muted-foreground">
              <span>Order No.</span>
              <span>Customer</span>
              <span>Payment</span>
              <span>Total</span>
              <span>Status</span>
              <span>Timestamp</span>
            </div>
            {stats.recent_orders.map((o) => (
              <div key={o.id} className="grid grid-cols-6 p-3.5 items-center hover:bg-muted/30">
                <span className="font-mono font-bold">#{o.order_number}</span>
                <span>{o.customer_name}</span>
                <span className="text-muted-foreground">{o.payment_method}</span>
                <span className="font-bold">{formatPrice(o.total_amount_paise)}</span>
                <Badge variant={o.order_status === "DELIVERED" ? "success" : "default"} className="w-fit text-[10px]">
                  {o.order_status}
                </Badge>
                <span className="text-muted-foreground">{o.created_at}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground py-8 text-center">No orders recorded yet.</p>
        )}
      </Card>
    </div>
  );
}
