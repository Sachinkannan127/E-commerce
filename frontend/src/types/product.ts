export interface ProductImage {
  url: string;
  alt?: string;
  is_primary: boolean;
  display_order: number;
}

export interface VariantAttribute {
  name: string;
  value: string;
}

export interface ProductVariant {
  variant_id: string;
  sku: string;
  attributes: VariantAttribute[];
  price_paise: number;
  compare_at_price_paise?: number;
  stock: number;
  images: ProductImage[];
  is_active: boolean;
}

export interface ProductSpecification {
  group: string;
  name: string;
  value: string;
}

export interface ProductHighlight {
  icon?: string;
  text: string;
}

export interface ProductSummary {
  id: string;
  title: string;
  slug: string;
  category_slug: string;
  brand_name?: string;
  primary_image?: string;
  base_price_paise: number;
  compare_at_price_paise?: number;
  discount_pct: number;
  avg_rating: number;
  review_count: number;
  total_stock: number;
  is_bestseller: boolean;
  is_trending: boolean;
  is_flash_deal: boolean;
}

export interface ProductDetail extends ProductSummary {
  seller_id: string;
  category_id: string;
  brand_id?: string;
  description: string;
  short_description?: string;
  tags: string[];
  images: ProductImage[];
  variants: ProductVariant[];
  specifications: ProductSpecification[];
  highlights: ProductHighlight[];
  flash_deal_end_at?: string;
}
