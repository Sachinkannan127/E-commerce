"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { apiClient } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const res = await apiClient.put("/users/profile", {
        full_name: fullName,
        phone,
      });
      setUser(res.data.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-6 rounded-3xl space-y-6">
      <div className="flex items-center justify-between pb-4 border-b">
        <div>
          <h2 className="text-xl font-bold">Personal Information</h2>
          <p className="text-xs text-muted-foreground">Update your personal and contact details</p>
        </div>
        <Badge variant="success" className="gap-1">
          <ShieldCheck className="h-3.5 w-3.5" /> Verified Account
        </Badge>
      </div>

      <form onSubmit={handleUpdate} className="space-y-4 max-w-lg">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Full Name</label>
          <div className="relative">
            <User className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              required
              className="pl-9"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              disabled
              className="pl-9 bg-muted/40 cursor-not-allowed opacity-80"
              value={user?.email || "No email linked"}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="tel"
              className="pl-9"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Referral Code</label>
          <div className="p-3 rounded-xl bg-muted font-mono text-xs font-bold flex items-center justify-between">
            <span>{user?.referral_code}</span>
            <span className="text-[10px] text-primary">Earn ₹50 on each invite</span>
          </div>
        </div>

        <div className="pt-2 flex items-center gap-3">
          <Button type="submit" disabled={saving} className="rounded-xl px-6">
            {saving ? "Saving Changes..." : "Save Changes"}
          </Button>
          {saved && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" /> Updated successfully!
            </span>
          )}
        </div>
      </form>
    </Card>
  );
}
