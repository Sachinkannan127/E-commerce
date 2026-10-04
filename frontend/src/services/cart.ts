import { apiClient } from "./api";
import { ApiResponse } from "@/types";

export interface CartItemDto {
  product_id: string;
  variant_id: string;
  seller_id: string;
  title: string;
  product_slug: string;
  image_url: string;
  selected_attributes: Record<string, string>;
  quantity: number;
  unit_price_paise: number;
  compare_at_price_paise?: number;
  is_saved_for_later: boolean;
  in_stock: boolean;
  available_stock: number;
}

export interface CartResponseData {
  items: CartItemDto[];
  saved_for_later: CartItemDto[];
  applied_coupon_code?: string;
  subtotal_paise: number;
  discount_paise: number;
  shipping_fee_paise: number;
  total_amount_paise: number;
  total_savings_paise: number;
  free_shipping_threshold_paise: number;
  free_shipping_remaining_paise: number;
}

export async function fetchCart(): Promise<CartResponseData> {
  const res = await apiClient.get<ApiResponse<CartResponseData>>("/cart");
  return res.data.data;
}

export async function addItemToCart(
  productId: string,
  variantId: string,
  quantity: number = 1,
  selectedAttributes: Record<string, string> = {}
): Promise<CartResponseData> {
  const res = await apiClient.post<ApiResponse<CartResponseData>>("/cart/items", {
    product_id: productId,
    variant_id: variantId,
    quantity,
    selected_attributes: selectedAttributes,
  });
  return res.data.data;
}

export async function updateCartItemQuantity(variantId: string, quantity: number): Promise<CartResponseData> {
  const res = await apiClient.put<ApiResponse<CartResponseData>>(`/cart/items/${variantId}`, {
    quantity,
  });
  return res.data.data;
}

export async function removeCartItem(variantId: string): Promise<CartResponseData> {
  const res = await apiClient.delete<ApiResponse<CartResponseData>>(`/cart/items/${variantId}`);
  return res.data.data;
}

export async function toggleSaveForLater(variantId: string): Promise<CartResponseData> {
  const res = await apiClient.post<ApiResponse<CartResponseData>>(`/cart/save-for-later/${variantId}`);
  return res.data.data;
}

export async function applyCouponApi(couponCode: string): Promise<CartResponseData> {
  const res = await apiClient.post<ApiResponse<CartResponseData>>("/cart/apply-coupon", {
    coupon_code: couponCode,
  });
  return res.data.data;
}

export async function removeCouponApi(): Promise<CartResponseData> {
  const res = await apiClient.delete<ApiResponse<CartResponseData>>("/cart/remove-coupon");
  return res.data.data;
}
