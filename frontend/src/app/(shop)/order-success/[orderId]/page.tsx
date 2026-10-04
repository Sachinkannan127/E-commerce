"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  Download,
  ArrowRight,
  Clock,
} from "lucide-react";
import { fetchOrderDetail, OrderDetailData } from "@/services/checkout";
import { formatPrice } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrderSuccessPage() {
  const params = useParams();
  const orderId = params?.orderId as string;
  const [order, setOrder] = useState<OrderDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fire confetti celebration on order confirmation
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // Confetti fallback
    }

    async function loadOrder() {
      if (!orderId) return;
      try {
        const data = await fetchOrderDetail(orderId);
        setOrder(data);
      } catch (err) {
        console.error("Failed to load order confirmation", err);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId]);

  if (loading || !order) {
    return (
      <div className="container py-12 max-w-3xl space-y-6">
        <Skeleton className="h-24 w-full rounded-3xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="container py-10 max-w-3xl space-y-8 pb-20">
      {/* Confirmation Header Banner */}
      <div className="text-center p-8 rounded-3xl bg-gradient-to-br from-emerald-500/15 via-primary/10 to-purple-500/10 border border-emerald-500/30 space-y-3 shadow-lg">
        <div className="h-16 w-16 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-foreground">Order Confirmed!</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Thank you for shopping with ShopVerse. Your order <strong>#{order.order_number}</strong> has been received and is being prepared by our sellers.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Badge variant="success" className="text-xs px-3 py-1">
            Status: {order.order_status}
          </Badge>
          <Badge variant="secondary" className="text-xs px-3 py-1">
            Payment: {order.payment_status} ({order.payment_method})
          </Badge>
        </div>
      </div>

      {/* Tracking Timeline */}
      <Card className="p-6 rounded-3xl space-y-4">
        <h3 className="font-bold text-base flex items-center gap-2">
          <Truck className="h-5 w-5 text-primary" /> Delivery Status & Tracking
        </h3>

        <div className="relative border-l-2 border-primary/30 ml-4 space-y-6 pl-6 py-2">
          {order.timeline.map((step, idx) => (
            <div key={idx} className="relative">
              <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-primary ring-4 ring-background" />
              <div>
                <h4 className="font-bold text-sm text-foreground">{step.title}</h4>
                <p className="text-xs text-muted-foreground">{step.description}</p>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3" /> {new Date(step.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Ordered Items */}
      <Card className="p-6 rounded-3xl space-y-4">
        <h3 className="font-bold text-base flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" /> Items in this Order ({order.items.length})
        </h3>

        <div className="divide-y">
          {order.items.map((item, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                  <Image src={item.image_url} alt={item.title} fill className="object-cover" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold line-clamp-1">{item.title}</h4>
                  <span className="text-[11px] text-muted-foreground">Qty: {item.quantity}</span>
                </div>
              </div>
              <span className="text-sm font-bold text-foreground">
                {formatPrice(item.total_price_paise)}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t flex items-center justify-between text-base font-black">
          <span>Total Paid:</span>
          <span>{formatPrice(order.total_amount_paise)}</span>
        </div>
      </Card>

      {/* Delivery Address & Actions */}
      <Card className="p-6 rounded-3xl space-y-3">
        <div className="flex items-center gap-2 font-bold text-sm">
          <MapPin className="h-4 w-4 text-primary" /> Shipping Address
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong>{order.shipping_address.full_name}</strong> • {order.shipping_address.phone}
          <br />
          {order.shipping_address.address_line1}, {order.shipping_address.address_line2 ? `${order.shipping_address.address_line2}, ` : ""}
          {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
        </p>
      </Card>

      {/* Next Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
        <Link href="/products" className="w-full sm:flex-1">
          <Button size="lg" className="w-full rounded-2xl font-bold">
            Continue Shopping <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
