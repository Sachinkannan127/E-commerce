export interface CartItem {
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
}

export interface CartSummary {
  items: CartItem[];
  applied_coupon_code?: string;
  subtotal_paise: number;
  discount_paise: number;
  shipping_fee_paise: number;
  total_paise: number;
  free_shipping_remaining_paise: number;
}
