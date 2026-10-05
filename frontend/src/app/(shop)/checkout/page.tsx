"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  MapPin,
  CheckCircle2,
  Plus,
  CreditCard,
  QrCode,
  Banknote,
  Wallet,
  ShieldCheck,
  Lock,
  ArrowRight,
} from "lucide-react";
import { fetchUserAddresses, createUserAddress, AddressData } from "@/services/user";
import { fetchCheckoutSummary, placeOrderApi, CheckoutSummaryData } from "@/services/checkout";
import { fetchCart, CartResponseData } from "@/services/cart";
import { formatPrice } from "@/lib/currency";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const clearStoreCart = useCartStore((state) => state.clearCart);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [addresses, setAddresses] = useState<AddressData[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [summary, setSummary] = useState<CheckoutSummaryData | null>(null);
  const [cartData, setCartData] = useState<CartResponseData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "RAZORPAY" | "STRIPE" | "WALLET">("COD");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showNewAddressModal, setShowNewAddressModal] = useState(false);

  // New address form state
  const [newAddr, setNewAddr] = useState({
    full_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    address_type: "HOME" as const,
    country: "India",
    is_default: true,
  });

  const storeItems = useCartStore((state) => state.items);
  const storeSubtotal = useCartStore((state) => state.getSubtotal());
  const storeShipping = useCartStore((state) => state.getShippingFee());
  const storeTotal = useCartStore((state) => state.getTotal());
  const storeDiscount = useCartStore((state) => state.discountPaise);
  const storeCoupon = useCartStore((state) => state.couponCode);

  useEffect(() => {
    async function loadData() {
      try {
        const [addrs, cart] = await Promise.allSettled([fetchUserAddresses(), fetchCart()]);
        const addressList = addrs.status === "fulfilled" ? addrs.value : [];
        const cartResult = cart.status === "fulfilled" ? cart.value : null;

        setAddresses(addressList);
        setCartData(cartResult);

        if (addressList.length > 0) {
          const defaultAddr = addressList.find((a) => a.is_default) || addressList[0];
          setSelectedAddressId(defaultAddr.id);
          const sum = await fetchCheckoutSummary(defaultAddr.id);
          setSummary(sum);
        } else {
          const sum = await fetchCheckoutSummary();
          setSummary(sum);
        }
      } catch (err) {
        console.error("Failed to load checkout data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleAddressSelect = async (addrId: string) => {
    setSelectedAddressId(addrId);
    try {
      const sum = await fetchCheckoutSummary(addrId);
      if (sum && sum.items_count > 0) {
        setSummary(sum);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      // Prompt sign in to save address to account
      const guestAddr: AddressData = {
        id: "guest-addr-" + Date.now(),
        user_id: "guest",
        ...newAddr,
      };
      setAddresses([...addresses, guestAddr]);
      setSelectedAddressId(guestAddr.id);
      setShowNewAddressModal(false);
      return;
    }

    try {
      const created = await createUserAddress(newAddr);
      setAddresses([...addresses, created]);
      setSelectedAddressId(created.id);
      setShowNewAddressModal(false);
      const sum = await fetchCheckoutSummary(created.id);
      if (sum && sum.items_count > 0) {
        setSummary(sum);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/checkout`);
      return;
    }

    if (!selectedAddressId) {
      alert("Please select a delivery address");
      setStep(1);
      return;
    }

    setSubmitting(true);
    try {
      const order = await placeOrderApi({
        address_id: selectedAddressId,
        payment_method: paymentMethod,
        coupon_code: summary?.coupon_code || storeCoupon || undefined,
      });

      clearStoreCart();
      router.push(`/order-success/${order.id}`);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  // Resolved display values from server summary or local store
  const displayItems = (cartData?.items && cartData.items.length > 0) ? cartData.items : storeItems;
  const subtotalPaise = summary && summary.items_count > 0 ? summary.subtotal_paise : storeSubtotal;
  const shippingPaise = summary && summary.items_count > 0 ? summary.shipping_fee_paise : storeShipping;
  const discountPaise = summary && summary.items_count > 0 ? summary.discount_paise : storeDiscount;
  const taxPaise = summary && summary.items_count > 0 ? summary.tax_paise : Math.round(subtotalPaise * 0.18);
  const totalAmountPaise = summary && summary.items_count > 0 ? summary.total_amount_paise : storeTotal;

  return (
    <div className="container py-8 space-y-8 max-w-6xl pb-20">
      {/* Checkout Progress Stepper */}
      <div className="flex items-center justify-center gap-4 sm:gap-8 pb-6 border-b">
        {[
          { num: 1, label: "Delivery Address" },
          { num: 2, label: "Order Summary" },
          { num: 3, label: "Payment" },
        ].map((s) => (
          <div key={s.num} className="flex items-center gap-2">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step === s.num
                  ? "bg-primary text-primary-foreground shadow-md"
                  : step > s.num
                  ? "bg-emerald-600 text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step > s.num ? "✓" : s.num}
            </div>
            <span
              className={`text-xs sm:text-sm font-semibold ${
                step === s.num ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Step Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* STEP 1: Address Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" /> Select Delivery Address
                </h2>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowNewAddressModal(true)}
                  className="rounded-xl gap-1.5"
                >
                  <Plus className="h-4 w-4" /> Add Address
                </Button>
              </div>

              {addresses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <Card
                        key={addr.id}
                        onClick={() => handleAddressSelect(addr.id)}
                        className={`p-4 rounded-2xl cursor-pointer border-2 transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20"
                            : "border-border hover:border-foreground/30"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <span className="font-bold text-sm">{addr.full_name}</span>
                          <Badge variant="secondary" className="text-[10px]">
                            {addr.address_type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                          {addr.address_line1}, {addr.address_line2 ? `${addr.address_line2}, ` : ""}
                          {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        <p className="text-xs font-medium text-foreground mt-2">📞 {addr.phone}</p>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center rounded-2xl border bg-muted/20 space-y-3">
                  <p className="text-sm font-semibold">No saved addresses found</p>
                  <Button onClick={() => setShowNewAddressModal(true)} className="rounded-xl">
                    Add New Delivery Address
                  </Button>
                </div>
              )}

              {addresses.length > 0 && (
                <div className="pt-4 flex justify-end">
                  <Button
                    size="lg"
                    disabled={!selectedAddressId}
                    onClick={() => setStep(2)}
                    className="rounded-2xl px-8 font-bold"
                  >
                    Proceed to Order Review <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Order Items Summary */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">Review Order Items & Delivery</h2>

              <div className="space-y-3">
                {displayItems.map((item: any) => (
                  <Card key={item.variant_id} className="p-3.5 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                        {item.image_url ? (
                          <Image src={item.image_url} alt={item.title} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No img</div>
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-semibold line-clamp-1">{item.title}</h4>
                        <span className="text-xs text-muted-foreground">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-foreground">
                      {formatPrice(item.unit_price_paise * item.quantity)}
                    </span>
                  </Card>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <Button variant="ghost" onClick={() => setStep(1)} className="rounded-xl">
                  Back to Address
                </Button>
                <Button size="lg" onClick={() => setStep(3)} className="rounded-2xl px-8 font-bold">
                  Proceed to Payment <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Payment Method Selection */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Lock className="h-5 w-5 text-emerald-500" /> Select Payment Method
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: "COD", title: "Cash on Delivery", desc: "Pay at your doorstep via Cash or QR", icon: Banknote },
                  { id: "RAZORPAY", title: "UPI / Cards / NetBanking", desc: "Google Pay, PhonePe, Paytm, Visa, Master", icon: QrCode },
                  { id: "STRIPE", title: "International Credit Card", desc: "Fast checkout powered by Stripe", icon: CreditCard },
                  { id: "WALLET", title: "ShopVerse Wallet Balance", desc: `Available: ${formatPrice(user?.wallet_balance_paise || 0)}`, icon: Wallet },
                ].map((m) => {
                  const Icon = m.icon;
                  const isSelected = paymentMethod === m.id;
                  return (
                    <Card
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`p-4 rounded-2xl cursor-pointer border-2 transition-all space-y-2 ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20"
                          : "border-border hover:border-foreground/30"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-sm">
                          <Icon className="h-5 w-5 text-primary" />
                          <span>{m.title}</span>
                        </div>
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-primary" />}
                      </div>
                      <p className="text-xs text-muted-foreground">{m.desc}</p>
                    </Card>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <Button variant="ghost" onClick={() => setStep(2)} className="rounded-xl">
                  Back to Review
                </Button>
                <Button
                  size="lg"
                  disabled={submitting}
                  onClick={handlePlaceOrder}
                  className="rounded-2xl px-8 font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-lg"
                >
                  {submitting ? "Placing Order..." : `Pay ${formatPrice(totalAmountPaise)} & Confirm`}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Summary Sidebar */}
        <div>
          <Card className="p-6 rounded-2xl space-y-4 sticky top-24">
            <h3 className="font-bold text-base text-foreground">Order Details</h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Items Subtotal</span>
                <span className="text-foreground font-semibold">{formatPrice(subtotalPaise)}</span>
              </div>

              {discountPaise > 0 && (
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Promo Discount {summary?.coupon_code || storeCoupon ? `(${summary?.coupon_code || storeCoupon})` : ""}</span>
                  <span>-{formatPrice(discountPaise)}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-muted-foreground">
                <span>Shipping Fee</span>
                <span>
                  {shippingPaise === 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">FREE</span>
                  ) : (
                    formatPrice(shippingPaise)
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between text-muted-foreground">
                <span>Estimated Taxes (18% GST)</span>
                <span>{formatPrice(taxPaise)}</span>
              </div>

              <div className="pt-3 border-t flex items-baseline justify-between text-base font-black text-foreground">
                <span>Total Amount</span>
                <span>{formatPrice(totalAmountPaise)}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-muted/40 text-[11px] text-muted-foreground space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <ShieldCheck className="h-4 w-4 text-emerald-500" /> Safe & Secure Checkout
              </div>
              <p>Your payment credentials and personal details are encrypted and secure.</p>
            </div>
          </Card>
        </div>
      </div>

      {/* New Address Modal */}
      {showNewAddressModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="p-6 rounded-3xl max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg">Add New Delivery Address</h3>
            <form onSubmit={handleCreateAddress} className="space-y-3 text-xs">
              <Input
                placeholder="Full Name"
                required
                value={newAddr.full_name}
                onChange={(e) => setNewAddr({ ...newAddr, full_name: e.target.value })}
              />
              <Input
                placeholder="10-digit Phone Number"
                required
                value={newAddr.phone}
                onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
              />
              <Input
                placeholder="Flat / House No. / Building Name"
                required
                value={newAddr.address_line1}
                onChange={(e) => setNewAddr({ ...newAddr, address_line1: e.target.value })}
              />
              <Input
                placeholder="Street / Colony / Area"
                value={newAddr.address_line2}
                onChange={(e) => setNewAddr({ ...newAddr, address_line2: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="City"
                  required
                  value={newAddr.city}
                  onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                />
                <Input
                  placeholder="State"
                  required
                  value={newAddr.state}
                  onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                />
              </div>
              <Input
                placeholder="6-digit PIN code"
                required
                maxLength={6}
                value={newAddr.pincode}
                onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowNewAddressModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save & Deliver Here</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
