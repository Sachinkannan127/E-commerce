"use client";

import { useState } from "react";
import { Wallet, Gift, Users, Copy, CheckCircle2, Sparkles, Award } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { formatPrice } from "@/lib/currency";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function WalletPage() {
  const { user } = useAuthStore();
  const [copied, setCopied] = useState(false);

  const referralLink = `https://shopverse.in/register?ref=${user?.referral_code || "SV100"}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b">
        <h2 className="text-xl font-bold">Wallet & Rewards</h2>
        <p className="text-xs text-muted-foreground">Manage your wallet balance, loyalty points, and referral earnings</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Wallet Balance Card */}
        <Card className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-200 uppercase tracking-wider flex items-center gap-1.5">
              <Wallet className="h-4 w-4 text-amber-300" /> ShopVerse Balance
            </span>
            <Badge variant="deal" className="text-[10px]">Instant Checkout</Badge>
          </div>
          <div className="text-3xl font-black">{formatPrice(user?.wallet_balance_paise || 0)}</div>
          <p className="text-xs text-indigo-100">
            Use your wallet balance seamlessly for instant one-click checkout on all orders.
          </p>
        </Card>

        {/* Loyalty Points Card */}
        <Card className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/15 via-rose-500/10 to-purple-500/10 border border-amber-500/30 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Award className="h-4 w-4 text-amber-500" /> Loyalty Points
            </span>
            <span className="text-xs font-bold text-primary">Silver Tier</span>
          </div>
          <div className="text-3xl font-black text-foreground">{user?.loyalty_points || 0} pts</div>
          <p className="text-xs text-muted-foreground">
            Earn 1 point for every ₹10 spent. Redeem points directly for discount coupons on checkout.
          </p>
        </Card>
      </div>

      {/* Refer & Earn Card */}
      <Card className="p-6 rounded-3xl space-y-4 border">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-foreground">Refer Friends & Earn ₹50</h3>
            <p className="text-xs text-muted-foreground">
              Share your personal referral code. When a friend signs up and places their first order, you both get ₹50 added to your wallet!
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-muted/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="space-y-0.5 text-center sm:text-left">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Your Referral Code</span>
            <p className="text-base font-mono font-black text-primary">{user?.referral_code}</p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button onClick={handleCopy} size="sm" className="w-full sm:w-auto rounded-xl gap-1.5 font-bold">
              {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Link Copied!" : "Copy Invite Link"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
