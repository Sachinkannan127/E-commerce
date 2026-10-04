"use client";

import { useState, useEffect } from "react";
import { Tag, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { fetchAdminCoupons, createAdminCoupon, deleteAdminCoupon } from "@/services/admin";
import { formatPrice } from "@/lib/currency";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    code: "",
    description: "",
    discount_type: "PERCENTAGE" as const,
    discount_value: 15,
    min_cart_value_paise: 49900,
    max_discount_paise: 50000,
    valid_days: 30,
  });

  const load = async () => {
    try {
      const data = await fetchAdminCoupons();
      setCoupons(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAdminCoupon(form);
      setShowModal(false);
      load();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to create coupon");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this promo coupon?")) return;
    try {
      await deleteAdminCoupon(id);
      load();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b">
        <div>
          <h1 className="text-2xl font-bold">Coupons & Campaigns</h1>
          <p className="text-xs text-muted-foreground">Create and manage platform-wide promotional discounts</p>
        </div>
        <Button size="sm" onClick={() => setShowModal(true)} className="rounded-xl gap-1.5 text-xs font-bold">
          <Plus className="h-4 w-4" /> Create Coupon
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map((c) => (
          <Card key={c.id} className="p-5 rounded-3xl space-y-3 relative border hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-primary/10 text-primary font-mono font-black text-sm">
                {c.code}
              </div>
              <button
                onClick={() => handleDelete(c.id)}
                className="text-muted-foreground hover:text-rose-500"
                title="Delete Coupon"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">{c.description}</p>

            <div className="space-y-1 text-xs border-t pt-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Discount:</span>
                <span className="font-bold text-foreground">
                  {c.discount_type === "PERCENTAGE" ? `${c.discount_value}% OFF` : formatPrice(c.discount_value)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Min Cart Value:</span>
                <span>{formatPrice(c.min_cart_value_paise)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Valid Until:</span>
                <span>{c.valid_until}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="p-6 rounded-3xl max-w-md w-full space-y-4">
            <h3 className="font-bold text-lg">Create New Discount Coupon</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Coupon Code *</label>
                <Input
                  required
                  placeholder="e.g. FESTIVE30"
                  className="uppercase"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Offer Description *</label>
                <Input
                  required
                  placeholder="e.g. 30% instant discount on orders above ₹999"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Discount Type</label>
                  <select
                    value={form.discount_type}
                    onChange={(e) => setForm({ ...form, discount_type: e.target.value as any })}
                    className="w-full h-10 px-3 rounded-xl border bg-background"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (Paise)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Value (e.g. 20 for 20%)</label>
                  <Input
                    type="number"
                    required
                    value={form.discount_value}
                    onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Coupon</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
