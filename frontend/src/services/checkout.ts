import { apiClient } from "./api";
import { ApiResponse } from "@/types";

export interface CheckoutSummaryData {
  items_count: number;
  subtotal_paise: number;
  shipping_fee_paise: number;
  tax_paise: number;
  discount_paise: number;
  total_amount_paise: number;
  coupon_code?: string;
  is_free_shipping: boolean;
  shipping_address?: any;
}

export interface CreateOrderPayload {
  address_id: string;
  payment_method: "COD" | "RAZORPAY" | "STRIPE" | "WALLET";
  coupon_code?: string;
  notes?: string;
  is_reseller_order?: boolean;
  reseller_margin_paise?: number;
}

export interface OrderDetailData {
  id: string;
  order_number: string;
  order_status: string;
  payment_status: string;
  payment_method: string;
  total_amount_paise: number;
  items_count: number;
  created_at: string;
  shipping_address: any;
  items: any[];
  timeline: any[];
  invoice_url?: string;
}

export async function fetchCheckoutSummary(addressId?: string, couponCode?: string): Promise<CheckoutSummaryData> {
  const res = await apiClient.post<ApiResponse<CheckoutSummaryData>>("/checkout/summary", {
    address_id: addressId,
    coupon_code: couponCode,
  });
  return res.data.data;
}

export async function placeOrderApi(payload: CreateOrderPayload): Promise<OrderDetailData> {
  const res = await apiClient.post<ApiResponse<OrderDetailData>>("/checkout/place-order", payload);
  return res.data.data;
}

export async function fetchOrderDetail(orderId: string): Promise<OrderDetailData> {
  const res = await apiClient.get<ApiResponse<OrderDetailData>>(`/orders/${orderId}`);
  return res.data.data;
}

export async function createPaymentSession(orderId: string, gateway: string = "RAZORPAY") {
  const res = await apiClient.post<ApiResponse<any>>("/payments/create-session", {
    order_id: orderId,
    gateway,
  });
  return res.data.data;
}

export async function verifyRazorpayPayment(payload: {
  order_id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  const res = await apiClient.post<ApiResponse<any>>("/payments/verify-razorpay", payload);
  return res.data.data;
}
