from typing import List
from fastapi import APIRouter, Depends
from beanie import PydanticObjectId
from app.models.user import User
from app.models.address import Address
from app.schemas.user import (
    UserProfileResponse,
    UserProfileUpdate,
    AddressCreate,
    AddressUpdate,
    AddressResponse,
)
from app.schemas.common import APIResponse
from app.middlewares.auth_guard import get_current_user
from app.core.exceptions import NotFoundException, ForbiddenException

router = APIRouter(prefix="/users", tags=["Users & Addresses"])


@router.get("/profile", response_model=APIResponse[UserProfileResponse])
async def get_profile(current_user: User = Depends(get_current_user)):
    return APIResponse(
        data=UserProfileResponse(
            id=str(current_user.id),
            email=current_user.email,
            phone=current_user.phone,
            full_name=current_user.full_name,
            avatar_url=current_user.avatar_url,
            role=current_user.role,
            wallet_balance_paise=current_user.wallet_balance_paise,
            loyalty_points=current_user.loyalty_points,
            referral_code=current_user.referral_code,
            is_active=current_user.is_active,
            is_verified=current_user.is_verified,
        )
    )


@router.put("/profile", response_model=APIResponse[UserProfileResponse])
async def update_profile(
    data: UserProfileUpdate,
    current_user: User = Depends(get_current_user)
):
    if data.full_name is not None:
        current_user.full_name = data.full_name
    if data.avatar_url is not None:
        current_user.avatar_url = data.avatar_url
    if data.phone is not None:
        current_user.phone = data.phone

    await current_user.save()
    return APIResponse(
        message="Profile updated successfully",
        data=UserProfileResponse(
            id=str(current_user.id),
            email=current_user.email,
            phone=current_user.phone,
            full_name=current_user.full_name,
            avatar_url=current_user.avatar_url,
            role=current_user.role,
            wallet_balance_paise=current_user.wallet_balance_paise,
            loyalty_points=current_user.loyalty_points,
            referral_code=current_user.referral_code,
            is_active=current_user.is_active,
            is_verified=current_user.is_verified,
        )
    )


@router.get("/addresses", response_model=APIResponse[List[AddressResponse]])
async def list_addresses(current_user: User = Depends(get_current_user)):
    addresses = await Address.find(
        Address.user_id == current_user.id,
        Address.is_deleted == False
    ).sort(-Address.is_default, -Address.created_at).to_list()

    items = [
        AddressResponse(
            id=str(addr.id),
            user_id=str(addr.user_id),
            full_name=addr.full_name,
            phone=addr.phone,
            alternate_phone=addr.alternate_phone,
            address_line1=addr.address_line1,
            address_line2=addr.address_line2,
            landmark=addr.landmark,
            city=addr.city,
            state=addr.state,
            pincode=addr.pincode,
            country=addr.country,
            address_type=addr.address_type,
            is_default=addr.is_default,
        )
        for addr in addresses
    ]
    return APIResponse(data=items)


@router.post("/addresses", response_model=APIResponse[AddressResponse])
async def create_address(
    data: AddressCreate,
    current_user: User = Depends(get_current_user)
):
    if data.is_default:
        await Address.find(Address.user_id == current_user.id).update(
            {"$set": {"is_default": False}}
        )

    # If first address, make default automatically
    existing_count = await Address.find(
        Address.user_id == current_user.id,
        Address.is_deleted == False
    ).count()
    is_default = data.is_default or (existing_count == 0)

    address = Address(
        user_id=current_user.id,
        full_name=data.full_name,
        phone=data.phone,
        alternate_phone=data.alternate_phone,
        address_line1=data.address_line1,
        address_line2=data.address_line2,
        landmark=data.landmark,
        city=data.city,
        state=data.state,
        pincode=data.pincode,
        country=data.country,
        address_type=data.address_type,
        is_default=is_default,
    )
    await address.insert()

    return APIResponse(
        message="Address added successfully",
        data=AddressResponse(
            id=str(address.id),
            user_id=str(address.user_id),
            full_name=address.full_name,
            phone=address.phone,
            alternate_phone=address.alternate_phone,
            address_line1=address.address_line1,
            address_line2=address.address_line2,
            landmark=address.landmark,
            city=address.city,
            state=address.state,
            pincode=address.pincode,
            country=address.country,
            address_type=address.address_type,
            is_default=address.is_default,
        )
    )


@router.delete("/addresses/{address_id}", response_model=APIResponse[dict])
async def delete_address(
    address_id: str,
    current_user: User = Depends(get_current_user)
):
    addr = await Address.get(PydanticObjectId(address_id))
    if not addr or addr.is_deleted:
        raise NotFoundException("Address")
    if addr.user_id != current_user.id:
        raise ForbiddenException("Cannot delete this address")

    addr.is_deleted = True
    await addr.save()
    return APIResponse(message="Address deleted successfully", data={"deleted": True})
