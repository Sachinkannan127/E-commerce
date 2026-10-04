"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, Eye, EyeOff, Search } from "lucide-react";
import { fetchAdminProducts, toggleAdminProductPublish } from "@/services/admin";
import { formatPrice } from "@/lib/currency";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = async () => {
    try {
      const data = await fetchAdminProducts();
      setProducts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleToggle = async (productId: string) => {
    try {
      await toggleAdminProductPublish(productId);
      setProducts(
        products.map((p) => (p.id === productId ? { ...p, is_published: !p.is_published } : p))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = products.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b">
        <h1 className="text-2xl font-bold">Catalog Moderation</h1>
        <p className="text-xs text-muted-foreground">Monitor platform listings and toggle catalog visibility</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search catalog products..."
            className="pl-9 h-10 text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
      ) : (
        <div className="border rounded-2xl overflow-hidden divide-y text-xs">
          <div className="grid grid-cols-6 p-3.5 bg-muted/50 font-bold text-muted-foreground">
            <span className="col-span-2">Product Title</span>
            <span>Category</span>
            <span>Price</span>
            <span>Status</span>
            <span>Moderation Action</span>
          </div>

          {filtered.map((p) => (
            <div key={p.id} className="grid grid-cols-6 p-3.5 items-center hover:bg-muted/30">
              <div className="col-span-2">
                <h4 className="font-semibold text-foreground line-clamp-1">{p.title}</h4>
                <span className="text-[10px] text-muted-foreground">Brand: {p.brand_name || "Generic"}</span>
              </div>

              <span className="capitalize text-muted-foreground">{p.category_slug}</span>

              <span className="font-bold text-foreground">{formatPrice(p.base_price_paise)}</span>

              <div>
                <Badge variant={p.is_published ? "success" : "secondary"} className="text-[10px]">
                  {p.is_published ? "Live in Store" : "Hidden / Draft"}
                </Badge>
              </div>

              <div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleToggle(p.id)}
                  className={`h-8 rounded-xl text-xs font-semibold ${
                    p.is_published ? "text-rose-500 hover:text-rose-600" : "text-emerald-600 hover:text-emerald-700"
                  }`}
                >
                  {p.is_published ? (
                    <>
                      <EyeOff className="h-3.5 w-3.5 mr-1" /> Unpublish
                    </>
                  ) : (
                    <>
                      <Eye className="h-3.5 w-3.5 mr-1" /> Publish Live
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
