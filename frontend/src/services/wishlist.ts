import { apiClient } from "./api";
import { ApiResponse } from "@/types";
import { ProductSummary } from "@/types/product";

export interface WishlistData {
  items: ProductSummary[];
  total_count: number;
}

export async function fetchWishlist(): Promise<WishlistData> {
  const res = await apiClient.get<ApiResponse<WishlistData>>("/wishlist");
  return res.data.data;
}

export async function toggleWishlist(productId: string): Promise<{ product_id: string; is_wishlisted: boolean }> {
  const res = await apiClient.post<ApiResponse<any>>(`/wishlist/${productId}`);
  return res.data.data;
}

export async function removeFromWishlist(productId: string): Promise<void> {
  await apiClient.delete<ApiResponse<any>>(`/wishlist/${productId}`);
}
