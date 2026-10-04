"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Trash2,
  Bookmark,
  ArrowRight,
  ShieldCheck,
  Truck,
  Tag,
  Check,
  X,
  Sparkles,
} from "lucide-react";
import {
  fetchCart,
  updateCartItemQuantity,
  removeCartItem,
  toggleSaveForLater,
  applyCouponApi,
  removeCouponApi,
  CartResponseData,
} from "@/services/cart";
import { formatPrice } from "@/lib/currency";
import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartResponseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const clearStoreCart = useCartStore((state) => state.clearCart);

  const loadCart = async () => {
    try {
      const data = await fetchCart();
      setCart(data);
    } catch (err) {
      console.error("Failed to load cart", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleUpdateQty = async (variantId: string, qty: number) => {
    try {
      const updated = await updateCartItemQuantity(variantId, qty);
      setCart(updated);
    } catch (err) {
      console.error("Failed to update qty", err);
    }
  };

  const handleRemove = async (variantId: string) => {
    try {
      const updated = await removeCartItem(variantId);
      setCart(updated);
    } catch (err) {
      console.error("Failed to remove item", err);
    }
  };

  const handleToggleSaveLater = async (variantId: string) => {
    try {
      const updated = await toggleSaveForLater(variantId);
      setCart(updated);
    } catch (err) {
      console.error("Failed to save for later", err);
    }
  };

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = codeToApply || couponInput.trim();
    if (!code) return;
    setCouponError("");
    setApplyingCoupon(true);
    try {
      const updated = await applyCouponApi(code);
      setCart(updated);
      setCouponInput("");
    } catch (err: any) {
      setCouponError(err?.response?.data?.message || "Invalid coupon code");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      const updated = await removeCouponApi();
      setCart(updated);
    } catch (err) {
      console.error("Failed to remove coupon", err);
    }
  };

  if (loading) {
    return (
      <div className="container py-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  const hasItems = cart && cart.items.length > 0;
  const progressPercent = cart
    ? Math.min(100, Math.round((cart.subtotal_paise / cart.free_shipping_threshold_paise) * 100))
    : 0;

  if (!hasItems && (!cart?.saved_for_later || cart.saved_for_later.length === 0)) {
    return (
      <div className="container py-20 text-center space-y-6 max-w-md mx-auto">
        <div className="h-24 w-24 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-inner">
          <ShoppingBag className="h-12 w-12" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Your Shopping Cart is Empty</h2>
          <p className="text-sm text-muted-foreground">
            Explore 200+ top electronics, fashion, and footwear deals with express delivery!
          </p>
        </div>
        <Link href="/products">
          <Button size="lg" className="rounded-full px-8 font-bold shadow-lg">
            Start Shopping Now <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8 pb-20">
      <div className="flex items-center justify-between pb-4 border-b">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Shopping Cart</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {cart?.items.length} {cart?.items.length === 1 ? "item" : "items"} in your cart
          </p>
        </div>
        <Link href="/products" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
          Continue Shopping <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Free Shipping Progress Bar */}
      {cart && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 border border-primary/20 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-foreground">
              <Truck className="h-4 w-4 text-primary" />
              {cart.free_shipping_remaining_paise === 0 ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  🎉 Congratulations! You&apos;ve unlocked FREE Express Delivery!
                </span>
              ) : (
                <span>
                  Add <strong>{formatPrice(cart.free_shipping_remaining_paise)}</strong> more to get{" "}
                  <strong className="text-primary">FREE Delivery</strong>
                </span>
              )}
            </span>
            <span className="text-muted-foreground">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Cart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Cart Items & Saved for later */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            {cart?.items.map((item) => (
              <Card key={item.variant_id} className="p-4 rounded-2xl hover:shadow-md transition-all">
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <Link href={`/products/${item.product_slug}`} className="relative h-24 w-24 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                    <Image src={item.image_url} alt={item.title} fill className="object-cover" sizes="96px" />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between space-y-2">
                    <div className="space-y-1">
                      <Link href={`/products/${item.product_slug}`}>
                        <h3 className="text-sm font-semibold text-foreground hover:text-primary transition-colors line-clamp-1">
                          {item.title}
                        </h3>
                      </Link>
                      {item.selected_attributes && Object.keys(item.selected_attributes).length > 0 && (
                        <div className="flex flex-wrap gap-1 text-[11px] text-muted-foreground">
                          {Object.entries(item.selected_attributes).map(([k, v]) => (
                            <span key={k} className="bg-muted px-2 py-0.5 rounded-md">
                              {k}: {v}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t">
                      {/* Price */}
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-bold text-foreground">
                          {formatPrice(item.unit_price_paise * item.quantity)}
                        </span>
                        {item.compare_at_price_paise && (
                          <span className="text-xs text-muted-foreground line-through">
                            {formatPrice(item.compare_at_price_paise * item.quantity)}
                          </span>
                        )}
                      </div>

                      {/* Quantity & Actions */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border rounded-xl bg-background">
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(item.variant_id, item.quantity - 1)}
                            className="px-2.5 py-1 text-sm text-muted-foreground hover:text-foreground font-bold"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-semibold">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(item.variant_id, item.quantity + 1)}
                            className="px-2.5 py-1 text-sm text-muted-foreground hover:text-foreground font-bold"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleSaveLater(item.variant_id)}
                          className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 font-medium"
                          title="Save for Later"
                        >
                          <Bookmark className="h-3.5 w-3.5" /> Save
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemove(item.variant_id)}
                          className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1 font-medium"
                          title="Remove item"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Saved For Later Section */}
          {cart?.saved_for_later && cart.saved_for_later.length > 0 && (
            <div className="space-y-4 pt-6 border-t">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Bookmark className="h-4 w-4 text-primary" /> Saved for Later ({cart.saved_for_later.length})
              </h3>
              <div className="space-y-3">
                {cart.saved_for_later.map((item) => (
                  <Card key={item.variant_id} className="p-3.5 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                        <Image src={item.image_url} alt={item.title} fill className="object-cover" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold line-clamp-1">{item.title}</h4>
                        <span className="text-xs font-bold text-foreground">{formatPrice(item.unit_price_paise)}</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleSaveLater(item.variant_id)}
                      className="rounded-xl text-xs"
                    >
                      Move to Cart
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Coupons & Price Summary */}
        <div className="space-y-6">
          {/* Coupon Box */}
          <Card className="p-5 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold">
              <Tag className="h-4 w-4 text-primary" />
              <span>Apply Coupons & Promos</span>
            </div>

            {cart?.applied_coupon_code ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                <div className="flex items-center gap-1.5">
                  <Check className="h-4 w-4" />
                  <span>&apos;{cart.applied_coupon_code}&apos; Applied (-{formatPrice(cart.discount_paise)})</span>
                </div>
                <button onClick={handleRemoveCoupon} className="text-rose-500 hover:underline">
                  Remove
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter coupon code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="h-10 text-xs uppercase"
                  />
                  <Button
                    size="sm"
                    onClick={() => handleApplyCoupon()}
                    disabled={applyingCoupon || !couponInput.trim()}
                    className="rounded-xl px-4"
                  >
                    Apply
                  </Button>
                </div>

                {couponError && <p className="text-xs text-rose-500">{couponError}</p>}

                {/* Quick Coupon Tags */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-muted-foreground">Available Coupons:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {["WELCOME100", "FESTIVE20", "FREESHIP"].map((code) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => handleApplyCoupon(code)}
                        className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-muted hover:bg-primary hover:text-white border border-dashed transition-colors"
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Price Summary Breakdown */}
          <Card className="p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-base text-foreground">Order Summary</h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Subtotal ({cart?.items.length} items)</span>
                <span className="text-foreground font-semibold">{formatPrice(cart?.subtotal_paise || 0)}</span>
              </div>

              {cart && cart.discount_paise > 0 && (
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Coupon Discount</span>
                  <span>-{formatPrice(cart.discount_paise)}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-muted-foreground">
                <span>Delivery Charges</span>
                <span>
                  {cart?.shipping_fee_paise === 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">FREE</span>
                  ) : (
                    formatPrice(cart?.shipping_fee_paise || 0)
                  )}
                </span>
              </div>

              <div className="pt-3 border-t flex items-baseline justify-between text-base font-black text-foreground">
                <span>Total Amount</span>
                <span>{formatPrice(cart?.total_amount_paise || 0)}</span>
              </div>

              {cart && cart.total_savings_paise > 0 && (
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-center text-[11px] font-bold">
                  You will save {formatPrice(cart.total_savings_paise)} on this order!
                </div>
              )}
            </div>

            <Link href="/checkout" className="block w-full pt-2">
              <Button size="lg" className="w-full rounded-2xl h-12 text-base font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md">
                Proceed to Checkout <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>

            {/* Guarantees */}
            <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground pt-2">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Secure Payments
              </span>
              <span>•</span>
              <span>Easy 7-Day Returns</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
