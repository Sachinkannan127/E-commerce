"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Filter,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Star,
  RotateCcw,
  ChevronDown,
  Check,
  X,
} from "lucide-react";
import { fetchProducts, fetchCategories, fetchBrands } from "@/services/catalog";
import { ProductSummary } from "@/types/product";
import { Category, Brand } from "@/types";
import { ProductCard } from "@/components/product/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ProductsListingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filters state from URL query
  const categorySlug = searchParams.get("category_slug") || "";
  const brandSlug = searchParams.get("brand_slug") || "";
  const searchQuery = searchParams.get("q") || "";
  const sort = searchParams.get("sort") || "relevance";
  const minPrice = searchParams.get("min_price") ? Number(searchParams.get("min_price")) / 100 : "";
  const maxPrice = searchParams.get("max_price") ? Number(searchParams.get("max_price")) / 100 : "";
  const minRating = searchParams.get("min_rating") || "";
  const minDiscount = searchParams.get("min_discount") || "";
  const inStock = searchParams.get("in_stock") === "true";
  const page = Number(searchParams.get("page")) || 1;

  // Local filter inputs
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);

  useEffect(() => {
    async function loadMeta() {
      try {
        const [cats, brs] = await Promise.all([fetchCategories(), fetchBrands()]);
        setCategories(cats);
        setBrands(brs);
      } catch (e) {
        console.error("Error loading categories/brands", e);
      }
    }
    loadMeta();
  }, []);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const params: Record<string, any> = {
          page,
          limit: 16,
          sort,
        };
        if (categorySlug) params.category_slug = categorySlug;
        if (brandSlug) params.brand_slug = brandSlug;
        if (searchQuery) params.q = searchQuery;
        if (minPrice) params.min_price = Number(minPrice) * 100;
        if (maxPrice) params.max_price = Number(maxPrice) * 100;
        if (minRating) params.min_rating = Number(minRating);
        if (minDiscount) params.min_discount = Number(minDiscount);
        if (inStock) params.in_stock_only = true;

        const data = await fetchProducts(params);
        setProducts(data.items);
        setTotal(data.total);
        setTotalPages(data.total_pages);
      } catch (err) {
        console.error("Failed to load products", err);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [
    categorySlug,
    brandSlug,
    searchQuery,
    sort,
    minPrice,
    maxPrice,
    minRating,
    minDiscount,
    inStock,
    page,
  ]);

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1"); // Reset to page 1 on filter update
    router.push(`/products?${params.toString()}`);
  };

  const clearAllFilters = () => {
    setLocalMinPrice("");
    setLocalMaxPrice("");
    router.push("/products");
  };

  const applyPriceFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (localMinPrice) params.set("min_price", String(Number(localMinPrice) * 100));
    else params.delete("min_price");

    if (localMaxPrice) params.set("max_price", String(Number(localMaxPrice) * 100));
    else params.delete("max_price");

    params.set("page", "1");
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="container py-6 space-y-6">
      {/* Header & Active Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {searchQuery
              ? `Results for "${searchQuery}"`
              : categorySlug
              ? `Category: ${categorySlug.replace("-", " ").toUpperCase()}`
              : "All Products"}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Showing {products.length} of {total} items
          </p>
        </div>

        {/* View mode and Sort controls */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden rounded-xl gap-1.5"
          >
            <Filter className="h-4 w-4" /> Filters
          </Button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground hidden sm:inline">
              Sort by:
            </span>
            <select
              value={sort}
              onChange={(e) => updateParam("sort", e.target.value)}
              aria-label="Sort by"
              className="h-9 rounded-xl border bg-background px-3 text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="relevance">Featured & Popular</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating_desc">Customer Rating</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>

          {/* Grid / List view toggle */}
          <div className="hidden sm:flex items-center border rounded-xl p-0.5 bg-muted/30">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "grid" ? "bg-background shadow-xs text-primary" : "text-muted-foreground"
              }`}
              aria-label="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "list" ? "bg-background shadow-xs text-primary" : "text-muted-foreground"
              }`}
              aria-label="List View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid Layout (Sidebar Filters + Products) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Desktop Faceted Filters Sidebar */}
        <aside className={`md:block space-y-6 ${mobileFilterOpen ? "block" : "hidden md:block"}`}>
          <div className="flex items-center justify-between pb-3 border-b">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-primary" /> Filters
            </h3>
            <button
              onClick={clearAllFilters}
              className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" /> Clear All
            </button>
          </div>

          {/* Categories Filter */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Categories
            </h4>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => updateParam("category_slug", null)}
                className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
                  !categorySlug ? "bg-primary/10 text-primary font-bold" : "hover:bg-muted text-foreground"
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => updateParam("category_slug", cat.slug)}
                  className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
                    categorySlug === cat.slug
                      ? "bg-primary/10 text-primary font-bold"
                      : "hover:bg-muted text-foreground"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-3 pt-4 border-t">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Price Range (₹)
            </h4>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min ₹"
                value={localMinPrice}
                onChange={(e) => setLocalMinPrice(e.target.value)}
                className="w-full h-8 px-2 rounded-lg border text-xs bg-background"
              />
              <span className="text-muted-foreground">-</span>
              <input
                type="number"
                placeholder="Max ₹"
                value={localMaxPrice}
                onChange={(e) => setLocalMaxPrice(e.target.value)}
                className="w-full h-8 px-2 rounded-lg border text-xs bg-background"
              />
            </div>
            <Button size="sm" variant="outline" onClick={applyPriceFilter} className="w-full h-8 text-xs rounded-xl font-medium">
              Apply Price
            </Button>
          </div>

          {/* Brands Filter */}
          <div className="space-y-2 pt-4 border-t">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Brands
            </h4>
            <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
              {brands.map((b) => {
                const isChecked = brandSlug === b.slug;
                return (
                  <label
                    key={b.slug}
                    className="flex items-center gap-2 text-xs py-1 px-1 rounded hover:bg-muted cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => updateParam("brand_slug", isChecked ? null : b.slug)}
                      className="rounded text-primary focus:ring-primary h-3.5 w-3.5"
                    />
                    <span>{b.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Customer Rating Filter */}
          <div className="space-y-2 pt-4 border-t">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Customer Rating
            </h4>
            {[4, 3, 2].map((r) => {
              const isSelected = minRating === String(r);
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => updateParam("min_rating", isSelected ? null : String(r))}
                  className={`flex items-center gap-1.5 w-full text-xs px-2 py-1.5 rounded-lg transition-colors ${
                    isSelected ? "bg-primary/10 text-primary font-bold" : "hover:bg-muted text-foreground"
                  }`}
                >
                  <div className="flex items-center text-amber-500">
                    {Array.from({ length: r }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-500" />
                    ))}
                  </div>
                  <span>& Above</span>
                </button>
              );
            })}
          </div>

          {/* Discount Filter */}
          <div className="space-y-2 pt-4 border-t">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Discount
            </h4>
            {[10, 20, 30, 50].map((d) => {
              const isSelected = minDiscount === String(d);
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => updateParam("min_discount", isSelected ? null : String(d))}
                  className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
                    isSelected ? "bg-primary/10 text-primary font-bold" : "hover:bg-muted text-foreground"
                  }`}
                >
                  {d}% or more
                </button>
              );
            })}
          </div>

          {/* In-Stock Only Switch */}
          <div className="pt-4 border-t">
            <label className="flex items-center justify-between text-xs cursor-pointer py-1">
              <span className="font-semibold text-foreground">In Stock Only</span>
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => updateParam("in_stock", e.target.checked ? "true" : null)}
                className="rounded text-primary focus:ring-primary h-4 w-4"
              />
            </label>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="col-span-1 md:col-span-3 space-y-6">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-3 p-3 rounded-2xl border bg-card">
                  <Skeleton className="aspect-square w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-8 w-full rounded-xl" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-2 sm:grid-cols-3 gap-4"
                  : "flex flex-col gap-4"
              }
            >
              {products.map((p) => (
                <ProductCard key={p.id} product={p} viewMode={viewMode} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border rounded-3xl bg-muted/20 space-y-4">
              <p className="text-base font-semibold text-foreground">No products match your filters</p>
              <p className="text-xs text-muted-foreground">Try clearing some filters or search with different keywords</p>
              <Button onClick={clearAllFilters} variant="outline" className="rounded-xl">
                Reset All Filters
              </Button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => updateParam("page", String(page - 1))}
                className="rounded-xl"
              >
                Previous
              </Button>
              <span className="text-xs font-semibold px-3 py-1 bg-muted rounded-xl">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => updateParam("page", String(page + 1))}
                className="rounded-xl"
              >
                Next
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
