"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Store, ShieldCheck, Landmark, MapPin, ArrowRight } from "lucide-react";
import { submitSellerOnboarding } from "@/services/seller";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SellerOnboardingPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    store_name: "",
    store_description: "",
    gst_number: "",
    pan_number: "",
    pickup_address: {
      address_line1: "",
      city: "",
      state: "",
      pincode: "",
    },
    bank_details: {
      account_holder_name: "",
      account_number: "",
      ifsc_code: "",
      bank_name: "",
      upi_id: "",
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitSellerOnboarding(form);
      alert("Seller store activated successfully! Welcome to ShopVerse Merchant Network.");
      router.push("/seller/dashboard");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to complete seller onboarding");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-12 max-w-3xl space-y-8 pb-24">
      <div className="text-center space-y-2">
        <div className="h-16 w-16 rounded-3xl bg-amber-500/15 text-amber-600 flex items-center justify-center mx-auto shadow-md">
          <Store className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-black text-foreground">Become a ShopVerse Seller</h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
          Start selling to millions of shoppers across India. Get verified, list your catalog, and receive automated payouts with just 8% platform fee.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Store Profile */}
        <Card className="p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 font-bold text-sm text-foreground">
            <Store className="h-4 w-4 text-primary" /> 1. Store Profile
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground">Store Display Name *</label>
            <Input
              required
              placeholder="e.g. Apex Tech Retail"
              value={form.store_name}
              onChange={(e) => setForm({ ...form, store_name: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground">Store Description</label>
            <Input
              placeholder="Brief summary of your business & products"
              value={form.store_description}
              onChange={(e) => setForm({ ...form, store_description: e.target.value })}
            />
          </div>
        </Card>

        {/* KYC Verification */}
        <Card className="p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 font-bold text-sm text-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald-500" /> 2. KYC & Business Verification
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-foreground">GSTIN (15 Digits) *</label>
              <Input
                required
                placeholder="27AABCU9603R1ZN"
                value={form.gst_number}
                onChange={(e) => setForm({ ...form, gst_number: e.target.value.toUpperCase() })}
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">Business PAN (10 Digits) *</label>
              <Input
                required
                placeholder="AABCU9603R"
                value={form.pan_number}
                onChange={(e) => setForm({ ...form, pan_number: e.target.value.toUpperCase() })}
              />
            </div>
          </div>
        </Card>

        {/* Bank Details */}
        <Card className="p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 font-bold text-sm text-foreground">
            <Landmark className="h-4 w-4 text-amber-500" /> 3. Bank Account for Direct Payouts
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground">Account Holder Name *</label>
            <Input
              required
              placeholder="Full name as per bank records"
              value={form.bank_details.account_holder_name}
              onChange={(e) =>
                setForm({
                  ...form,
                  bank_details: { ...form.bank_details, account_holder_name: e.target.value },
                })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Bank Account Number *</label>
              <Input
                required
                placeholder="Account number"
                value={form.bank_details.account_number}
                onChange={(e) =>
                  setForm({
                    ...form,
                    bank_details: { ...form.bank_details, account_number: e.target.value },
                  })
                }
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">IFSC Code (11 Digits) *</label>
              <Input
                required
                placeholder="HDFC0001234"
                value={form.bank_details.ifsc_code}
                onChange={(e) =>
                  setForm({
                    ...form,
                    bank_details: { ...form.bank_details, ifsc_code: e.target.value.toUpperCase() },
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Bank Name *</label>
              <Input
                required
                placeholder="e.g. HDFC Bank, SBI, ICICI"
                value={form.bank_details.bank_name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    bank_details: { ...form.bank_details, bank_name: e.target.value },
                  })
                }
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">UPI ID (Optional)</label>
              <Input
                placeholder="storename@okhdfcbank"
                value={form.bank_details.upi_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    bank_details: { ...form.bank_details, upi_id: e.target.value },
                  })
                }
              />
            </div>
          </div>
        </Card>

        {/* Pickup Address */}
        <Card className="p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 font-bold text-sm text-foreground">
            <MapPin className="h-4 w-4 text-purple-500" /> 4. Courier Pickup Warehouse Address
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground">Warehouse / Facility Address *</label>
            <Input
              required
              placeholder="Warehouse number, building, street"
              value={form.pickup_address.address_line1}
              onChange={(e) =>
                setForm({
                  ...form,
                  pickup_address: { ...form.pickup_address, address_line1: e.target.value },
                })
              }
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              required
              placeholder="City"
              value={form.pickup_address.city}
              onChange={(e) =>
                setForm({
                  ...form,
                  pickup_address: { ...form.pickup_address, city: e.target.value },
                })
              }
            />
            <Input
              required
              placeholder="State"
              value={form.pickup_address.state}
              onChange={(e) =>
                setForm({
                  ...form,
                  pickup_address: { ...form.pickup_address, state: e.target.value },
                })
              }
            />
            <Input
              required
              placeholder="PIN Code"
              maxLength={6}
              value={form.pickup_address.pincode}
              onChange={(e) =>
                setForm({
                  ...form,
                  pickup_address: { ...form.pickup_address, pincode: e.target.value },
                })
              }
            />
          </div>
        </Card>

        <Button
          type="submit"
          disabled={submitting}
          size="lg"
          className="w-full rounded-2xl h-12 text-base font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-lg"
        >
          {submitting ? "Activating Merchant Account..." : "Complete Onboarding & Start Selling"}
        </Button>
      </form>
    </div>
  );
}
