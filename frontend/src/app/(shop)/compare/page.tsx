"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Scale, 
  Trash2, 
  ShoppingCart, 
  Star, 
  Check, 
  X, 
  ArrowLeft, 
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Plus
} from "lucide-react";
import { useCompareStore } from "@/store/useCompareStore";
import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";

interface ComparisonProduct {
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
  warranty: string;
  return_window: string;
  is_cod_available: boolean;
  highlights: string[];
  specs: Record<string, string>;
}

export default function ComparePage() {
  const { items, removeFromCompare, clearCompare } = useCompareStore();
  const addItem = useCartStore((state) => state.addItem);

  const [loading, setLoading] = useState<boolean>(true);
  const [comparisonData, setComparisonData] = useState<ComparisonProduct[]>([]);
  const [specKeys, setSpecKeys] = useState<string[]>([]);
  const [highlightDifferences, setHighlightDifferences] = useState<boolean>(false);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchComparisonData = async () => {
      if (items.length === 0) {
        setComparisonData([]);
        setSpecKeys([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await api.post("/products/compare", {
          product_ids: items.map((i) => i.id),
        });
        if (res.data?.success && res.data?.data) {
          setComparisonData(res.data.data.products || []);
          setSpecKeys(res.data.data.spec_attributes || []);
        }
      } catch (err) {
        console.error("Failed to load comparison data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchComparisonData();
  }, [items]);

  const handleAddToCart = (product: ComparisonProduct) => {
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
      compare_at_price_paise: product.compare_at_price_paise || product.base_price_paise,
      is_saved_for_later: false,
    });

    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 2000);
  };

  const isSpecDifferent = (key: string) => {
    if (comparisonData.length <= 1) return false;
    const firstVal = comparisonData[0].specs[key] || "—";
    return comparisonData.some((p) => (p.specs[key] || "—") !== firstVal);
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-lg">
        <div className="w-20 h-20 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6">
          <Scale className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Your Comparison Tray is Empty
        </h1>
        <p className="text-slate-600 mb-8 text-sm leading-relaxed">
          Browse through our extensive catalog and click the comparison icon on any product to compare specifications, prices, and features side-by-side.
        </p>
        <Link href="/products">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6 rounded-xl shadow-lg">
            Explore Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/products"
              className="text-xs text-slate-500 hover:text-primary flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Products
            </Link>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
            Product Comparison Matrix
            <Badge variant="outline" className="text-primary border-primary/30">
              {comparisonData.length} of 4 items
            </Badge>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Side-by-side technical specs, warranty, ratings, and pricing comparison
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 px-3 py-2 rounded-lg cursor-pointer transition-colors select-none">
            <input
              type="checkbox"
              checked={highlightDifferences}
              onChange={(e) => setHighlightDifferences(e.target.checked)}
              className="rounded text-primary focus:ring-primary h-4 w-4"
            />
            Highlight Differences Only
          </label>

          <Button
            variant="outline"
            size="sm"
            onClick={clearCompare}
            className="text-red-600 border-red-200 hover:bg-red-50 text-xs"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" /> Clear All
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
          {Array.from({ length: items.length }).map((_, i) => (
            <div key={i} className="h-96 bg-slate-100 rounded-2xl p-4"></div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto pb-8">
          <table className="w-full border-collapse min-w-[700px]">
            {/* Table Header: Product Cards */}
            <thead>
              <tr>
                <th className="w-1/5 p-4 text-left font-semibold text-slate-400 text-xs uppercase tracking-wider align-top bg-slate-50/50 rounded-tl-2xl">
                  Overview
                </th>
                {comparisonData.map((prod) => (
                  <th
                    key={prod.id}
                    className="p-4 align-top text-left bg-white border-l border-slate-100 min-w-[240px]"
                  >
                    <div className="relative group bg-slate-50/70 p-4 rounded-xl border border-slate-100 hover:border-slate-300 transition-all">
                      <button
                        onClick={() => removeFromCompare(prod.id)}
                        className="absolute top-2 right-2 p-1.5 bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-full shadow-sm transition-colors"
                        title="Remove product"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      <div className="relative w-full h-44 mb-3 bg-white rounded-lg p-2 flex items-center justify-center">
                        {prod.primary_image ? (
                          <Image
                            src={prod.primary_image}
                            alt={prod.title}
                            fill
                            className="object-contain p-2"
                          />
                        ) : (
                          <div className="text-slate-300 text-xs">No image</div>
                        )}
                      </div>

                      <div className="text-xs text-primary font-medium mb-1 uppercase tracking-wider">
                        {prod.brand_name}
                      </div>

                      <Link href={`/products/${prod.slug}`}>
                        <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 hover:text-primary transition-colors min-h-[40px]">
                          {prod.title}
                        </h3>
                      </Link>

                      {/* Ratings */}
                      <div className="flex items-center gap-1.5 my-2">
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-600 text-white text-xs font-bold">
                          <span>{prod.avg_rating.toFixed(1)}</span>
                          <Star className="w-3 h-3 fill-current" />
                        </div>
                        <span className="text-xs text-slate-500">
                          ({prod.review_count} ratings)
                        </span>
                      </div>

                      {/* Price */}
                      <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-lg font-bold text-slate-900">
                          ₹{(prod.base_price_paise / 100).toLocaleString("en-IN")}
                        </span>
                        {prod.compare_at_price_paise &&
                          prod.compare_at_price_paise > prod.base_price_paise && (
                            <span className="text-xs text-slate-400 line-through">
                              ₹{(prod.compare_at_price_paise / 100).toLocaleString("en-IN")}
                            </span>
                          )}
                        {prod.discount_pct && prod.discount_pct > 0 && (
                          <span className="text-xs font-bold text-emerald-600">
                            {prod.discount_pct}% OFF
                          </span>
                        )}
                      </div>

                      {/* Add to Cart */}
                      <Button
                        onClick={() => handleAddToCart(prod)}
                        disabled={prod.total_stock <= 0}
                        className={`w-full text-xs font-semibold py-2.5 h-9 rounded-lg transition-all ${
                          addedIds[prod.id]
                            ? "bg-emerald-600 hover:bg-emerald-600 text-white"
                            : "bg-primary hover:bg-primary/90 text-primary-foreground"
                        }`}
                      >
                        {addedIds[prod.id] ? (
                          <>
                            <Check className="w-3.5 h-3.5 mr-1" /> Added
                          </>
                        ) : prod.total_stock > 0 ? (
                          <>
                            <ShoppingCart className="w-3.5 h-3.5 mr-1" /> Add to Cart
                          </>
                        ) : (
                          "Out of Stock"
                        )}
                      </Button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* General Highlights */}
            <tbody>
              <tr className="bg-slate-100/70">
                <td
                  colSpan={comparisonData.length + 1}
                  className="p-3 text-xs font-bold text-slate-700 uppercase tracking-wider"
                >
                  Key Highlights & Policies
                </td>
              </tr>

              {/* Warranty */}
              <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className="p-4 text-xs font-medium text-slate-600 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-slate-400" /> Warranty
                </td>
                {comparisonData.map((prod) => (
                  <td key={prod.id} className="p-4 text-xs text-slate-800 border-l border-slate-100">
                    {prod.warranty}
                  </td>
                ))}
              </tr>

              {/* Return Policy */}
              <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className="p-4 text-xs font-medium text-slate-600 flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-slate-400" /> Return Window
                </td>
                {comparisonData.map((prod) => (
                  <td key={prod.id} className="p-4 text-xs text-slate-800 border-l border-slate-100">
                    {prod.return_window}
                  </td>
                ))}
              </tr>

              {/* Cash on Delivery */}
              <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className="p-4 text-xs font-medium text-slate-600">
                  Cash on Delivery
                </td>
                {comparisonData.map((prod) => (
                  <td key={prod.id} className="p-4 text-xs border-l border-slate-100">
                    {prod.is_cod_available ? (
                      <span className="flex items-center gap-1 text-emerald-600 font-medium">
                        <Check className="w-3.5 h-3.5" /> Available
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-rose-500 font-medium">
                        <X className="w-3.5 h-3.5" /> Not Available
                      </span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Technical Specifications Section */}
              <tr className="bg-slate-100/70">
                <td
                  colSpan={comparisonData.length + 1}
                  className="p-3 text-xs font-bold text-slate-700 uppercase tracking-wider"
                >
                  Technical Specifications
                </td>
              </tr>

              {specKeys.map((key) => {
                const isDiff = isSpecDifferent(key);
                if (highlightDifferences && !isDiff) return null;

                return (
                  <tr
                    key={key}
                    className={`border-b border-slate-100 transition-colors ${
                      isDiff && highlightDifferences ? "bg-amber-50/60" : "hover:bg-slate-50/50"
                    }`}
                  >
                    <td className="p-4 text-xs font-medium text-slate-600">
                      <div className="flex items-center gap-1.5">
                        {isDiff && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        )}
                        {key}
                      </div>
                    </td>
                    {comparisonData.map((prod) => (
                      <td
                        key={prod.id}
                        className={`p-4 text-xs text-slate-800 border-l border-slate-100 ${
                          isDiff && highlightDifferences ? "font-semibold text-amber-950" : ""
                        }`}
                      >
                        {prod.specs[key] || "—"}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
