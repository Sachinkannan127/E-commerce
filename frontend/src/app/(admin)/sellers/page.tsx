"use client";

import { useState, useEffect } from "react";
import { Store, ShieldCheck, Check, X, AlertTriangle } from "lucide-react";
import { fetchAdminSellers, updateAdminSellerStatus } from "@/services/admin";
import { formatPrice } from "@/lib/currency";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await fetchAdminSellers();
      setSellers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpdateStatus = async (sellerId: string, status: string) => {
    try {
      await updateAdminSellerStatus(sellerId, status);
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
        <h1 className="text-2xl font-bold">Seller & Merchant Moderation</h1>
        <p className="text-xs text-muted-foreground">Review KYC credentials, approve stores, and set commission percentages</p>
      </div>

      <div className="border rounded-2xl overflow-hidden divide-y text-xs">
        <div className="grid grid-cols-6 p-3.5 bg-muted/50 font-bold text-muted-foreground">
          <span className="col-span-2">Store / Merchant</span>
          <span>GSTIN / PAN</span>
          <span>Commission</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {sellers.map((s) => (
          <div key={s.id} className="grid grid-cols-6 p-3.5 items-center hover:bg-muted/30">
            <div className="col-span-2">
              <h4 className="font-bold text-sm text-foreground">{s.store_name}</h4>
              <span className="text-[10px] text-muted-foreground">Joined: {s.created_at}</span>
            </div>

            <div>
              <span className="font-mono block text-foreground">{s.gst_number || "No GST"}</span>
              <span className="font-mono text-[10px] text-muted-foreground">{s.pan_number || "No PAN"}</span>
            </div>

            <span className="font-bold">{s.commission_rate_pct}%</span>

            <div>
              <Badge
                variant={
                  s.status === "APPROVED"
                    ? "success"
                    : s.status === "PENDING"
                    ? "warning"
                    : "destructive"
                }
                className="text-[10px]"
              >
                {s.status}
              </Badge>
            </div>

            <div className="flex items-center gap-1.5">
              {s.status !== "APPROVED" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUpdateStatus(s.id, "APPROVED")}
                  className="h-8 rounded-xl text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 text-xs font-semibold"
                >
                  <Check className="h-3.5 w-3.5 mr-1" /> Approve
                </Button>
              )}
              {s.status === "APPROVED" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUpdateStatus(s.id, "SUSPENDED")}
                  className="h-8 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 text-xs font-semibold"
                >
                  <X className="h-3.5 w-3.5 mr-1" /> Suspend
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
