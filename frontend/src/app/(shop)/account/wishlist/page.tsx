"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import { fetchWishlist, removeFromWishlist } from "@/services/wishlist";
import { ProductSummary } from "@/types/product";
import { formatPrice } from "@/lib/currency";
import { useCartStore } from "@/store/cart-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function WishlistPage() {
  const [items, setItems] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);

  const load = async () => {
    try {
      const data = await fetchWishlist();
      setItems(data.items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRemove = async (productId: string) => {
    try {
      await removeFromWishlist(productId);
      setItems(items.filter((i) => i.id !== productId));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMoveToCart = (product: ProductSummary) => {
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
    handleRemove(product.id);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b">
        <h2 className="text-xl font-bold">My Wishlist ({items.length})</h2>
        <p className="text-xs text-muted-foreground">Save items you like and track price drops</p>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {items.map((product) => (
            <Card key={product.id} className="p-3 rounded-2xl space-y-3 relative hover:shadow-md transition-all flex flex-col justify-between">
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-muted">
                {product.primary_image && (
                  <Image src={product.primary_image} alt={product.title} fill className="object-cover" />
                )}
                {product.discount_pct > 0 && (
                  <Badge variant="deal" className="absolute top-2 left-2 text-[10px]">
                    {product.discount_pct}% OFF
                  </Badge>
                )}
                <button
                  onClick={() => handleRemove(product.id)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 backdrop-blur text-rose-500 shadow-sm"
                  title="Remove from Wishlist"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-1">
                <Link href={`/products/${product.slug}`}>
                  <h4 className="text-xs font-semibold line-clamp-1 hover:text-primary transition-colors">
                    {product.title}
                  </h4>
                </Link>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-bold text-foreground">{formatPrice(product.base_price_paise)}</span>
                  {product.compare_at_price_paise && (
                    <span className="text-xs text-muted-foreground line-through">
                      {formatPrice(product.compare_at_price_paise)}
                    </span>
                  )}
                </div>
              </div>

              <Button
                size="sm"
                onClick={() => handleMoveToCart(product)}
                className="w-full rounded-xl text-xs font-semibold gap-1.5"
              >
                <ShoppingCart className="h-3.5 w-3.5" /> Move to Cart
              </Button>
            </Card>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl border bg-muted/20 space-y-4">
          <Heart className="h-12 w-12 mx-auto text-muted-foreground" />
          <p className="text-sm font-semibold">Your wishlist is empty</p>
          <Link href="/products">
            <Button className="rounded-xl">Explore Products</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
