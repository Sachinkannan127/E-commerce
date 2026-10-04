"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { 
  Sparkles, 
  Gift, 
  Clock, 
  Copy, 
  Check, 
  ShoppingBag, 
  Wallet, 
  Award,
  ChevronRight,
  Flame,
  Zap,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";

interface WheelSegment {
  index: number;
  label: string;
  description: string;
  type: string;
  color: string;
}

interface SpinStatus {
  can_spin: boolean;
  cooldown_seconds: number;
  next_spin_at?: string | null;
  segments: WheelSegment[];
  wallet_balance_paise: number;
  loyalty_points: number;
}

interface RewardHistoryItem {
  id: string;
  label: string;
  code?: string;
  type: string;
  value_paise: number;
  spun_at: string;
}

export default function SpinAndWinPage() {
  const [statusData, setStatusData] = useState<SpinStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [rotationDegrees, setRotationDegrees] = useState<number>(0);
  const [result, setResult] = useState<any | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [history, setHistory] = useState<RewardHistoryItem[]>([]);
  const [countdown, setCountdown] = useState<number>(0);

  const defaultSegments: WheelSegment[] = [
    { index: 0, label: "₹50 Flat OFF", description: "Min order ₹499", type: "COUPON", color: "#FF6B6B" },
    { index: 1, label: "10% Super OFF", description: "Max ₹150 discount", type: "COUPON", color: "#4ECDC4" },
    { index: 2, label: "Free Delivery", description: "Zero shipping fee", type: "COUPON", color: "#45B7D1" },
    { index: 3, label: "₹100 Wallet", description: "Instant cash credit", type: "WALLET_CASH", color: "#FFA07A" },
    { index: 4, label: "Try Tomorrow", description: "Spin again tomorrow", type: "NO_LUCK", color: "#98D8C8" },
    { index: 5, label: "₹200 Mega OFF", description: "Min order ₹999", type: "COUPON", color: "#F7DC6F" },
    { index: 6, label: "5% Instant OFF", description: "On any cart", type: "COUPON", color: "#BB8FCE" },
    { index: 7, label: "50 Gems", description: "Loyalty reward gems", type: "LOYALTY_POINTS", color: "#82E0AA" },
  ];

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await api.get("/gamification/status");
      if (res.data?.success && res.data?.data) {
        setStatusData(res.data.data);
        setCountdown(res.data.data.cooldown_seconds || 0);
      }
    } catch (err) {
      console.error("Failed to load spin status", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get("/gamification/rewards");
      if (res.data?.success && res.data?.data) {
        setHistory(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load rewards history", err);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchHistory();
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchStatus();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
    });
  };

  const handleSpin = async () => {
    if (isSpinning || (statusData && !statusData.can_spin)) return;

    try {
      setIsSpinning(true);
      setResult(null);

      const res = await api.post("/gamification/spin");
      if (res.data?.success && res.data?.data) {
        const data = res.data.data;
        const winIdx = data.winning_index;

        // Calculate rotation degrees: 8 segments => 45 deg per segment
        // Segment 0 is at top: 360 - (winIdx * 45) + full 5-8 rotations
        const segmentAngle = 360 / 8;
        const extraRotations = 360 * 6; // 6 full spins
        const targetDeg = extraRotations + (360 - winIdx * segmentAngle - segmentAngle / 2);

        setRotationDegrees(targetDeg);

        // Wait for animation to finish (4.5s)
        setTimeout(() => {
          setIsSpinning(false);
          setResult(data);
          if (data.reward_type !== "NO_LUCK") {
            triggerConfetti();
          }
          fetchStatus();
          fetchHistory();
        }, 4500);
      }
    } catch (err: any) {
      setIsSpinning(false);
      alert(err.response?.data?.message || "Failed to spin wheel. Please try again.");
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const formatCountdown = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const segments = statusData?.segments || defaultSegments;

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold mb-3 border border-amber-500/30">
          <Sparkles className="w-4 h-4" /> Daily ShopVerse Rewards
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
          Spin & Win Daily Prizes
        </h1>
        <p className="text-sm md:text-base text-slate-600 dark:text-slate-400">
          Try your luck every 24 hours to win instant wallet cash, discount coupons up to ₹200, and free shipping!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left / Center: Interactive Wheel */}
        <div className="lg:col-span-8 flex flex-col items-center bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white p-8 md:p-12 rounded-3xl shadow-2xl border border-indigo-800/50 relative overflow-hidden">
          {/* Ambient Lighting */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Wheel Container */}
          <div className="relative my-4 flex items-center justify-center">
            {/* Pointer / Arrow Indicator */}
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
              <div className="w-8 h-8 bg-amber-400 rotate-45 rounded-sm shadow-xl border-2 border-white -mb-4 z-10" />
              <div className="w-3 h-3 bg-amber-600 rounded-full shadow" />
            </div>

            {/* Rotating Wheel Circle */}
            <div
              className="relative w-72 h-72 sm:w-96 sm:h-96 rounded-full border-8 border-amber-400/80 shadow-[0_0_50px_rgba(251,191,36,0.3)] overflow-hidden transition-all ease-out"
              style={{
                transform: `rotate(${rotationDegrees}deg)`,
                transitionDuration: isSpinning ? "4.5s" : "0s",
                transitionTimingFunction: "cubic-bezier(0.15, 0.9, 0.2, 1)",
              }}
            >
              {/* Segments SVG */}
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {segments.map((seg, idx) => {
                  const angle = 360 / 8;
                  const startAngle = idx * angle;
                  const endAngle = startAngle + angle;

                  const rad1 = (startAngle * Math.PI) / 180;
                  const rad2 = (endAngle * Math.PI) / 180;

                  const x1 = 50 + 50 * Math.cos(rad1);
                  const y1 = 50 + 50 * Math.sin(rad1);
                  const x2 = 50 + 50 * Math.cos(rad2);
                  const y2 = 50 + 50 * Math.sin(rad2);

                  const textAngle = startAngle + angle / 2;
                  const textRad = (textAngle * Math.PI) / 180;
                  const textX = 50 + 32 * Math.cos(textRad);
                  const textY = 50 + 32 * Math.sin(textRad);

                  return (
                    <g key={seg.index}>
                      <path
                        d={`M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`}
                        fill={seg.color}
                        stroke="#1e1b4b"
                        strokeWidth="0.8"
                      />
                      <text
                        x={textX}
                        y={textY}
                        fill="#0f172a"
                        fontSize="3.8"
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        transform={`rotate(${textAngle + 90}, ${textX}, ${textY})`}
                      >
                        {seg.label}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Center Hub */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-tr from-amber-500 to-amber-300 rounded-full border-4 border-white shadow-2xl flex items-center justify-center font-black text-slate-950 text-xs sm:text-sm tracking-wider uppercase">
                SPIN
              </div>
            </div>
          </div>

          {/* Action CTA & Timer */}
          <div className="mt-8 text-center w-full max-w-sm z-10">
            {countdown > 0 ? (
              <div className="bg-slate-800/80 backdrop-blur border border-slate-700 p-4 rounded-2xl">
                <div className="flex items-center justify-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
                  <Clock className="w-4 h-4" /> Next Free Spin In
                </div>
                <div className="text-3xl font-mono font-bold text-white tracking-widest">
                  {formatCountdown(countdown)}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Come back every day for more coupons and wallet rewards!
                </p>
              </div>
            ) : (
              <Button
                onClick={handleSpin}
                disabled={isSpinning}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 font-black text-lg shadow-[0_0_30px_rgba(251,191,36,0.5)] transition-all transform active:scale-95 flex items-center justify-center gap-2"
              >
                {isSpinning ? (
                  <>
                    <Zap className="w-5 h-5 animate-spin" /> Spinning Wheel...
                  </>
                ) : (
                  <>
                    <Flame className="w-5 h-5 fill-slate-950" /> SPIN THE WHEEL NOW
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Won Result Modal Card */}
          {result && (
            <div className="mt-6 w-full max-w-md p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center animate-in fade-in zoom-in duration-300">
              <div className="text-2xl mb-1">
                {result.reward_type === "NO_LUCK" ? "😢" : "🎉"}
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                {result.reward_label}
              </h3>
              <p className="text-xs text-slate-300 mb-3">
                {result.reward_description}
              </p>

              {result.reward_code && (
                <div className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-amber-400/40 mb-3">
                  <span className="font-mono font-bold text-amber-400 tracking-wider text-sm">
                    {result.reward_code}
                  </span>
                  <button
                    onClick={() => handleCopyCode(result.reward_code)}
                    className="p-1.5 hover:bg-slate-800 rounded-md text-slate-300 hover:text-white transition-colors"
                    title="Copy Code"
                  >
                    {copiedCode === result.reward_code ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              )}

              <Link href="/products">
                <Button size="sm" className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs">
                  <ShoppingBag className="w-3.5 h-3.5 mr-1" /> Use Reward Now
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Right: Balance & Reward History */}
        <div className="lg:col-span-4 space-y-6">
          {/* User Rewards Card */}
          <div className="p-6 rounded-3xl bg-card border shadow-sm space-y-4">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Wallet className="w-4 h-4 text-primary" /> Your Wallet & Points
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-muted/40 border">
                <span className="text-xs text-muted-foreground">Wallet Cash</span>
                <div className="text-xl font-black text-foreground mt-0.5">
                  ₹{((statusData?.wallet_balance_paise || 0) / 100).toFixed(2)}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-muted/40 border">
                <span className="text-xs text-muted-foreground">Loyalty Gems</span>
                <div className="text-xl font-black text-amber-500 mt-0.5 flex items-center gap-1">
                  <Award className="w-4 h-4" /> {statusData?.loyalty_points || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Past Spin Rewards History */}
          <div className="p-6 rounded-3xl bg-card border shadow-sm space-y-4">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Gift className="w-4 h-4 text-emerald-500" /> Recent Rewards Won
            </h3>

            {history.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">
                No past spins yet. Spin today to win your first reward!
              </p>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-muted/30 border text-xs flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="font-semibold text-foreground">
                        {item.label}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {item.spun_at}
                      </div>
                    </div>

                    {item.code ? (
                      <button
                        onClick={() => handleCopyCode(item.code!)}
                        className="flex items-center gap-1 px-2 py-1 rounded bg-primary/10 text-primary font-mono text-[10px] font-bold hover:bg-primary/20 transition-colors"
                      >
                        {copiedCode === item.code ? "Copied!" : item.code}
                      </button>
                    ) : item.type === "WALLET_CASH" ? (
                      <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                        Credited
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">
                        {item.type}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rules & Transparency */}
          <div className="p-5 rounded-2xl bg-muted/20 border text-xs text-muted-foreground space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <Info className="w-4 h-4 text-primary" /> Fair Play Terms
            </div>
            <ul className="space-y-1 list-disc list-inside">
              <li>1 free spin every 24 hours per verified account.</li>
              <li>Coupons are valid for 7 days from the time won.</li>
              <li>Wallet cash can be used 100% on any order without minimum limits.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
