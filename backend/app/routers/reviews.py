from typing import List, Optional, Dict
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query, status
from pydantic import BaseModel, Field
from beanie import PydanticObjectId
from app.models.review import Review
from app.models.product import Product
from app.models.order import Order, OrderStatus
from app.models.user import User
from app.schemas.common import APIResponse
from app.middlewares.auth_guard import get_current_user
from app.core.exceptions import NotFoundException, BadRequestException

router = APIRouter(prefix="/reviews", tags=["Reviews & Ratings"])


class CreateReviewRequest(BaseModel):
    rating: int = Field(ge=1, le=5)
    title: str = Field(min_length=2, max_length=150)
    comment: str = Field(min_length=5, max_length=2000)
    photos: List[str] = Field(default_factory=list)


class ReviewResponse(BaseModel):
    id: str
    product_id: str
    user_id: str
    user_name: str
    user_avatar: Optional[str] = None
    rating: int
    title: str
    comment: str
    photos: List[str]
    is_verified_purchase: bool
    helpful_votes: int
    created_at: str


class ProductReviewsOverview(BaseModel):
    avg_rating: float
    review_count: int
    distribution: Dict[int, int]  # {5: 45, 4: 20, 3: 5, 2: 2, 1: 1}
    reviews: List[ReviewResponse]


@router.get("/product/{product_id}", response_model=APIResponse[ProductReviewsOverview])
async def get_product_reviews(product_id: str):
    product = await Product.get(PydanticObjectId(product_id))
    if not product:
        raise NotFoundException("Product")

    all_reviews = await Review.find(
        Review.product_id == product.id,
        Review.is_approved == True
    ).sort(-Review.created_at).to_list()

    distribution = {5: 0, 4: 0, 3: 0, 2: 0, 1: 0}
    for r in all_reviews:
        distribution[r.rating] = distribution.get(r.rating, 0) + 1

    items = [
        ReviewResponse(
            id=str(r.id),
            product_id=str(r.product_id),
            user_id=str(r.user_id),
            user_name=r.user_name,
            user_avatar=r.user_avatar,
            rating=r.rating,
            title=r.title,
            comment=r.comment,
            photos=r.photos,
            is_verified_purchase=r.is_verified_purchase,
            helpful_votes=r.helpful_votes,
            created_at=r.created_at.strftime("%d %b %Y"),
        )
        for r in all_reviews
    ]

    return APIResponse(
        data=ProductReviewsOverview(
            avg_rating=product.avg_rating,
            review_count=product.review_count,
            distribution=distribution,
            reviews=items,
        )
    )


@router.post("/product/{product_id}", response_model=APIResponse[ReviewResponse])
async def submit_review(
    product_id: str,
    data: CreateReviewRequest,
    current_user: User = Depends(get_current_user)
):
    product = await Product.get(PydanticObjectId(product_id))
    if not product:
        raise NotFoundException("Product")

    # Check if user already reviewed
    existing = await Review.find_one(
        Review.product_id == product.id,
        Review.user_id == current_user.id
    )
    if existing:
        raise BadRequestException("You have already reviewed this product")

    # Check verified purchase
    delivered_order = await Order.find_one(
        Order.user_id == current_user.id,
        Order.items.product_id == product.id,
        Order.order_status == OrderStatus.DELIVERED
    )
    is_verified = bool(delivered_order)

    review = Review(
        product_id=product.id,
        user_id=current_user.id,
        user_name=current_user.full_name,
        user_avatar=current_user.avatar_url,
        rating=data.rating,
        title=data.title,
        comment=data.comment,
        photos=data.photos,
        is_verified_purchase=is_verified,
        helpful_votes=0,
        is_approved=True,
    )
    await review.insert()

    # Recalculate product avg_rating and review_count
    all_revs = await Review.find(Review.product_id == product.id, Review.is_approved == True).to_list()
    product.review_count = len(all_revs)
    product.avg_rating = round(sum(r.rating for r in all_revs) / len(all_revs), 1)
    await product.save()

    return APIResponse(
        message="Review submitted successfully!",
        data=ReviewResponse(
            id=str(review.id),
            product_id=str(review.product_id),
            user_id=str(review.user_id),
            user_name=review.user_name,
            user_avatar=review.user_avatar,
            rating=review.rating,
            title=review.title,
            comment=review.comment,
            photos=review.photos,
            is_verified_purchase=review.is_verified_purchase,
            helpful_votes=review.helpful_votes,
            created_at=review.created_at.strftime("%d %b %Y"),
        )
    )


@router.post("/{review_id}/vote", response_model=APIResponse[dict])
async def vote_helpful_review(
    review_id: str,
    current_user: User = Depends(get_current_user)
):
    review = await Review.get(PydanticObjectId(review_id))
    if not review:
        raise NotFoundException("Review")

    if current_user.id in review.voted_user_ids:
        # Unvote
        review.voted_user_ids.remove(current_user.id)
        review.helpful_votes = max(0, review.helpful_votes - 1)
        voted = False
    else:
        # Vote
        review.voted_user_ids.append(current_user.id)
        review.helpful_votes += 1
        voted = True

    await review.save()
    return APIResponse(
        message="Vote updated",
        data={"helpful_votes": review.helpful_votes, "voted": voted}
    )
