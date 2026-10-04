"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Truck, Package, CheckCircle2, Clock, MapPin } from "lucide-react";
import { fetchSellerOrders, updateSellerOrderStatus } from "@/services/seller";
import { formatPrice } from "@/lib/currency";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await fetchSellerOrders();
      setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      await updateSellerOrderStatus(orderId, status);
      load();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b">
        <h1 className="text-2xl font-bold">Seller Orders & Shipments</h1>
        <p className="text-xs text-muted-foreground">Fulfill orders, generate shipping labels, and track delivery progress</p>
      </div>

      <div className="space-y-4">
        {orders.map((o) => (
          <Card key={o.order_id} className="p-6 rounded-3xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b text-xs">
              <div>
                <span className="font-bold text-sm">Order #{o.order_number}</span>
                <span className="text-muted-foreground ml-3">• {o.created_at}</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={o.order_status === "DELIVERED" ? "success" : "default"} className="text-[11px]">
                  {o.order_status}
                </Badge>
                <span className="font-bold text-foreground">
                  Seller Payout: {formatPrice(o.seller_payout_paise)}
                </span>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2">
              {o.items?.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                      {item.image_url && <Image src={item.image_url} alt={item.title} fill className="object-cover" />}
                    </div>
                    <div>
                      <h4 className="font-semibold line-clamp-1">{item.title}</h4>
                      <span className="text-muted-foreground">Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <span className="font-bold">{formatPrice(item.total_price_paise)}</span>
                </div>
              ))}
            </div>

            {/* Shipping Address & Status Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t text-xs">
              <div className="text-muted-foreground flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-primary" />
                <span>
                  Deliver to: <strong>{o.customer_name}</strong> ({o.shipping_address?.city}, {o.shipping_address?.state})
                </span>
              </div>

              <div className="flex items-center gap-2">
                {o.order_status === "PLACED" && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange(o.order_id, "PACKED")}
                    className="rounded-xl text-xs font-semibold"
                  >
                    Pack Item
                  </Button>
                )}
                {o.order_status === "PACKED" && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange(o.order_id, "SHIPPED")}
                    className="rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Ship with Delhivery
                  </Button>
                )}
                {o.order_status === "SHIPPED" && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange(o.order_id, "DELIVERED")}
                    className="rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Mark Delivered
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
