"use client";

import { useState, useEffect } from "react";
import { Bell, CheckCheck, Package, Tag, Wallet, Sparkles } from "lucide-react";
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead, NotificationItem } from "@/services/notification";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await fetchNotifications();
      setNotifications(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkOne = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b">
        <div>
          <h2 className="text-xl font-bold">Notifications Center</h2>
          <p className="text-xs text-muted-foreground">Order updates, price drop alerts, and promotional announcements</p>
        </div>
        {notifications.length > 0 && (
          <Button size="sm" variant="ghost" onClick={handleMarkAll} className="text-xs gap-1">
            <CheckCheck className="h-4 w-4" /> Mark all as read
          </Button>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card
              key={n.id}
              onClick={() => handleMarkOne(n.id)}
              className={`p-4 rounded-2xl cursor-pointer transition-all flex items-start gap-4 ${
                !n.is_read ? "border-primary/40 bg-primary/5 shadow-xs" : "border bg-card"
              }`}
            >
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary flex-shrink-0 mt-0.5">
                <Bell className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-foreground">{n.title}</h4>
                  <span className="text-[10px] text-muted-foreground">{n.created_at}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{n.message}</p>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl border bg-muted/20 space-y-3">
          <Bell className="h-10 w-10 mx-auto text-muted-foreground" />
          <p className="text-sm font-semibold">No notifications right now</p>
          <p className="text-xs text-muted-foreground">You will be notified about shipment updates and deals here.</p>
        </div>
      )}
    </div>
  );
}
