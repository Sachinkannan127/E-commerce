export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon_url?: string;
  banner_url?: string;
  level: number;
  children: Category[];
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  is_featured: boolean;
}
