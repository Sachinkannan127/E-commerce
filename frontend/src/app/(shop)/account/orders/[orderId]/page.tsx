"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  Truck,
  MapPin,
  Download,
  Clock,
  RotateCcw,
  XCircle,
  Star,
  CheckCircle2,
  ChevronLeft,
} from "lucide-react";
import { fetchOrderDetail, OrderDetailData } from "@/services/checkout";
import { submitProductReview } from "@/services/review";
import { apiClient } from "@/services/api";
import { formatPrice } from "@/lib/currency";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.orderId as string;

  const [order, setOrder] = useState<OrderDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  // Return modal state
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState("Defective or damaged product");
  const [returnComments, setReturnComments] = useState("");
  const [submittingReturn, setSubmittingReturn] = useState(false);

  // Review modal state
  const [reviewProduct, setReviewProduct] = useState<any | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    async function load() {
      if (!orderId) return;
      try {
        const data = await fetchOrderDetail(orderId);
        setOrder(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [orderId]);

  const handleCancelOrder = async () => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    try {
      const res = await apiClient.post(`/orders/${orderId}/cancel`, {
        reason: "Customer requested cancellation before shipment",
      });
      setOrder(res.data.data);
      alert("Order cancelled successfully");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to cancel order");
    }
  };

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReturn(true);
    try {
      const res = await apiClient.post(`/orders/${orderId}/return`, {
        reason: returnReason,
        comments: returnComments,
      });
      setOrder(res.data.data);
      setShowReturnModal(false);
      alert("Return request submitted successfully. Seller will review within 24 hours.");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to submit return request");
    } finally {
      setSubmittingReturn(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewProduct) return;
    setSubmittingReview(true);
    try {
      await submitProductReview(reviewProduct.product_id, {
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      });
      setReviewProduct(null);
      alert("Review submitted successfully! Thank you for your feedback.");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDownloadInvoice = () => {
    window.open(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/orders/${order?.order_number}/invoice`, "_blank");
  };

  if (loading || !order) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const canCancel = ["PLACED", "CONFIRMED"].includes(order.order_status);
  const canReturn = order.order_status === "DELIVERED";

  return (
    <div className="space-y-6">
      {/* Back button & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <Link href="/account/orders" className="text-xs text-primary hover:underline flex items-center gap-1 mb-1">
            <ChevronLeft className="h-3.5 w-3.5" /> Back to My Orders
          </Link>
          <h2 className="text-2xl font-black">Order #{order.order_number}</h2>
          <p className="text-xs text-muted-foreground">Placed on {order.created_at}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleDownloadInvoice} className="rounded-xl gap-1.5 text-xs font-semibold">
            <Download className="h-4 w-4" /> Download Tax Invoice (PDF)
          </Button>

          {canCancel && (
            <Button size="sm" variant="destructive" onClick={handleCancelOrder} className="rounded-xl text-xs">
              Cancel Order
            </Button>
          )}

          {canReturn && (
            <Button size="sm" variant="outline" onClick={() => setShowReturnModal(true)} className="rounded-xl text-xs gap-1">
              <RotateCcw className="h-3.5 w-3.5" /> Return / Replace
            </Button>
          )}
        </div>
      </div>

      {/* Tracking Timeline Card */}
      <Card className="p-6 rounded-3xl space-y-4">
        <h3 className="font-bold text-base flex items-center gap-2">
          <Truck className="h-5 w-5 text-primary" /> Delivery & Shipment Timeline
        </h3>

        <div className="relative border-l-2 border-primary/30 ml-4 space-y-6 pl-6 py-2">
          {order.timeline.map((step, idx) => (
            <div key={idx} className="relative">
              <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-primary ring-4 ring-background" />
              <div>
                <h4 className="font-bold text-sm text-foreground">{step.title}</h4>
                <p className="text-xs text-muted-foreground">{step.description}</p>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Clock className="h-3 w-3" /> {new Date(step.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Ordered Items with Write Review */}
      <Card className="p-6 rounded-3xl space-y-4">
        <h3 className="font-bold text-base flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" /> Ordered Products ({order.items.length})
        </h3>

        <div className="divide-y">
          {order.items.map((item, idx) => (
            <div key={idx} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                  <Image src={item.image_url} alt={item.title} fill className="object-cover" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold">{item.title}</h4>
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-base font-bold text-foreground">
                  {formatPrice(item.total_price_paise)}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setReviewProduct(item)}
                  className="rounded-xl text-xs gap-1"
                >
                  <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" /> Write Review
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Shipping Address & Payment Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card className="p-5 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <MapPin className="h-4 w-4 text-primary" /> Delivery Address
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>{order.shipping_address.full_name}</strong> • {order.shipping_address.phone}
            <br />
            {order.shipping_address.address_line1}, {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
          </p>
        </Card>

        <Card className="p-5 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Payment Details
          </div>
          <p className="text-xs text-muted-foreground">
            <strong>Method:</strong> {order.payment_method}
            <br />
            <strong>Status:</strong> {order.payment_status}
            <br />
            <strong>Total Amount:</strong> {formatPrice(order.total_amount_paise)}
          </p>
        </Card>
      </div>

      {/* Return Request Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="p-6 rounded-3xl max-w-md w-full space-y-4">
            <h3 className="font-bold text-lg">Request Return / Replacement</h3>
            <form onSubmit={handleReturnSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Select Reason</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border bg-background"
                >
                  <option value="Defective or damaged product">Defective or damaged product</option>
                  <option value="Wrong item or size delivered">Wrong item or size delivered</option>
                  <option value="Quality not as expected">Quality not as expected</option>
                  <option value="Missing items or parts">Missing items or parts</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Additional Comments</label>
                <textarea
                  placeholder="Describe the issue in detail..."
                  rows={3}
                  value={returnComments}
                  onChange={(e) => setReturnComments(e.target.value)}
                  className="w-full p-3 rounded-xl border bg-background text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowReturnModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submittingReturn}>
                  {submittingReturn ? "Submitting..." : "Submit Return Request"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Write Review Modal */}
      {reviewProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="p-6 rounded-3xl max-w-md w-full space-y-4">
            <h3 className="font-bold text-lg">Review Product</h3>
            <p className="text-xs text-muted-foreground">{reviewProduct.title}</p>
            <form onSubmit={handleReviewSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= reviewRating ? "text-amber-500 fill-amber-500" : "text-muted"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Review Title</label>
                <Input
                  required
                  placeholder="e.g. Great quality and fast shipping!"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Review Description</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Share your experience with this product..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full p-3 rounded-xl border bg-background text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setReviewProduct(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submittingReview}>
                  {submittingReview ? "Submitting..." : "Post Review"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
