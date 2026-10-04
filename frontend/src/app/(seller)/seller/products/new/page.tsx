"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { createSellerProduct } from "@/services/seller";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NewProductPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [categorySlug, setCategorySlug] = useState("electronics");
  const [brandName, setBrandName] = useState("");
  const [description, setDescription] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [priceRupees, setPriceRupees] = useState("");
  const [comparePriceRupees, setComparePriceRupees] = useState("");
  const [stock, setStock] = useState("25");
  const [tags, setTags] = useState("electronics, bestseller, audio");

  // Images
  const [images, setImages] = useState<string[]>([
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
  ]);
  const [newImageUrl, setNewImageUrl] = useState("");

  // Specifications
  const [specs, setSpecs] = useState([
    { group: "General", name: "Warranty", value: "1 Year Brand Warranty" },
    { group: "General", name: "Country of Origin", value: "India" },
  ]);

  // Highlights
  const [highlights, setHighlights] = useState([
    "100% Genuine Certified Product",
    "Fast Doorstep Delivery Available",
    "7-Day Doorstep Replacement Policy",
  ]);

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setImages([...images, newImageUrl.trim()]);
      setNewImageUrl("");
    }
  };

  const handleAddSpec = () => {
    setSpecs([...specs, { group: "General", name: "", value: "" }]);
  };

  const handleAddHighlight = () => {
    setHighlights([...highlights, ""]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const basePaise = Number(priceRupees) * 100;
      const comparePaise = comparePriceRupees ? Number(comparePriceRupees) * 100 : basePaise * 1.3;

      const payload = {
        title,
        category_slug: categorySlug,
        brand_name: brandName || undefined,
        description,
        short_description: shortDesc,
        tags: tags.split(",").map((t) => t.trim()),
        images: images.map((url, i) => ({ url, is_primary: i === 0 })),
        base_price_paise: basePaise,
        compare_at_price_paise: comparePaise,
        total_stock: Number(stock),
        specifications: specs.filter((s) => s.name && s.value),
        highlights: highlights.filter((h) => h.trim()).map((text) => ({ text })),
      };

      await createSellerProduct(payload);
      alert("Product published to catalog successfully!");
      router.push("/seller/products");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to create product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl pb-16">
      <div className="flex items-center gap-3 pb-3 border-b">
        <Link href="/seller/products">
          <Button variant="ghost" size="sm" className="rounded-xl">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Add New Product</h1>
          <p className="text-xs text-muted-foreground">List a new product with specifications, pricing & images</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Basic Information */}
        <Card className="p-6 rounded-3xl space-y-4">
          <h2 className="text-sm font-bold text-foreground">Basic Information</h2>

          <div className="space-y-1">
            <label className="font-semibold text-foreground">Product Title *</label>
            <Input
              required
              placeholder="e.g. Ultra Noise Cancelling Wireless Headphones Pro"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Category *</label>
              <select
                value={categorySlug}
                onChange={(e) => setCategorySlug(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border bg-background"
              >
                <option value="electronics">Electronics & Gadgets</option>
                <option value="mobiles">Mobiles & Accessories</option>
                <option value="fashion">Fashion & Apparel</option>
                <option value="footwear">Footwear</option>
                <option value="home-kitchen">Home & Kitchen</option>
                <option value="beauty">Beauty & Personal Care</option>
                <option value="sports-fitness">Sports & Fitness</option>
                <option value="books-stationery">Books & Stationery</option>
                <option value="toys-baby">Toys & Baby Care</option>
                <option value="groceries">Gourmet & Groceries</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">Brand Name</label>
              <Input
                placeholder="e.g. Sony, Boat, Apple"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground">Short Description</label>
            <Input
              placeholder="One line summary for search cards"
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground">Detailed Description *</label>
            <textarea
              required
              rows={4}
              placeholder="Comprehensive product details, warranty, dimensions, and usage guide..."
              className="w-full p-3 rounded-xl border bg-background text-xs"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground">Tags (comma separated)</label>
            <Input
              placeholder="electronics, audio, trending"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
        </Card>

        {/* Pricing & Stock */}
        <Card className="p-6 rounded-3xl space-y-4">
          <h2 className="text-sm font-bold text-foreground">Pricing & Stock</h2>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Selling Price (₹) *</label>
              <Input
                type="number"
                required
                placeholder="2499"
                value={priceRupees}
                onChange={(e) => setPriceRupees(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">MRP / Compare Price (₹)</label>
              <Input
                type="number"
                placeholder="4999"
                value={comparePriceRupees}
                onChange={(e) => setComparePriceRupees(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">Initial Stock Quantity *</label>
              <Input
                type="number"
                required
                placeholder="50"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Product Images */}
        <Card className="p-6 rounded-3xl space-y-4">
          <h2 className="text-sm font-bold text-foreground">Product Images (URLs)</h2>

          <div className="flex gap-2">
            <Input
              placeholder="Paste Image URL (Unsplash / Cloudinary / S3)"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
            />
            <Button type="button" onClick={handleAddImage} className="rounded-xl px-4">
              Add Image
            </Button>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            {images.map((url, i) => (
              <div key={i} className="relative h-20 w-20 rounded-xl overflow-hidden border bg-muted group">
                <img src={url} alt="Product" className="object-cover h-full w-full" />
                <button
                  type="button"
                  onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                  className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Specifications */}
        <Card className="p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground">Specifications</h2>
            <Button type="button" variant="outline" size="sm" onClick={handleAddSpec} className="rounded-xl">
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Spec
            </Button>
          </div>

          <div className="space-y-2">
            {specs.map((spec, i) => (
              <div key={i} className="grid grid-cols-3 gap-2">
                <Input
                  placeholder="Spec Name (e.g. Battery)"
                  value={spec.name}
                  onChange={(e) => {
                    const updated = [...specs];
                    updated[i].name = e.target.value;
                    setSpecs(updated);
                  }}
                />
                <Input
                  placeholder="Spec Value (e.g. 5000mAh)"
                  className="col-span-2"
                  value={spec.value}
                  onChange={(e) => {
                    const updated = [...specs];
                    updated[i].value = e.target.value;
                    setSpecs(updated);
                  }}
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-4">
          <Link href="/seller/products">
            <Button type="button" variant="outline" className="rounded-xl px-6">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={submitting} className="rounded-xl px-8 font-bold bg-amber-500 hover:bg-amber-600 text-slate-950">
            {submitting ? "Publishing..." : "Publish Product"}
          </Button>
        </div>
      </form>
    </div>
  );
}
