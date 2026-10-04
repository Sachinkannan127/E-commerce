"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Boxes, AlertTriangle, Check, Save } from "lucide-react";
import { fetchSellerProducts, updateVariantStockApi } from "@/services/seller";
import { formatPrice } from "@/lib/currency";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function SellerInventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stockInputs, setStockInputs] = useState<Record<string, number>>({});
  const [savedId, setSavedId] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await fetchSellerProducts();
      setProducts(data);
      const initialMap: Record<string, number> = {};
      data.forEach((p) => {
        p.variants?.forEach((v: any) => {
          initialMap[v.variant_id] = v.stock;
        });
      });
      setStockInputs(initialMap);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleStockSave = async (productId: string, variantId: string) => {
    const qty = stockInputs[variantId];
    if (qty === undefined || qty < 0) return;
    try {
      await updateVariantStockApi(productId, variantId, qty);
      setSavedId(variantId);
      setTimeout(() => setSavedId(null), 2500);
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
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        <p className="text-xs text-muted-foreground">Adjust live warehouse stock and manage low-inventory thresholds</p>
      </div>

      <div className="space-y-4">
        {products.map((p) => (
          <Card key={p.id} className="p-5 rounded-3xl space-y-4">
            <div className="flex items-center gap-4 pb-3 border-b">
              <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                {p.primary_image && <Image src={p.primary_image} alt={p.title} fill className="object-cover" />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">{p.title}</h3>
                <span className="text-xs text-muted-foreground">{formatPrice(p.base_price_paise)}</span>
              </div>
            </div>

            {/* Variants Stock Table */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Variant Stock Levels
              </span>
              <div className="divide-y text-xs border rounded-2xl overflow-hidden">
                {p.variants?.map((v: any) => {
                  const currentInput = stockInputs[v.variant_id] ?? v.stock;
                  const isLow = currentInput <= 5;
                  return (
                    <div key={v.variant_id} className="p-3 flex items-center justify-between gap-4 hover:bg-muted/30">
                      <div>
                        <span className="font-mono font-bold text-foreground">{v.sku}</span>
                        {v.attributes?.length > 0 && (
                          <span className="text-muted-foreground ml-2">
                            ({v.attributes.map((a: any) => `${a.name}: ${a.value}`).join(", ")})
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        {isLow ? (
                          <Badge variant="deal" className="text-[10px]">
                            Low Stock
                          </Badge>
                        ) : (
                          <Badge variant="success" className="text-[10px]">
                            Healthy
                          </Badge>
                        )}

                        <div className="flex items-center gap-1.5">
                          <Input
                            type="number"
                            min={0}
                            className="w-20 h-8 text-xs text-center font-bold"
                            value={currentInput}
                            onChange={(e) =>
                              setStockInputs({
                                ...stockInputs,
                                [v.variant_id]: Number(e.target.value),
                              })
                            }
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStockSave(p.id, v.variant_id)}
                            className="h-8 rounded-xl text-xs font-semibold"
                          >
                            {savedId === v.variant_id ? (
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <Save className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
