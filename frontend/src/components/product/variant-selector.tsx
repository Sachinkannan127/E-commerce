"use client";

import { ProductVariant } from "@/types/product";
import { Badge } from "@/components/ui/badge";

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant;
  onSelectVariant: (variant: ProductVariant) => void;
}

export function VariantSelector({
  variants,
  selectedVariant,
  onSelectVariant,
}: VariantSelectorProps) {
  if (!variants || variants.length <= 1) return null;

  // Extract unique attribute keys (e.g., "Color", "Size")
  const attributeNames = Array.from(
    new Set(variants.flatMap((v) => v.attributes.map((a) => a.name)))
  );

  return (
    <div className="space-y-4 py-3 border-y">
      {attributeNames.map((attrName) => {
        return (
          <div key={attrName} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-foreground">Select {attrName}:</span>
              <span className="text-xs text-muted-foreground">
                {selectedVariant.attributes.find((a) => a.name === attrName)?.value}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {variants.map((variant) => {
                const attrVal = variant.attributes.find((a) => a.name === attrName)?.value;
                const isSelected = variant.variant_id === selectedVariant.variant_id;
                const isOutOfStock = variant.stock <= 0;

                return (
                  <button
                    key={variant.variant_id}
                    type="button"
                    disabled={isOutOfStock}
                    onClick={() => onSelectVariant(variant)}
                    className={`relative px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/30"
                        : "border-border hover:border-foreground/40 bg-background text-foreground"
                    } ${isOutOfStock ? "opacity-40 cursor-not-allowed line-through" : ""}`}
                  >
                    {attrVal}
                    {isOutOfStock && (
                      <span className="block text-[10px] text-rose-500 font-normal">Sold out</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Stock warning */}
      <div className="text-xs">
        {selectedVariant.stock > 0 && selectedVariant.stock <= 5 ? (
          <Badge variant="deal" className="text-[11px] animate-pulse">
            Hurry, only {selectedVariant.stock} left in stock!
          </Badge>
        ) : selectedVariant.stock > 0 ? (
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            ✓ In Stock ({selectedVariant.stock} units available)
          </span>
        ) : (
          <span className="text-rose-600 font-semibold">Currently Out of Stock</span>
        )}
      </div>
    </div>
  );
}
