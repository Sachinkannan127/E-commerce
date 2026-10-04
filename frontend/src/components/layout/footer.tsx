import Link from "next/link";
import { ShieldCheck, Truck, RefreshCw, CreditCard } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30 pt-12 pb-24 md:pb-12 text-sm text-muted-foreground">
      {/* Value Proposition Highlights */}
      <div className="container grid grid-cols-2 md:grid-cols-4 gap-6 pb-10 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <Truck className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Free Delivery</h4>
            <p className="text-xs">On all orders above ₹499</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">100% Genuine</h4>
            <p className="text-xs">Direct from verified sellers</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
            <RefreshCw className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Easy Returns</h4>
            <p className="text-xs">7-day doorstep replacement</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Secure Payments</h4>
            <p className="text-xs">UPI, Cards, NetBanking & COD</p>
          </div>
        </div>
      </div>

      {/* Main Links */}
      <div className="container grid grid-cols-2 md:grid-cols-5 gap-8 py-10">
        <div className="col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white font-black text-lg">
              S
            </div>
            <span className="text-lg font-bold text-foreground">ShopVerse</span>
          </div>
          <p className="text-xs leading-relaxed max-w-sm">
            India&apos;s premier multi-vendor e-commerce destination with 200+ curated products,
            seamless one-tap checkouts, verified sellers, and reseller profit tools.
          </p>
          <div className="text-xs font-medium text-foreground">
            © {new Date().getFullYear()} ShopVerse Inc. All rights reserved.
          </div>
        </div>

        <div className="space-y-2">
          <h5 className="font-semibold text-foreground">Shop Categories</h5>
          <ul className="space-y-1 text-xs">
            <li><Link href="/products?category_slug=electronics" className="hover:text-primary">Electronics</Link></li>
            <li><Link href="/products?category_slug=mobiles" className="hover:text-primary">Mobiles & Tablets</Link></li>
            <li><Link href="/products?category_slug=fashion" className="hover:text-primary">Fashion & Apparel</Link></li>
            <li><Link href="/products?category_slug=home-kitchen" className="hover:text-primary">Home & Kitchen</Link></li>
          </ul>
        </div>

        <div className="space-y-2">
          <h5 className="font-semibold text-foreground">Sell & Earn</h5>
          <ul className="space-y-1 text-xs">
            <li><Link href="/seller/onboarding" className="hover:text-primary">Become a Seller</Link></li>
            <li><Link href="/reseller" className="hover:text-primary">Reseller Program</Link></li>
            <li><Link href="/seller/dashboard" className="hover:text-primary">Seller Portal</Link></li>
            <li><Link href="/spin-and-win" className="hover:text-primary">Spin & Win Rewards</Link></li>
          </ul>
        </div>

        <div className="space-y-2">
          <h5 className="font-semibold text-foreground">Customer Service</h5>
          <ul className="space-y-1 text-xs">
            <li><Link href="/account/orders" className="hover:text-primary">Track Order</Link></li>
            <li><Link href="/account/addresses" className="hover:text-primary">Saved Addresses</Link></li>
            <li><Link href="/help" className="hover:text-primary">Return Policy</Link></li>
            <li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
