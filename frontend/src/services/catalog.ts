import { apiClient } from "./api";
import { ApiResponse, PaginatedResponse, Category } from "@/types";
import { ProductSummary, ProductDetail } from "@/types/product";

export async function fetchCategories(): Promise<Category[]> {
  const res = await apiClient.get<ApiResponse<Category[]>>("/categories");
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
