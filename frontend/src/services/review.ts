import { apiClient } from "./api";
import { ApiResponse } from "@/types";

export interface ReviewItem {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  rating: number;
  title: string;
  comment: string;
  photos: string[];
  is_verified_purchase: boolean;
  helpful_votes: number;
  created_at: string;
}

export interface ProductReviewsData {
  avg_rating: number;
  review_count: number;
  distribution: Record<number, number>;
  reviews: ReviewItem[];
}

export async function fetchProductReviews(productId: string): Promise<ProductReviewsData> {
  const res = await apiClient.get<ApiResponse<ProductReviewsData>>(`/reviews/product/${productId}`);
  return res.data.data;
}

export async function submitProductReview(
  productId: string,
  payload: { rating: number; title: string; comment: string; photos?: string[] }
): Promise<ReviewItem> {
  const res = await apiClient.post<ApiResponse<ReviewItem>>(`/reviews/product/${productId}`, payload);
  return res.data.data;
}

export async function voteReviewHelpful(reviewId: string) {
  const res = await apiClient.post<ApiResponse<{ helpful_votes: number; voted: boolean }>>(`/reviews/${reviewId}/vote`);
  return res.data.data;
}
