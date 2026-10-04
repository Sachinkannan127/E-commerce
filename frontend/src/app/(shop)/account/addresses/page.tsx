"use client";

import { useState, useEffect } from "react";
import { MapPin, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { fetchUserAddresses, createUserAddress, deleteUserAddress, AddressData } from "@/services/user";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<AddressData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    address_type: "HOME" as const,
    country: "India",
    is_default: false,
  });

  const load = async () => {
    try {
      const data = await fetchUserAddresses();
      setAddresses(data);
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
      await createUserAddress(form);
      setShowModal(false);
      load();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      await deleteUserAddress(id);
      setAddresses(addresses.filter((a) => a.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b">
        <div>
          <h2 className="text-xl font-bold">Saved Delivery Addresses</h2>
          <p className="text-xs text-muted-foreground">Manage your delivery and billing addresses</p>
        </div>
        <Button size="sm" onClick={() => setShowModal(true)} className="rounded-xl gap-1.5 text-xs">
          <Plus className="h-4 w-4" /> Add Address
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {addresses.map((addr) => (
          <Card key={addr.id} className="p-5 rounded-3xl relative space-y-2 border">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">{addr.full_name}</span>
                {addr.is_default && (
                  <Badge variant="success" className="text-[10px]">
                    Default
                  </Badge>
                )}
              </div>
              <button
                onClick={() => handleDelete(addr.id)}
                className="text-muted-foreground hover:text-rose-500 transition-colors"
                title="Delete Address"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {addr.address_line1}, {addr.address_line2 ? `${addr.address_line2}, ` : ""}
              {addr.city}, {addr.state} - {addr.pincode}
            </p>
            <p className="text-xs font-semibold text-foreground">📞 {addr.phone}</p>
          </Card>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="p-6 rounded-3xl max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg">Add New Address</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <Input
                placeholder="Full Name"
                required
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              />
              <Input
                placeholder="10-digit Phone Number"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <Input
                placeholder="Flat / Building Name"
                required
                value={form.address_line1}
                onChange={(e) => setForm({ ...form, address_line1: e.target.value })}
              />
              <Input
                placeholder="Street / Colony"
                value={form.address_line2}
                onChange={(e) => setForm({ ...form, address_line2: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="City"
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
                <Input
                  placeholder="State"
                  required
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                />
              </div>
              <Input
                placeholder="6-digit PIN code"
                required
                maxLength={6}
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Address</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
