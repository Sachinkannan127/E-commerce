"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, ShoppingCart, Check, Sparkles, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import api from "@/lib/api";

interface BundleProduct {
  id: string;
  title: string;
  slug: string;
  category_slug: string;
  brand_name: string;
  primary_image?: string | null;
  base_price_paise: number;
  compare_at_price_paise?: number | null;
  discount_pct?: number;
  avg_rating: number;
  review_count: number;
  total_stock: number;
}

interface BundleData {
  main_product_id: string;
  bundle_items: BundleProduct[];
  total_items: number;
  original_total_paise: number;
  bundle_discount_pct: number;
  bundle_savings_paise: number;
  bundle_price_paise: number;
}

interface Props {
  productId: string;
}

export const FrequentlyBoughtTogether: React.FC<Props> = ({ productId }) => {
  const [bundle, setBundle] = useState<BundleData | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdded, setIsAdded] = useState<boolean>(false);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const fetchBundle = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${productId}/frequently-bought-together`);
        if (res.data?.success && res.data?.data) {
          const data: BundleData = res.data.data;
          setBundle(data);
          // By default, select all bundle items
          setSelectedIds(new Set(data.bundle_items.map((item) => item.id)));
        }
      } catch (err) {
        console.error("Failed to load bundle", err);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchBundle();
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="my-10 p-6 rounded-2xl bg-slate-50 border border-slate-100 animate-pulse">
        <div className="h-6 w-64 bg-slate-200 rounded mb-4"></div>
        <div className="h-32 bg-slate-200 rounded"></div>
      </div>
    );
  }

  if (!bundle || bundle.bundle_items.length <= 1) return null;

  const toggleItem = (id: string) => {
    // If it's the main product, keep it or allow toggling
    const updated = new Set(selectedIds);
    if (updated.has(id)) {
      if (updated.size > 1) {
        updated.delete(id);
      }
    } else {
      updated.add(id);
    }
    setSelectedIds(updated);
  };

  const selectedItems = bundle.bundle_items.filter((item) => selectedIds.has(item.id));
  const rawSubtotal = selectedItems.reduce((acc, item) => acc + item.base_price_paise, 0);
  const bundleDiscount = selectedItems.length > 1 ? Math.round(rawSubtotal * 0.05) : 0;
  const finalBundlePrice = rawSubtotal - bundleDiscount;

  const handleAddBundleToCart = () => {
    selectedItems.forEach((item) => {
      addItem({
        product_id: item.id,
        variant_id: `default-${item.id}`,
        seller_id: "default-seller",
        title: item.title,
        product_slug: item.slug,
        image_url: item.primary_image || "",
        selected_attributes: {},
        quantity: 1,
        unit_price_paise: item.base_price_paise,
        compare_at_price_paise: item.compare_at_price_paise || item.base_price_paise,
        is_saved_for_later: false,
      });
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2500);
  };

  return (
    <div className="my-12 p-6 md:p-8 rounded-3xl bg-gradient-to-br from-indigo-50/40 via-white to-blue-50/30 border border-indigo-100/70 shadow-sm">
      <div className="flex items-center gap-2.5 mb-6">
        <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-lg md:text-xl font-bold text-slate-900">
            Frequently Bought Together
          </h3>
          <p className="text-xs text-slate-500">
            Pair with recommended essentials and get an extra 5% bundle discount
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Product Cards Row */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 flex-1">
          {bundle.bundle_items.map((item, index) => {
            const isChecked = selectedIds.has(item.id);
            const isMain = item.id === bundle.main_product_id;

            return (
              <React.Fragment key={item.id}>
                <div
                  onClick={() => toggleItem(item.id)}
                  className={`relative cursor-pointer group flex flex-col items-center w-36 sm:w-44 p-3 rounded-2xl bg-white border-2 transition-all ${
                    isChecked
                      ? "border-indigo-600 shadow-md ring-2 ring-indigo-600/10"
                      : "border-slate-200 opacity-60 hover:opacity-80"
                  }`}
                >
                  <div className="absolute top-2 left-2 z-10">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                    />
                  </div>

                  {isMain && (
                    <span className="absolute top-2 right-2 text-[9px] font-semibold uppercase tracking-wider bg-slate-900 text-white px-1.5 py-0.5 rounded">
                      This Item
                    </span>
                  )}

                  <div className="relative w-full h-28 my-2 flex items-center justify-center">
                    {item.primary_image ? (
                      <Image
                        src={item.primary_image}
                        alt={item.title}
                        fill
                        className="object-contain p-2 group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="text-xs text-slate-400">No Image</div>
                    )}
                  </div>

                  <h4 className="text-xs font-semibold text-slate-800 text-center line-clamp-2 min-h-[32px] mb-1">
                    {item.title}
                  </h4>

                  <span className="text-xs font-bold text-slate-900">
                    ₹{(item.base_price_paise / 100).toLocaleString("en-IN")}
                  </span>
                </div>

                {index < bundle.bundle_items.length - 1 && (
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                    <Plus className="w-4 h-4" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Bundle Summary & CTA */}
        <div className="w-full lg:w-72 bg-white p-5 rounded-2xl border border-indigo-100 shadow-md flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider flex items-center gap-1 mb-2">
              <Tag className="w-3.5 h-3.5" /> Bundle Deal ({selectedItems.length} items)
            </div>

            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-black text-slate-900">
                ₹{(finalBundlePrice / 100).toLocaleString("en-IN")}
              </span>
              {bundleDiscount > 0 && (
                <span className="text-xs text-slate-400 line-through">
                  ₹{(rawSubtotal / 100).toLocaleString("en-IN")}
                </span>
              )}
            </div>

            {bundleDiscount > 0 && (
              <div className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md inline-block mb-4">
                🎉 Extra Bundle Savings: ₹{(bundleDiscount / 100).toLocaleString("en-IN")} (5% OFF)
              </div>
            )}
          </div>

          <Button
            onClick={handleAddBundleToCart}
            disabled={selectedItems.length === 0}
            className={`w-full py-5 rounded-xl font-bold text-sm transition-all shadow-md ${
              isAdded
                ? "bg-emerald-600 hover:bg-emerald-600 text-white"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4 mr-2" /> Bundle Added to Cart!
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" /> Add {selectedItems.length} Items to Cart
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
