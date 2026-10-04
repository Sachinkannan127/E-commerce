"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  DollarSign,
  Package,
  Boxes,
  Truck,
  AlertTriangle,
  Plus,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { fetchSellerKpis, SellerKpiData } from "@/services/seller";
import { formatPrice } from "@/lib/currency";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function SellerDashboardPage() {
  const [kpis, setKpis] = useState<SellerKpiData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchSellerKpis();
        setKpis(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading || !kpis) {
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
      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{kpis.store_name}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Seller Central Dashboard • 8% Standard Platform Commission
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/seller/products/new">
            <Button size="sm" className="rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 gap-1.5 shadow-md">
              <Plus className="h-4 w-4" /> Add New Product
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Earnings */}
        <Card className="p-5 rounded-3xl space-y-2 border bg-gradient-to-br from-emerald-500/10 via-background to-background">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Lifetime Earnings</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-foreground">
            {formatPrice(kpis.lifetime_earnings_paise)}
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            Net payout credited after commissions
          </p>
        </Card>

        {/* Pending Payout */}
        <Card className="p-5 rounded-3xl space-y-2 border bg-gradient-to-br from-amber-500/10 via-background to-background">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Pending Payout</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-foreground">
            {formatPrice(kpis.pending_payout_paise)}
          </div>
          <Link href="/seller/payouts" className="text-[11px] text-primary hover:underline font-semibold block">
            Request Bank Payout →
          </Link>
        </Card>

        {/* Orders */}
        <Card className="p-5 rounded-3xl space-y-2 border">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Fulfilled Orders</span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Truck className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-foreground">
            {kpis.total_orders_fulfilled}
          </div>
          <p className="text-[11px] text-muted-foreground">Processed shipments</p>
        </Card>

        {/* Products / Low stock */}
        <Card className="p-5 rounded-3xl space-y-2 border">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Catalog & Stock</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
              <Boxes className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-foreground">
            {kpis.active_products_count} <span className="text-sm font-normal text-muted-foreground">items</span>
          </div>
          {kpis.low_stock_count > 0 ? (
            <span className="text-[11px] text-rose-500 font-semibold flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> {kpis.low_stock_count} low stock warnings
            </span>
          ) : (
            <span className="text-[11px] text-emerald-600 font-semibold">All items healthy</span>
          )}
        </Card>
      </div>

      {/* Recent Orders Section */}
      <Card className="p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Recent Customer Orders</h2>
          <Link href="/seller/orders" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
            View All Orders <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {kpis.recent_orders.length > 0 ? (
          <div className="border rounded-2xl overflow-hidden divide-y text-xs">
            <div className="grid grid-cols-5 p-3 bg-muted/50 font-bold text-muted-foreground">
              <span>Order No.</span>
              <span>Customer</span>
              <span>City</span>
              <span>Total</span>
              <span>Status</span>
            </div>
            {kpis.recent_orders.map((o) => (
              <div key={o.id} className="grid grid-cols-5 p-3.5 items-center hover:bg-muted/30">
                <span className="font-mono font-bold">#{o.order_number}</span>
                <span>{o.customer_name}</span>
                <span className="text-muted-foreground">{o.city}</span>
                <span className="font-bold">{formatPrice(o.total_amount_paise)}</span>
                <Badge variant={o.order_status === "DELIVERED" ? "success" : "default"} className="w-fit text-[10px]">
                  {o.order_status}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground py-8 text-center">No orders received yet.</p>
        )}
      </Card>
    </div>
  );
}
