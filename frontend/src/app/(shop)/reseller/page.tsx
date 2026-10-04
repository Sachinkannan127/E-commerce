"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Users, 
  TrendingUp, 
  Wallet, 
  Share2, 
  ShoppingBag, 
  MessageSquare, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight,
  Plus,
  Send,
  Building,
  Smartphone,
  Copy,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";

interface ResellerProfile {
  id: string;
  reseller_code: string;
  business_name: string;
  whatsapp_number?: string;
  upi_id?: string;
  total_sales_paise: number;
  total_margin_earned_paise: number;
  withdrawn_margin_paise: number;
  available_margin_paise: number;
  total_customers: number;
  total_orders: number;
  status: string;
}

interface SharedCatalog {
  id: string;
  product_id: string;
  product_name: string;
  product_slug: string;
  product_image?: string | null;
  base_price_paise: number;
  selling_price_paise: number;
  margin_paise: number;
  margin_percent: number;
  shared_clicks: number;
  orders_generated: number;
  created_at: string;
}

interface ResellerOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  products: string[];
  customer_amount_paise: number;
  margin_paise: number;
  status: string;
  date: string;
}

export default function ResellerHubPage() {
  const [profile, setProfile] = useState<ResellerProfile | null>(null);
  const [sharedCatalogs, setSharedCatalogs] = useState<SharedCatalog[]>([]);
  const [orders, setOrders] = useState<ResellerOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"catalogs" | "orders" | "share-new">("catalogs");

  // Share Catalog Form State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [customMargin, setCustomMargin] = useState<number>(150);
  const [shareSuccessData, setShareSuccessData] = useState<any | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Customer Order Form State
  const [isOrderModalOpen, setIsOrderModalOpen] = useState<boolean>(false);
  const [orderCustomerName, setOrderCustomerName] = useState<string>("");
  const [orderCustomerPhone, setOrderCustomerPhone] = useState<string>("");
  const [orderAddressLine, setOrderAddressLine] = useState<string>("");
  const [orderCity, setOrderCity] = useState<string>("");
  const [orderState, setOrderState] = useState<string>("");
  const [orderPincode, setOrderPincode] = useState<string>("");
  const [orderSellingPrice, setOrderSellingPrice] = useState<number>(0);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);

  // Withdrawal State
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState<boolean>(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
  const [withdrawMsg, setWithdrawMsg] = useState<string | null>(null);

  const loadResellerData = async () => {
    try {
      setLoading(true);
      const [profileRes, catalogsRes, ordersRes] = await Promise.all([
        api.get("/reseller/profile"),
        api.get("/reseller/catalogs"),
        api.get("/reseller/orders"),
      ]);

      if (profileRes.data?.success) setProfile(profileRes.data.data);
      if (catalogsRes.data?.success) setSharedCatalogs(catalogsRes.data.data);
      if (ordersRes.data?.success) setOrders(ordersRes.data.data);
    } catch (err) {
      console.error("Failed to load reseller hub data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResellerData();
  }, []);

  const handleProductSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await api.get(`/products?q=${encodeURIComponent(query)}&limit=6`);
      if (res.data?.success && res.data?.data?.items) {
        setSearchResults(res.data.data.items);
      }
    } catch (err) {
      console.error("Failed to search products", err);
    }
  };

  const handleSelectProduct = (prod: any) => {
    setSelectedProduct(prod);
    setSearchResults([]);
    setOrderSellingPrice(Math.round(prod.base_price_paise / 100) + 150);
  };

  const handleGenerateShare = async () => {
    if (!selectedProduct) return;
    const basePriceRupees = selectedProduct.base_price_paise / 100;
    const sellingPricePaise = Math.round((basePriceRupees + Number(customMargin)) * 100);

    try {
      const res = await api.post("/reseller/share-catalog", {
        product_id: selectedProduct.id,
        selling_price_paise: sellingPricePaise,
      });

      if (res.data?.success && res.data?.data) {
        setShareSuccessData(res.data.data);
        loadResellerData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to generate share link");
    }
  };

  const handleOpenWhatsApp = (text: string) => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handleCopyShareLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePlaceCustomerOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      setIsSubmittingOrder(true);
      const res = await api.post("/reseller/order-for-customer", {
        product_id: selectedProduct.id,
        quantity: 1,
        reseller_selling_price_paise: Math.round(orderSellingPrice * 100),
        customer_name: orderCustomerName,
        customer_phone: orderCustomerPhone,
        shipping_address: {
          full_name: orderCustomerName,
          phone: orderCustomerPhone,
          address_line1: orderAddressLine,
          city: orderCity,
          state: orderState,
          pincode: orderPincode,
          address_type: "HOME",
        },
        payment_method: "COD",
      });

      if (res.data?.success) {
        alert(res.data.message || "Customer order placed successfully!");
        setIsOrderModalOpen(false);
        loadResellerData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to place order for customer");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const handleWithdrawMargin = async () => {
    if (withdrawAmount <= 0) return;
    try {
      const res = await api.post("/reseller/withdraw-margin", {
        amount_paise: Math.round(withdrawAmount * 100),
        destination: "WALLET",
      });
      if (res.data?.success) {
        setWithdrawMsg(res.data.message);
        setTimeout(() => {
          setWithdrawMsg(null);
          setIsWithdrawModalOpen(false);
          loadResellerData();
        }, 2000);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Withdrawal failed");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 md:p-10 mb-8 overflow-hidden shadow-xl border border-indigo-700/40">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-bold mb-3 border border-white/10">
            <Smartphone className="w-3.5 h-3.5" /> Meesho-Style Social Reselling Program
          </div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight mb-2">
            Share Products, Set Your Margin & Earn Daily Cash
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Zero investment business. Share wholesale catalogs on WhatsApp & Instagram with your own profit margin. When your customers buy, we deliver and credit your margin instantly!
          </p>
        </div>

        {profile && (
          <div className="relative z-10 mt-6 flex flex-wrap items-center gap-4 pt-4 border-t border-white/10">
            <div className="text-xs">
              <span className="text-slate-400">Store Name: </span>
              <span className="font-bold text-white">{profile.business_name}</span>
            </div>
            <div className="text-xs">
              <span className="text-slate-400">Reseller Code: </span>
              <span className="font-mono font-bold text-amber-300">{profile.reseller_code}</span>
            </div>
          </div>
        )}
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-card border shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Total Margin Earned</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-foreground">
            ₹{((profile?.total_margin_earned_paise || 0) / 100).toLocaleString("en-IN")}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">Lifetime profit</span>
        </div>

        <div className="p-5 rounded-2xl bg-card border shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Available to Withdraw</span>
            <Wallet className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-indigo-600">
            ₹{((profile?.available_margin_paise || 0) / 100).toLocaleString("en-IN")}
          </div>
          <button
            onClick={() => {
              setWithdrawAmount((profile?.available_margin_paise || 0) / 100);
              setIsWithdrawModalOpen(true);
            }}
            disabled={(profile?.available_margin_paise || 0) <= 0}
            className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-1 disabled:opacity-50"
          >
            Transfer to Wallet <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        <div className="p-5 rounded-2xl bg-card border shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Customer Orders</span>
            <ShoppingBag className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-foreground">
            {profile?.total_orders || 0}
          </div>
          <span className="text-[11px] text-muted-foreground">Fulfilled orders</span>
        </div>

        <div className="p-5 rounded-2xl bg-card border shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Customers Reached</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-black text-foreground">
            {profile?.total_customers || 0}
          </div>
          <span className="text-[11px] text-muted-foreground">Network contacts</span>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-2 border-b mb-6 pb-2">
        <button
          onClick={() => setActiveTab("catalogs")}
          className={`px-4 py-2 text-sm font-bold rounded-xl transition-colors ${
            activeTab === "catalogs"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          My Shared Catalogs ({sharedCatalogs.length})
        </button>
        <button
          onClick={() => setActiveTab("share-new")}
          className={`px-4 py-2 text-sm font-bold rounded-xl transition-colors flex items-center gap-1.5 ${
            activeTab === "share-new"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Plus className="w-4 h-4" /> Share New Product
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2 text-sm font-bold rounded-xl transition-colors ${
            activeTab === "orders"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          Customer Orders ({orders.length})
        </button>
      </div>

      {/* TAB 1: Share New Product Studio */}
      {activeTab === "share-new" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-card p-6 rounded-3xl border shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-foreground">
                Step 1: Choose Product from Catalog
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Search through our catalog to pick products you want to resell
              </p>
            </div>

            <div className="relative">
              <Input
                placeholder="Search products by title, category, or brand..."
                value={searchQuery}
                onChange={(e) => handleProductSearch(e.target.value)}
                className="h-11 rounded-xl pr-10"
              />
              {searchResults.length > 0 && (
                <div className="absolute top-12 left-0 right-0 z-20 bg-card border rounded-2xl shadow-xl overflow-hidden divide-y max-h-60 overflow-y-auto">
                  {searchResults.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => handleSelectProduct(prod)}
                      className="p-3 flex items-center gap-3 hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <div className="relative w-10 h-10 rounded-lg bg-muted flex-shrink-0">
                        {prod.primary_image && (
                          <Image
                            src={prod.primary_image}
                            alt={prod.title}
                            fill
                            className="object-contain p-1"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-foreground truncate">
                          {prod.title}
                        </h4>
                        <span className="text-xs font-bold text-emerald-600">
                          Base Price: ₹{(prod.base_price_paise / 100).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedProduct && (
              <div className="p-4 rounded-2xl bg-muted/30 border flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-xl bg-white flex-shrink-0">
                  {selectedProduct.primary_image && (
                    <Image
                      src={selectedProduct.primary_image}
                      alt={selectedProduct.title}
                      fill
                      className="object-contain p-2"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <span className="text-[10px] uppercase font-bold text-primary">Selected Product</span>
                  <h4 className="text-sm font-bold text-foreground line-clamp-1">{selectedProduct.title}</h4>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Wholesale Base: <strong className="text-foreground">₹{(selectedProduct.base_price_paise / 100).toLocaleString("en-IN")}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Custom Margin Calculator */}
            {selectedProduct && (
              <div className="space-y-4 pt-4 border-t">
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    Step 2: Set Your Custom Margin
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    How much profit margin do you want to add on top of base cost?
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      Your Margin (₹)
                    </label>
                    <Input
                      type="number"
                      value={customMargin}
                      onChange={(e) => setCustomMargin(Number(e.target.value))}
                      className="h-11 rounded-xl font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      Final Selling Price
                    </label>
                    <div className="h-11 rounded-xl bg-muted/50 border flex items-center px-4 font-black text-foreground">
                      ₹{((selectedProduct.base_price_paise / 100) + Number(customMargin)).toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleGenerateShare}
                    className="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    <Share2 className="w-4 h-4 mr-2" /> Prepare WhatsApp Pitch
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsOrderModalOpen(true)}
                    className="h-12 rounded-xl font-bold border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                  >
                    <Plus className="w-4 h-4 mr-1.5" /> Place for Customer
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Right: WhatsApp Share Preview */}
          <div className="lg:col-span-5 bg-card p-6 rounded-3xl border shadow-sm space-y-4">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" /> WhatsApp Message Preview
            </h3>

            {shareSuccessData ? (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="p-4 rounded-2xl bg-emerald-950/10 border border-emerald-500/30 text-xs font-mono whitespace-pre-line text-emerald-900 dark:text-emerald-300 leading-relaxed">
                  {shareSuccessData.whatsapp_share_text}
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => handleOpenWhatsApp(shareSuccessData.whatsapp_share_text)}
                    className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 shadow-md"
                  >
                    <Send className="w-4 h-4" /> Share on WhatsApp Now
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => handleCopyShareLink(shareSuccessData.shareable_url)}
                    className="w-full h-11 rounded-xl text-xs font-semibold"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-4 h-4 mr-1.5 text-emerald-600" /> Copied Direct Link!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1.5" /> Copy Product Link
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-muted/30 border text-center text-xs text-muted-foreground space-y-2">
                <Smartphone className="w-8 h-8 mx-auto text-muted-foreground/50" />
                <p>Select a product and configure your margin to see the pre-formatted WhatsApp share message here.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Shared Catalogs List */}
      {activeTab === "catalogs" && (
        <div className="bg-card rounded-3xl border shadow-sm overflow-hidden">
          {sharedCatalogs.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-sm space-y-3">
              <Share2 className="w-8 h-8 mx-auto text-muted-foreground/50" />
              <p>No products shared yet. Start sharing products to build your catalog!</p>
              <Button onClick={() => setActiveTab("share-new")} size="sm" className="rounded-xl">
                Share Your First Product
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 uppercase text-[10px] font-bold text-muted-foreground border-b">
                  <tr>
                    <th className="p-4">Product</th>
                    <th className="p-4">Base Cost</th>
                    <th className="p-4">Your Price</th>
                    <th className="p-4">Your Margin</th>
                    <th className="p-4">Clicks</th>
                    <th className="p-4">Orders</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {sharedCatalogs.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-lg bg-muted flex-shrink-0">
                          {item.product_image && (
                            <Image
                              src={item.product_image}
                              alt={item.product_name}
                              fill
                              className="object-contain p-1"
                            />
                          )}
                        </div>
                        <span className="font-semibold text-foreground max-w-[200px] truncate">
                          {item.product_name}
                        </span>
                      </td>
                      <td className="p-4 font-mono">
                        ₹{(item.base_price_paise / 100).toLocaleString("en-IN")}
                      </td>
                      <td className="p-4 font-bold font-mono text-foreground">
                        ₹{(item.selling_price_paise / 100).toLocaleString("en-IN")}
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="text-emerald-600 border-emerald-200 font-bold font-mono">
                          +₹{(item.margin_paise / 100).toLocaleString("en-IN")} ({item.margin_percent}%)
                        </Badge>
                      </td>
                      <td className="p-4 font-medium">{item.shared_clicks}</td>
                      <td className="p-4 font-bold text-foreground">{item.orders_generated}</td>
                      <td className="p-4 text-right">
                        <Link href={`/products/${item.product_slug}`}>
                          <Button size="sm" variant="outline" className="h-8 text-[11px] rounded-lg">
                            View Page
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Customer Orders List */}
      {activeTab === "orders" && (
        <div className="bg-card rounded-3xl border shadow-sm overflow-hidden">
          {orders.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-sm space-y-2">
              <ShoppingBag className="w-8 h-8 mx-auto text-muted-foreground/50" />
              <p>No customer orders placed through your reseller code yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 uppercase text-[10px] font-bold text-muted-foreground border-b">
                  <tr>
                    <th className="p-4">Order #</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Products</th>
                    <th className="p-4">Total Charged</th>
                    <th className="p-4">Your Margin</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-4 font-mono font-bold text-foreground">
                        {ord.order_number}
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-foreground">{ord.customer_name}</div>
                        <div className="text-[10px] text-muted-foreground">{ord.customer_phone}</div>
                      </td>
                      <td className="p-4 max-w-[200px] truncate text-muted-foreground">
                        {ord.products.join(", ")}
                      </td>
                      <td className="p-4 font-bold font-mono">
                        ₹{(ord.customer_amount_paise / 100).toLocaleString("en-IN")}
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="text-emerald-600 border-emerald-200 font-bold font-mono">
                          +₹{(ord.margin_paise / 100).toLocaleString("en-IN")}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary" className="text-[10px]">
                          {ord.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-muted-foreground text-[10px]">
                        {ord.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Place Order for Customer Modal */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-lg rounded-3xl border shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-foreground">
                Place Order for Customer
              </h3>
              <button
                onClick={() => setIsOrderModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePlaceCustomerOrder} className="space-y-3 text-xs">
              <div className="p-3 bg-muted/40 rounded-xl">
                <span className="font-semibold text-foreground">{selectedProduct?.title}</span>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  Wholesale Cost: ₹{(selectedProduct?.base_price_paise / 100).toFixed(2)}
                </div>
              </div>

              <div>
                <label className="font-medium text-muted-foreground">Price Customer Will Pay (₹)</label>
                <Input
                  type="number"
                  required
                  value={orderSellingPrice}
                  onChange={(e) => setOrderSellingPrice(Number(e.target.value))}
                  className="h-10 rounded-xl mt-1 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-medium text-muted-foreground">Customer Full Name</label>
                  <Input
                    required
                    placeholder="Customer Name"
                    value={orderCustomerName}
                    onChange={(e) => setOrderCustomerName(e.target.value)}
                    className="h-10 rounded-xl mt-1"
                  />
                </div>
                <div>
                  <label className="font-medium text-muted-foreground">Customer Phone Number</label>
                  <Input
                    required
                    placeholder="10-digit mobile"
                    value={orderCustomerPhone}
                    onChange={(e) => setOrderCustomerPhone(e.target.value)}
                    className="h-10 rounded-xl mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-muted-foreground">Full Street Address</label>
                <Input
                  required
                  placeholder="House/Flat No, Building, Street"
                  value={orderAddressLine}
                  onChange={(e) => setOrderAddressLine(e.target.value)}
                  className="h-10 rounded-xl mt-1"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-medium text-muted-foreground">City</label>
                  <Input
                    required
                    value={orderCity}
                    onChange={(e) => setOrderCity(e.target.value)}
                    className="h-10 rounded-xl mt-1"
                  />
                </div>
                <div>
                  <label className="font-medium text-muted-foreground">State</label>
                  <Input
                    required
                    value={orderState}
                    onChange={(e) => setOrderState(e.target.value)}
                    className="h-10 rounded-xl mt-1"
                  />
                </div>
                <div>
                  <label className="font-medium text-muted-foreground">PIN Code</label>
                  <Input
                    required
                    value={orderPincode}
                    onChange={(e) => setOrderPincode(e.target.value)}
                    className="h-10 rounded-xl mt-1"
                  />
                </div>
              </div>

              <div className="pt-3 border-t flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOrderModalOpen(false)}
                  className="flex-1 h-11 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingOrder}
                  className="flex-1 h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                >
                  {isSubmittingOrder ? "Placing..." : "Confirm & Ship COD"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-sm rounded-3xl border shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-foreground">
              Transfer Earnings to Wallet
            </h3>
            <p className="text-xs text-muted-foreground">
              Instant transfer of your available margin to your ShopVerse Wallet balance.
            </p>

            <div className="p-4 bg-muted/40 rounded-2xl">
              <span className="text-xs text-muted-foreground">Available to transfer</span>
              <div className="text-xl font-black text-indigo-600">
                ₹{((profile?.available_margin_paise || 0) / 100).toFixed(2)}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Amount to Transfer (₹)
              </label>
              <Input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                className="h-11 rounded-xl mt-1 font-bold"
              />
            </div>

            {withdrawMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold">
                {withdrawMsg}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsWithdrawModalOpen(false)}
                className="flex-1 h-11 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleWithdrawMargin}
                disabled={withdrawAmount <= 0}
                className="flex-1 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
              >
                Transfer Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
