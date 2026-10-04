import { Header } from "@/components/layout/header";
import { MegaMenu } from "@/components/layout/mega-menu";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { CompareTray } from "@/components/catalog/CompareTray";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <MegaMenu />
      <main className="flex-1">{children}</main>
      <CompareTray />
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

