import { apiClient } from "./api";
import { ApiResponse } from "@/types";

export interface SellerKpiData {
  store_name: string;
  status: string;
  lifetime_earnings_paise: number;
  pending_payout_paise: number;
  total_orders_fulfilled: number;
  active_products_count: number;
  low_stock_count: number;
  recent_orders: any[];
}

export async function fetchSellerKpis(): Promise<SellerKpiData> {
  const res = await apiClient.get<ApiResponse<SellerKpiData>>("/seller/dashboard/kpis");
  return res.data.data;
}

export async function fetchSellerProfile() {
  const res = await apiClient.get<ApiResponse<any>>("/seller/profile");
  return res.data.data;
}

export async function submitSellerOnboarding(data: any) {
  const res = await apiClient.post<ApiResponse<any>>("/seller/onboarding", data);
  return res.data.data;
}

export async function fetchSellerProducts(): Promise<any[]> {
  const res = await apiClient.get<ApiResponse<any[]>>("/seller/products");
  return res.data.data;
}

export async function createSellerProduct(data: any) {
  const res = await apiClient.post<ApiResponse<any>>("/seller/products", data);
  return res.data.data;
}

export async function updateVariantStockApi(productId: string, variantId: string, stock: number) {
  const res = await apiClient.put<ApiResponse<any>>(`/seller/inventory/${productId}/stock`, {
    variant_id: variantId,
    stock,
  });
  return res.data.data;
}

export async function fetchSellerOrders(): Promise<any[]> {
  const res = await apiClient.get<ApiResponse<any[]>>("/seller/orders");
  return res.data.data;
}

export async function updateSellerOrderStatus(orderId: string, status: string, trackingNumber?: string) {
  const res = await apiClient.put<ApiResponse<any>>(`/seller/orders/${orderId}/status`, {
    status,
    tracking_number: trackingNumber,
  });
  return res.data.data;
}

export async function fetchSellerPayouts(): Promise<any> {
  const res = await apiClient.get<ApiResponse<any>>("/seller/payouts");
  return res.data.data;
}

export async function requestSellerPayoutApi(amountPaise: number) {
  const res = await apiClient.post<ApiResponse<any>>("/seller/payouts/request", {
    amount_paise: amountPaise,
  });
  return res.data.data;
}
