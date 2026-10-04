"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Edit, Eye, AlertTriangle } from "lucide-react";
import { fetchSellerProducts } from "@/services/seller";
import { formatPrice } from "@/lib/currency";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function SellerProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchSellerProducts();
        setProducts(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = products.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h1 className="text-2xl font-bold">Product Catalog</h1>
          <p className="text-xs text-muted-foreground">Manage your product listings, variants, and stock</p>
        </div>
        <Link href="/seller/products/new">
          <Button size="sm" className="rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 gap-1.5 shadow-md">
            <Plus className="h-4 w-4" /> Add New Product
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products by title..."
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
      ) : filtered.length > 0 ? (
        <div className="border rounded-2xl overflow-hidden divide-y text-xs">
          <div className="grid grid-cols-6 p-3.5 bg-muted/50 font-bold text-muted-foreground">
            <span className="col-span-2">Product</span>
            <span>Category</span>
            <span>Price</span>
            <span>Stock</span>
            <span>Actions</span>
          </div>

          {filtered.map((p) => (
            <div key={p.id} className="grid grid-cols-6 p-3.5 items-center hover:bg-muted/30">
              <div className="col-span-2 flex items-center gap-3">
                <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                  {p.primary_image && <Image src={p.primary_image} alt={p.title} fill className="object-cover" />}
                </div>
                <div>
                  <h4 className="font-semibold line-clamp-1">{p.title}</h4>
                  <span className="text-[10px] text-muted-foreground">{p.variants_count} variants</span>
                </div>
              </div>

              <span className="capitalize text-muted-foreground">{p.category_slug}</span>

              <span className="font-bold text-foreground">{formatPrice(p.base_price_paise)}</span>

              <div>
                {p.total_stock <= 5 ? (
                  <Badge variant="deal" className="text-[10px]">
                    Low: {p.total_stock}
                  </Badge>
                ) : (
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {p.total_stock} in stock
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Link href={`/products/${p.slug}`} target="_blank">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-lg" title="View in Store">
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl border bg-muted/20 space-y-3">
          <p className="text-sm font-semibold">No products found</p>
          <Link href="/seller/products/new">
            <Button size="sm">Create First Product</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
