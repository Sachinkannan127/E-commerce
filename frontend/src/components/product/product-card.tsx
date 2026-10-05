"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, ShoppingCart, Heart, Zap, Scale } from "lucide-react";
import { ProductSummary } from "@/types/product";
import { formatPrice } from "@/lib/currency";
import { useCartStore } from "@/store/cart-store";
import { useCompareStore } from "@/store/useCompareStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  product: ProductSummary;
  viewMode?: "grid" | "list";
}

export function ProductCard({ product, viewMode = "grid" }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const { addToCompare, removeFromCompare, isInCompare } = useCompareStore();
  const isCompared = isInCompare(product.id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      product_id: product.id,
      variant_id: `default-${product.id}`,
      seller_id: "default-seller",
      title: product.title,
      product_slug: product.slug,
      image_url: product.primary_image || "",
      selected_attributes: {},
      quantity: 1,
      unit_price_paise: product.base_price_paise,
      compare_at_price_paise: product.compare_at_price_paise,
      is_saved_for_later: false,
    });
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCompared) {
      removeFromCompare(product.id);
    } else {
      addToCompare({
        id: product.id,
        title: product.title,
        slug: product.slug,
        primary_image: product.primary_image,
        base_price_paise: product.base_price_paise,
        brand_name: product.brand_name,
        avg_rating: product.avg_rating,
        category_slug: product.category_slug,
      });
    }
  };

  if (viewMode === "list") {
    return (
      <Link href={`/products/${product.slug}`} className="block group">
        <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border bg-card hover:shadow-lg transition-all hover:border-primary/40">
          <div className="relative aspect-square w-full sm:w-48 rounded-xl overflow-hidden bg-muted flex-shrink-0">
            {product.primary_image && (
              <Image
                src={product.primary_image}
                alt={product.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 100vw, 200px"
              />
            )}
            {product.discount_pct > 0 && (
              <Badge variant="deal" className="absolute top-2 left-2 text-[10px]">
                {product.discount_pct}% OFF
              </Badge>
            )}
            <div className="absolute top-2 right-2 flex flex-col gap-1">
              <button
                onClick={handleWishlistToggle}
                className={`p-1.5 rounded-full bg-background/80 backdrop-blur shadow-sm transition-transform active:scale-90 ${
                  isWishlisted ? "text-rose-500" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Heart className={`h-4 w-4 ${isWishlisted ? "fill-rose-500" : ""}`} />
              </button>
              <button
                onClick={handleCompareToggle}
                className={`p-1.5 rounded-full bg-background/80 backdrop-blur shadow-sm transition-transform active:scale-90 ${
                  isCompared ? "text-primary bg-primary/20" : "text-muted-foreground hover:text-foreground"
                }`}
                title="Compare"
              >
                <Scale className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-between space-y-3">
            <div className="space-y-1.5">
              {product.brand_name && (
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {product.brand_name}
                </span>
              )}
              <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {product.title}
              </h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded-md">
                  <span>{product.avg_rating}</span>
                  <Star className="h-3 w-3 fill-white" />
                </div>
                <span className="text-xs text-muted-foreground">({product.review_count} ratings)</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-foreground">
                  {formatPrice(product.base_price_paise)}
                </span>
                {product.compare_at_price_paise && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(product.compare_at_price_paise)}
                  </span>
                )}
              </div>
              <Button size="sm" onClick={handleQuickAdd} className="rounded-xl gap-2 font-medium">
                <ShoppingCart className="h-4 w-4" /> Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/products/${product.slug}`} className="block group">
      <div className="flex flex-col h-full rounded-2xl border bg-card overflow-hidden hover:shadow-xl transition-all hover:border-primary/40 p-3 space-y-3">
        {/* Product Image */}
        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-muted">
          {product.primary_image && (
            <Image
              src={product.primary_image}
              alt={product.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.discount_pct > 0 && (
              <Badge variant="deal" className="text-[10px] px-1.5 py-0.5">
                {product.discount_pct}% OFF
              </Badge>
            )}
            {product.is_bestseller && (
              <Badge variant="warning" className="text-[10px] px-1.5 py-0.5">
                Bestseller
              </Badge>
            )}
          </div>

          {/* Wishlist & Compare Buttons */}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            <button
              onClick={handleWishlistToggle}
              className={`p-1.5 rounded-full bg-background/80 backdrop-blur shadow-sm transition-transform active:scale-90 ${
                isWishlisted ? "text-rose-500" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Add to Wishlist"
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? "fill-rose-500" : ""}`} />
            </button>
            <button
              onClick={handleCompareToggle}
              className={`p-1.5 rounded-full bg-background/80 backdrop-blur shadow-sm transition-transform active:scale-90 ${
                isCompared ? "text-primary bg-primary/20 ring-1 ring-primary" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Compare"
            >
              <Scale className="h-4 w-4" />
            </button>
          </div>
        </div>

          {/* Content */}
        <div className="flex-1 flex flex-col justify-between space-y-2">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              {product.brand_name && (
                <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                  {product.brand_name}
                </span>
              )}
              <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-0.5">
                <Zap className="h-3 w-3 text-amber-500 fill-amber-500" /> Express
              </span>
            </div>
            <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
              {product.title}
            </h3>
          </div>

          {/* Ratings & Social Proof */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5 bg-emerald-600 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-md shadow-2xs">
              <span>{product.avg_rating}</span>
              <Star className="h-2.5 w-2.5 fill-white" />
            </div>
            <span className="text-[11px] text-muted-foreground font-medium">({product.review_count} verified)</span>
          </div>

          {/* Bank Offer Pill */}
          <div className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md inline-block">
            💳 Extra 10% Off with HDFC / UPI
          </div>

          {/* Price & Action */}
          <div className="pt-2 border-t flex items-center justify-between gap-1">
            <div>
              <div className="text-base font-black text-foreground">
                {formatPrice(product.base_price_paise)}
              </div>
              {product.compare_at_price_paise && (
                <div className="text-xs text-muted-foreground line-through">
                  {formatPrice(product.compare_at_price_paise)}
                </div>
              )}
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={handleQuickAdd}
              className="rounded-xl px-2.5 h-8 font-bold hover:bg-primary hover:text-primary-foreground transition-all hover:scale-105"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}

