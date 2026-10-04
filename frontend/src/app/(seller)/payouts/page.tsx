"use client";

import { useState, useEffect } from "react";
import { DollarSign, Landmark, ArrowRight, CheckCircle2, Clock, ShieldCheck } from "lucide-react";
import { fetchSellerPayouts, requestSellerPayoutApi } from "@/services/seller";
import { formatPrice } from "@/lib/currency";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function SellerPayoutsPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [amountRupees, setAmountRupees] = useState("");
  const [requesting, setRequesting] = useState(false);

  const load = async () => {
    try {
      const res = await fetchSellerPayouts();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    const paise = Number(amountRupees) * 100;
    if (paise <= 0) return;
    setRequesting(true);
    try {
      await requestSellerPayoutApi(paise);
      alert("Payout request submitted successfully! Funds will be transferred to your bank account.");
      setAmountRupees("");
      load();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to request payout");
    } finally {
      setRequesting(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b">
        <h1 className="text-2xl font-bold">Earnings & Bank Payouts</h1>
        <p className="text-xs text-muted-foreground">
          Track sales proceeds, platform commission deductions, and withdraw funds directly to your verified bank account
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/15 via-background to-background border border-amber-500/30 space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Available Pending Balance
          </span>
          <div className="text-3xl font-black text-foreground">{formatPrice(data.pending_payout_paise)}</div>
          <p className="text-[11px] text-muted-foreground">Ready for withdrawal</p>
        </Card>

        <Card className="p-6 rounded-3xl space-y-2 border">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Lifetime Net Earnings
          </span>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {formatPrice(data.lifetime_earnings_paise)}
          </div>
          <p className="text-[11px] text-muted-foreground">Credited after 8% commission</p>
        </Card>

        <Card className="p-6 rounded-3xl space-y-2 border">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Platform Fee Structure
          </span>
          <div className="text-3xl font-black text-foreground">{data.commission_rate_pct}%</div>
          <p className="text-[11px] text-muted-foreground">Standard category commission</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Withdraw Request Form */}
        <Card className="p-6 rounded-3xl space-y-4 border">
          <div className="flex items-center gap-2 font-bold text-sm">
            <DollarSign className="h-5 w-5 text-emerald-500" /> Request Bank Withdrawal
          </div>

          <form onSubmit={handleRequestPayout} className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Withdrawal Amount (₹)</label>
              <Input
                type="number"
                required
                min={1000}
                placeholder="Enter amount (Min ₹1,000)"
                value={amountRupees}
                onChange={(e) => setAmountRupees(e.target.value)}
              />
            </div>

            {data.bank_details ? (
              <div className="p-3 rounded-2xl bg-muted/40 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-foreground">
                  <Landmark className="h-4 w-4 text-primary" /> Receiving Bank Account
                </div>
                <p className="text-muted-foreground">
                  {data.bank_details.bank_name} • A/C: ••••{data.bank_details.account_number?.slice(-4)} (IFSC: {data.bank_details.ifsc_code})
                </p>
              </div>
            ) : null}

            <Button
              type="submit"
              disabled={requesting || !amountRupees || Number(amountRupees) * 100 > data.pending_payout_paise}
              className="w-full rounded-2xl h-11 font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md"
            >
              {requesting ? "Submitting Request..." : "Withdraw to Bank Account"}
            </Button>
          </form>
        </Card>

        {/* Payout History */}
        <Card className="p-6 rounded-3xl space-y-4 border">
          <h3 className="font-bold text-sm">Withdrawal History</h3>

          {data.payouts && data.payouts.length > 0 ? (
            <div className="divide-y text-xs">
              {data.payouts.map((p: any) => (
                <div key={p.id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-foreground block">{formatPrice(p.amount_paise)}</span>
                    <span className="text-[10px] text-muted-foreground">{p.requested_at}</span>
                  </div>
                  <Badge variant={p.status === "PAID" ? "success" : "warning"} className="text-[10px]">
                    {p.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground py-8 text-center">No past payout requests.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
