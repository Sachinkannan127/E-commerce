"use client";

import { useState } from "react";
import { MapPin, Truck, CheckCircle2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { checkPincodeDelivery, PincodeCheckResult } from "@/services/catalog";
import { formatPrice } from "@/lib/currency";

export function PincodeChecker({ productId }: { productId: string }) {
  const [pincode, setPincode] = useState("");
  const [result, setResult] = useState<PincodeCheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length !== 6) {
      setError("Please enter a valid 6-digit PIN code");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const data = await checkPincodeDelivery(pincode, productId);
      setResult(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Delivery unavailable for this pincode");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 p-4 rounded-2xl bg-muted/40 border">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <MapPin className="h-4 w-4 text-primary" />
        <span>Delivery Options & Pincode Check</span>
      </div>

      <form onSubmit={handleCheck} className="flex gap-2">
        <Input
          type="text"
          maxLength={6}
          placeholder="Enter 6-digit PIN code (e.g. 560001)"
          className="h-10 bg-background"
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
        />
        <Button type="submit" size="sm" disabled={loading || pincode.length !== 6} className="px-5 rounded-xl">
          {loading ? "Checking..." : "Check"}
        </Button>
      </form>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-500 font-medium">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="space-y-1.5 pt-2 text-xs text-muted-foreground border-t">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
            <CheckCircle2 className="h-4 w-4" />
            <span>Delivery by {result.estimated_delivery_date}</span>
          </div>
          <p>• Free Delivery on orders above {formatPrice(result.free_delivery_threshold_paise)}</p>
          <p>• Cash on Delivery (COD) Available</p>
          <p>• 7 Days Doorstep Return & Exchange</p>
        </div>
      )}
    </div>
  );
}
