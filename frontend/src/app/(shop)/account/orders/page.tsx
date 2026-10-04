"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Package, ChevronRight, Truck, RotateCcw, Download, Clock } from "lucide-react";
import { apiClient } from "@/services/api";
import { OrderDetailData } from "@/services/checkout";
import { formatPrice } from "@/lib/currency";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState<OrderDetailData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await apiClient.get("/orders");
        setOrders(res.data.data.items);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    );
  }

  const filteredOrders = orders.filter((o) => {
    if (activeFilter === "ALL") return true;
    return o.order_status === activeFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b">
        <div>
          <h2 className="text-xl font-bold">My Orders</h2>
          <p className="text-xs text-muted-foreground">Track shipments, download tax invoices, and manage returns</p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 text-xs">
          {["ALL", "PLACED", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setActiveFilter(status)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
                activeFilter === status
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="p-5 rounded-3xl space-y-4 hover:shadow-md transition-all">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b text-xs">
                <div>
                  <span className="text-muted-foreground">Order: </span>
                  <span className="font-bold text-foreground">#{order.order_number}</span>
                  <span className="text-muted-foreground ml-3">• {order.created_at}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      order.order_status === "DELIVERED"
                        ? "success"
                        : order.order_status === "CANCELLED"
                        ? "destructive"
                        : "default"
                    }
                    className="text-[11px]"
                  >
                    {order.order_status}
                  </Badge>
                  <span className="font-bold text-foreground">{formatPrice(order.total_amount_paise)}</span>
                </div>
              </div>

              {/* Items in order preview */}
              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                        <Image src={item.image_url} alt={item.title} fill className="object-cover" />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-semibold line-clamp-1">{item.title}</h4>
                        <span className="text-[11px] text-muted-foreground">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold">{formatPrice(item.total_price_paise)}</span>
                  </div>
                ))}
              </div>

              {/* Order Footer Actions */}
              <div className="flex items-center justify-between pt-3 border-t">
                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Truck className="h-4 w-4 text-primary" />
                  <span>Delivery to: {order.shipping_address.city}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/account/orders/${order.id}`}>
                    <Button size="sm" variant="outline" className="rounded-xl text-xs">
                      View Order & Tracking <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl border bg-muted/20 space-y-4">
          <Package className="h-12 w-12 mx-auto text-muted-foreground" />
          <p className="text-sm font-semibold">No orders found in this category</p>
          <Link href="/products">
            <Button className="rounded-xl">Start Shopping</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
