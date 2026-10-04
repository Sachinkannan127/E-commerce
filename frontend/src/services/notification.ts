import { apiClient } from "./api";
import { ApiResponse } from "@/types";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  link_url?: string;
  is_read: boolean;
  created_at: string;
}

export async function fetchNotifications(): Promise<NotificationItem[]> {
  const res = await apiClient.get<ApiResponse<NotificationItem[]>>("/notifications");
  return res.data.data;
}

export async function markNotificationAsRead(id: string): Promise<void> {
  await apiClient.put<ApiResponse<any>>(`/notifications/${id}/read`);
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await apiClient.put<ApiResponse<any>>("/notifications/read-all");
}
