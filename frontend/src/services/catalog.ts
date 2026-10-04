import { apiClient } from "./api";
import { ApiResponse, PaginatedResponse, Category, Brand } from "@/types";
import { ProductSummary, ProductDetail } from "@/types/product";

export interface SearchSuggestionItem {
  title: string;
  slug: string;
  type: "product" | "category" | "brand";
  image_url?: string;
  price_paise?: number;
  category_slug?: string;
}

export interface SearchSuggestData {
  query: string;
  suggestions: SearchSuggestionItem[];
  trending: string[];
}

export interface PincodeCheckResult {
  pincode: string;
  is_deliverable: boolean;
  estimated_delivery_days: number;
  estimated_delivery_date: string;
  is_cod_available: boolean;
  shipping_fee_paise: number;
  free_delivery_threshold_paise: number;
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await apiClient.get<ApiResponse<Category[]>>("/categories");
  return res.data.data;
}

export async function fetchBrands(): Promise<Brand[]> {
  const res = await apiClient.get<ApiResponse<Brand[]>>("/brands");
  return res.data.data;
}

export async function fetchProducts(params: Record<string, any> = {}): Promise<PaginatedResponse<ProductSummary>> {
  const res = await apiClient.get<ApiResponse<PaginatedResponse<ProductSummary>>>("/products", {
    params,
  });
  return res.data.data;
}

export async function fetchProductDetail(slug: string): Promise<ProductDetail> {
  const res = await apiClient.get<ApiResponse<ProductDetail>>(`/products/${slug}`);
  return res.data.data;
}

export async function fetchSimilarProducts(productId: string): Promise<ProductSummary[]> {
  const res = await apiClient.get<ApiResponse<ProductSummary[]>>(`/products/${productId}/similar`);
  return res.data.data;
}

export async function fetchSearchSuggestions(q: string): Promise<SearchSuggestData> {
  const res = await apiClient.get<ApiResponse<SearchSuggestData>>("/search/suggest", {
    params: { q },
  });
  return res.data.data;
}

export async function checkPincodeDelivery(pincode: string, productId?: string): Promise<PincodeCheckResult> {
  const res = await apiClient.post<ApiResponse<PincodeCheckResult>>("/products/pincode-check", {
    pincode,
    product_id: productId,
  });
  return res.data.data;
}
