"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Star,
  ShoppingCart,
  Zap,
  Heart,
  Share2,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  Tag,
  CreditCard,
  ChevronRight,
  Flame,
} from "lucide-react";
import { fetchProductDetail, fetchSimilarProducts } from "@/services/catalog";
import { ProductDetail, ProductVariant, ProductSummary } from "@/types/product";
import { formatPrice } from "@/lib/currency";
import { useCartStore } from "@/store/cart-store";
import { ImageGallery } from "@/components/product/image-gallery";
import { VariantSelector } from "@/components/product/variant-selector";
import { PincodeChecker } from "@/components/product/pincode-checker";
import { StickyBuyBar } from "@/components/product/sticky-buy-bar";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [similarProducts, setSimilarProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<"specs" | "reviews">("specs");

  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    async function loadProduct() {
      if (!slug) return;
      setLoading(true);
      try {
        const data = await fetchProductDetail(slug);
        setProduct(data);
        if (data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0]);
        }
        // Load similar products
        const similar = await fetchSimilarProducts(data.id);
        setSimilarProducts(similar);
      } catch (err) {
        console.error("Failed to load product detail", err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  if (loading || !product) {
    return (
      <div className="container py-8 space-y-6">
        <Skeleton className="h-6 w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square w-full rounded-3xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  const currentPrice = selectedVariant ? selectedVariant.price_paise : product.base_price_paise;
  const currentCompare = selectedVariant?.compare_at_price_paise || product.compare_at_price_paise;
  const currentStock = selectedVariant ? selectedVariant.stock : product.total_stock;
  const isOutOfStock = currentStock <= 0;

  const handleAddToCart = () => {
    addItem({
      product_id: product.id,
      variant_id: selectedVariant?.variant_id || `default-${product.id}`,
      seller_id: product.seller_id,
      title: product.title,
      product_slug: product.slug,
      image_url: product.images[0]?.url || "",
      selected_attributes: selectedVariant
        ? Object.fromEntries(selectedVariant.attributes.map((a) => [a.name, a.value]))
        : {},
      quantity: 1,
      unit_price_paise: currentPrice,
      compare_at_price_paise: currentCompare,
      is_saved_for_later: false,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/checkout");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: product.short_description || product.title,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share cancelled", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Product link copied to clipboard!");
    }
  };

  return (
    <div className="container py-6 space-y-12 pb-24 md:pb-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground overflow-x-auto no-scrollbar">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/products?category_slug=${product.category_slug}`} className="hover:text-foreground capitalize">
          {product.category_slug.replace("-", " ")}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground truncate max-w-[200px]">{product.title}</span>
      </nav>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Left: Interactive Image Gallery */}
        <div>
          <ImageGallery images={product.images} title={product.title} />
        </div>

        {/* Right: Product Buy Box & Specs */}
        <div className="space-y-6">
          <div className="space-y-2">
            {product.brand_name && (
              <span className="text-xs font-bold uppercase tracking-widest text-primary">
                {product.brand_name}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground leading-tight">
              {product.title}
            </h1>

            {/* Ratings & Verified badge */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-1 bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded-md">
                <span>{product.avg_rating}</span>
                <Star className="h-3 w-3 fill-white" />
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                {product.review_count} Ratings & Reviews
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Verified Seller
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-2xl bg-muted/30 border space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-foreground">
                {formatPrice(currentPrice)}
              </span>
              {currentCompare && (
                <>
                  <span className="text-base text-muted-foreground line-through">
                    {formatPrice(currentCompare)}
                  </span>
                  <Badge variant="deal" className="text-xs">
                    {product.discount_pct}% OFF
                  </Badge>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Inclusive of all taxes. Free shipping applicable.</p>
          </div>

          {/* Offers & EMI */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-rose-500/10 border border-amber-500/20 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <Tag className="h-3.5 w-3.5 text-amber-500" /> Available Offers
            </div>
            <ul className="space-y-1 text-muted-foreground">
              <li>• <strong>Bank Offer:</strong> Flat 10% instant discount on HDFC & ICICI Credit Cards.</li>
              <li>• <strong>Special Promo:</strong> Use code <strong>WELCOME100</strong> for ₹100 flat discount on checkout.</li>
              <li>• <strong>No Cost EMI:</strong> Available starting from ₹999/month on major credit cards.</li>
            </ul>
          </div>

          {/* Variant Selector */}
          {selectedVariant && (
            <VariantSelector
              variants={product.variants}
              selectedVariant={selectedVariant}
              onSelectVariant={setSelectedVariant}
            />
          )}

          {/* Action Buttons (Desktop) */}
          <div className="hidden md:flex items-center gap-4 pt-2">
            <Button
              size="lg"
              variant="outline"
              disabled={isOutOfStock}
              onClick={handleAddToCart}
              className="flex-1 rounded-2xl h-12 text-base font-bold shadow-sm"
            >
              <ShoppingCart className="h-5 w-5 mr-2" /> Add to Cart
            </Button>
            <Button
              size="lg"
              disabled={isOutOfStock}
              onClick={handleBuyNow}
              className="flex-1 rounded-2xl h-12 text-base font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md"
            >
              <Zap className="h-5 w-5 mr-2 fill-slate-950" /> Buy Now
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsWishlisted(!isWishlisted)}
              className="h-12 w-12 rounded-2xl border"
              title="Add to Wishlist"
            >
              <Heart className={`h-5 w-5 ${isWishlisted ? "fill-rose-500 text-rose-500" : ""}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="h-12 w-12 rounded-2xl border"
              title="Share Product"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          {/* Pincode Delivery Check */}
          <PincodeChecker productId={product.id} />

          {/* Trust Guarantees */}
          <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
            <div className="p-3 rounded-xl border bg-muted/20 space-y-1">
              <ShieldCheck className="h-5 w-5 mx-auto text-primary" />
              <p className="font-semibold text-foreground">100% Genuine</p>
              <p className="text-[10px] text-muted-foreground">Original Guarantee</p>
            </div>
            <div className="p-3 rounded-xl border bg-muted/20 space-y-1">
              <RotateCcw className="h-5 w-5 mx-auto text-amber-500" />
              <p className="font-semibold text-foreground">7 Days Return</p>
              <p className="text-[10px] text-muted-foreground">Doorstep pickup</p>
            </div>
            <div className="p-3 rounded-xl border bg-muted/20 space-y-1">
              <Truck className="h-5 w-5 mx-auto text-emerald-500" />
              <p className="font-semibold text-foreground">Express Shipping</p>
              <p className="text-[10px] text-muted-foreground">Fast & Secure</p>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications & Reviews Tabs */}
      <section className="space-y-6 pt-8 border-t">
        <div className="flex items-center gap-4 border-b">
          <button
            onClick={() => setActiveTab("specs")}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === "specs"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Product Specifications & Highlights
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === "reviews"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Customer Reviews ({product.review_count})
          </button>
        </div>

        {activeTab === "specs" ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-bold text-base text-foreground">Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* Highlights */}
            {product.highlights && product.highlights.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-bold text-base text-foreground">Key Highlights</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {product.highlights.map((h, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      <span>{h.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Specifications Table */}
            {product.specifications && product.specifications.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-bold text-base text-foreground">Specifications</h3>
                <div className="border rounded-2xl overflow-hidden divide-y text-sm">
                  {product.specifications.map((spec, idx) => (
                    <div key={idx} className="grid grid-cols-3 p-3.5 hover:bg-muted/30">
                      <span className="font-medium text-muted-foreground">{spec.name}</span>
                      <span className="col-span-2 font-semibold text-foreground">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 p-6 rounded-3xl bg-muted/30 border">
              <div className="text-center space-y-1">
                <span className="text-5xl font-black text-foreground">{product.avg_rating}</span>
                <div className="flex items-center justify-center text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-500" />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">{product.review_count} verified ratings</p>
              </div>

              <div className="flex-1 space-y-2 text-xs">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="w-6 font-semibold">{rating} ★</span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${rating === 5 ? 75 : rating === 4 ? 20 : 5}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-muted-foreground">
                      {rating === 5 ? "75%" : rating === 4 ? "20%" : "5%"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Similar Products Carousel / Grid */}
      {similarProducts.length > 0 && (
        <section className="space-y-4 pt-8 border-t">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-foreground">Similar Products You Might Like</h3>
            <Link href={`/products?category_slug=${product.category_slug}`} className="text-xs font-semibold text-primary hover:underline">
              View More
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {similarProducts.map((sim) => (
              <ProductCard key={sim.id} product={sim} />
            ))}
          </div>
        </section>
      )}

      {/* Mobile Sticky Buy Bar */}
      <StickyBuyBar
        pricePaise={currentPrice}
        compareAtPaise={currentCompare}
        stock={currentStock}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />
    </div>
  );
}
