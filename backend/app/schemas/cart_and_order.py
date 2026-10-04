from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from app.models.address import AddressSnapshot
from app.models.order import OrderStatus, PaymentStatus, PaymentMethod


class CartItemDto(BaseModel):
    product_id: str
    variant_id: str
    seller_id: str
    title: str
    product_slug: str
    image_url: str
    selected_attributes: Dict[str, str] = Field(default_factory=dict)
    quantity: int = Field(default=1, ge=1)
    unit_price_paise: int
    compare_at_price_paise: Optional[int] = None
    is_saved_for_later: bool = False
    in_stock: bool = True
    available_stock: int = 10


class CartResponse(BaseModel):
    items: List[CartItemDto]
    saved_for_later: List[CartItemDto] = Field(default_factory=list)
    applied_coupon_code: Optional[str] = None
    subtotal_paise: int
    discount_paise: int
    shipping_fee_paise: int
    total_amount_paise: int
    total_savings_paise: int
    free_shipping_threshold_paise: int
    free_shipping_remaining_paise: int


class AddToCartRequest(BaseModel):
    product_id: str
    variant_id: str
    quantity: int = Field(default=1, ge=1)
    selected_attributes: Dict[str, str] = Field(default_factory=dict)


class UpdateCartItemRequest(BaseModel):
    quantity: int = Field(ge=0)


class ApplyCouponRequest(BaseModel):
    coupon_code: str


class CheckoutSummaryRequest(BaseModel):
    address_id: Optional[str] = None
    coupon_code: Optional[str] = None


class CheckoutSummaryResponse(BaseModel):
    items_count: int
    subtotal_paise: int
    shipping_fee_paise: int
    tax_paise: int
    discount_paise: int
    total_amount_paise: int
    coupon_code: Optional[str] = None
    is_free_shipping: bool
    shipping_address: Optional[AddressSnapshot] = None


class CreateOrderRequest(BaseModel):
    address_id: str
    payment_method: PaymentMethod = PaymentMethod.COD
    coupon_code: Optional[str] = None
    notes: Optional[str] = None
    
    # Reseller metadata (Meesho mode)
    is_reseller_order: bool = False
    reseller_margin_paise: int = 0


class OrderResponse(BaseModel):
    id: str
    order_number: str
    order_status: OrderStatus
    payment_status: PaymentStatus
    payment_method: PaymentMethod
    total_amount_paise: int
    items_count: int
    created_at: str
    shipping_address: AddressSnapshot
    items: List[Dict[str, Any]]
    timeline: List[Dict[str, Any]]
    invoice_url: Optional[str] = None
