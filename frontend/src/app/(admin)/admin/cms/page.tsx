"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Image as ImageIcon, Plus, Trash2, ExternalLink } from "lucide-react";
import { fetchAdminBanners, createAdminBanner, deleteAdminBanner } from "@/services/admin";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminCmsPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    image_url: "",
    link_url: "/products",
    position: "HERO_HOME",
    sort_order: 1,
  });

  const load = async () => {
    try {
      const data = await fetchAdminBanners();
      setBanners(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAdminBanner(form);
      setShowModal(false);
      load();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this hero banner?")) return;
    try {
      await deleteAdminBanner(id);
      load();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b">
        <div>
          <h1 className="text-2xl font-bold">CMS & Homepage Banners</h1>
          <p className="text-xs text-muted-foreground">Manage carousel sliders, seasonal festival banners & promotions</p>
        </div>
        <Button size="sm" onClick={() => setShowModal(true)} className="rounded-xl gap-1.5 text-xs font-bold">
          <Plus className="h-4 w-4" /> Add Banner
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((b) => (
          <Card key={b.id} className="overflow-hidden rounded-3xl space-y-3 p-4 border hover:shadow-lg transition-all">
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-muted">
              <Image src={b.image_url} alt={b.title} fill className="object-cover" />
            </div>

            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-foreground">{b.title}</h3>
                {b.subtitle && <p className="text-xs text-muted-foreground">{b.subtitle}</p>}
                <span className="text-[10px] text-primary block truncate max-w-xs">{b.link_url}</span>
              </div>

              <button
                onClick={() => handleDelete(b.id)}
                className="text-muted-foreground hover:text-rose-500 p-1"
                title="Delete Banner"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="p-6 rounded-3xl max-w-md w-full space-y-4">
            <h3 className="font-bold text-lg">Add Homepage Hero Banner</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Headline Title *</label>
                <Input
                  required
                  placeholder="e.g. Grand Electronics Carnival"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Subtitle Offer</label>
                <Input
                  placeholder="e.g. Up to 60% Off on Top Brands"
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Image URL (High-res 16:9) *</label>
                <Input
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Click Target URL *</label>
                <Input
                  required
                  placeholder="/products?category_slug=electronics"
                  value={form.link_url}
                  onChange={(e) => setForm({ ...form, link_url: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Banner</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
