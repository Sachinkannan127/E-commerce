"use client";

import { ShoppingCart, Zap } from "lucide-react";
import { formatPrice } from "@/lib/currency";
import { Button } from "@/components/ui/button";

interface StickyBuyBarProps {
  pricePaise: number;
  compareAtPaise?: number;
  stock: number;
  onAddToCart: () => void;
  onBuyNow: () => void;
}

export function StickyBuyBar({
  pricePaise,
  compareAtPaise,
  stock,
  onAddToCart,
  onBuyNow,
}: StickyBuyBarProps) {
  const isOutOfStock = stock <= 0;

  return (
    <div className="fixed bottom-16 left-0 z-40 w-full md:hidden border-t bg-background/95 backdrop-blur-md p-3 shadow-2xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="text-lg font-black text-foreground">{formatPrice(pricePaise)}</span>
          {compareAtPaise && (
            <span className="text-xs text-muted-foreground line-through ml-1.5">
              {formatPrice(compareAtPaise)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={isOutOfStock}
            onClick={onAddToCart}
            className="rounded-xl px-3 font-semibold"
          >
            <ShoppingCart className="h-4 w-4 mr-1" /> Add
          </Button>
          <Button
            variant="default"
            size="sm"
            disabled={isOutOfStock}
            onClick={onBuyNow}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl px-4"
          >
            <Zap className="h-4 w-4 mr-1 fill-slate-950" /> Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
}
