import { apiClient } from "./api";
import { ApiResponse } from "@/types";

export interface AdminStatsData {
  gmv_paise: number;
  platform_revenue_paise: number;
  total_orders: number;
  total_users: number;
  total_sellers: number;
  approved_sellers: number;
  total_products: number;
  recent_orders: any[];
}

export async function fetchAdminStats(): Promise<AdminStatsData> {
  const res = await apiClient.get<ApiResponse<AdminStatsData>>("/admin/dashboard/stats");
  return res.data.data;
}

export async function fetchAdminSellers(): Promise<any[]> {
  const res = await apiClient.get<ApiResponse<any[]>>("/admin/sellers");
  return res.data.data;
}

export async function updateAdminSellerStatus(sellerId: string, status: string, commissionPct?: number) {
  const res = await apiClient.put<ApiResponse<any>>(`/admin/sellers/${sellerId}/status`, {
    status,
    commission_rate_pct: commissionPct,
  });
  return res.data.data;
}

export async function fetchAdminProducts(): Promise<any[]> {
  const res = await apiClient.get<ApiResponse<any[]>>("/admin/products");
  return res.data.data;
}

export async function toggleAdminProductPublish(productId: string) {
  const res = await apiClient.put<ApiResponse<any>>(`/admin/products/${productId}/publish`);
  return res.data.data;
}

export async function fetchAdminCoupons(): Promise<any[]> {
  const res = await apiClient.get<ApiResponse<any[]>>("/admin/coupons");
  return res.data.data;
}

export async function createAdminCoupon(data: any) {
  const res = await apiClient.post<ApiResponse<any>>("/admin/coupons", data);
  return res.data.data;
}

export async function deleteAdminCoupon(id: string) {
  const res = await apiClient.delete<ApiResponse<any>>(`/admin/coupons/${id}`);
  return res.data.data;
}

export async function fetchAdminBanners(): Promise<any[]> {
  const res = await apiClient.get<ApiResponse<any[]>>("/admin/cms/banners");
  return res.data.data;
}

export async function createAdminBanner(data: any) {
  const res = await apiClient.post<ApiResponse<any>>("/admin/cms/banners", data);
  return res.data.data;
}

export async function deleteAdminBanner(id: string) {
  const res = await apiClient.delete<ApiResponse<any>>(`/admin/cms/banners/${id}`);
  return res.data.data;
}
