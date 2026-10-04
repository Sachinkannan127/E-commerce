"use client";

import { useState, useEffect } from "react";
import { FileSpreadsheet, Download, DollarSign, TrendingUp, ShieldCheck } from "lucide-react";
import { fetchAdminStats, AdminStatsData } from "@/services/admin";
import { formatPrice } from "@/lib/currency";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminReportsPage() {
  const [stats, setStats] = useState<AdminStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchAdminStats();
        setStats(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleDownloadCsv = () => {
    window.open(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/admin/reports/financial-export`, "_blank");
  };

  if (loading || !stats) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b">
        <div>
          <h1 className="text-2xl font-bold">Financial Reports & Audit Ledger</h1>
          <p className="text-xs text-muted-foreground">Download comprehensive transaction ledgers and GST audit files</p>
        </div>
        <Button onClick={handleDownloadCsv} className="rounded-xl gap-2 font-bold shadow-md">
          <Download className="h-4 w-4" /> Export CSV Financial Report
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-6 rounded-3xl space-y-2 border">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Total Sales Processed (GMV)
          </span>
          <div className="text-3xl font-black text-foreground">{formatPrice(stats.gmv_paise)}</div>
        </Card>

        <Card className="p-6 rounded-3xl space-y-2 border">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Platform Net Commission Earned
          </span>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {formatPrice(stats.platform_revenue_paise)}
          </div>
        </Card>

        <Card className="p-6 rounded-3xl space-y-2 border">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Total Completed Transactions
          </span>
          <div className="text-3xl font-black text-foreground">{stats.total_orders}</div>
        </Card>
      </div>

      <Card className="p-6 rounded-3xl space-y-4 border">
        <div className="flex items-center gap-2 font-bold text-sm">
          <FileSpreadsheet className="h-5 w-5 text-primary" /> Export Schema & Columns
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          The generated CSV export contains detailed transaction records including Order Numbers, Customer Identifiers, Subtotals, 18% Integrated GST Breakdown, Coupon Discounts, Platform Commissions, and Final Settlement statuses.
        </p>
        <div className="pt-2">
          <Button variant="outline" onClick={handleDownloadCsv} className="rounded-xl text-xs font-semibold gap-1.5">
            <Download className="h-4 w-4" /> Download Latest Snapshot (.csv)
          </Button>
        </div>
      </Card>
    </div>
  );
}
