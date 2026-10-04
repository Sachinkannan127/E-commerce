from typing import Optional, List
from fastapi import Depends, Request, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.core.security import decode_token
from app.models.user import User, UserRole
from app.core.exceptions import UnauthorizedException, ForbiddenException
from app.core.logging import logger

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


async def get_current_user_optional(
    request: Request,
    bearer_token: Optional[str] = Depends(oauth2_scheme)
) -> Optional[User]:
    token = bearer_token
    # If no Authorization header, check httpOnly access_token cookie
    if not token and "access_token" in request.cookies:
        token = request.cookies.get("access_token")
    
    if not token:
        return None
    
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        return None
    
    user_id = payload.get("sub")
    if not user_id:
        return None
    
    user = await User.get(user_id)
    if not user or not user.is_active or user.is_deleted:
        return None
    
    return user


async def get_current_user(
    user: Optional[User] = Depends(get_current_user_optional)
) -> User:
    if not user:
        raise UnauthorizedException("Authentication required to access this resource")
    return user


class RoleChecker:
    def __init__(self, allowed_roles: List[UserRole]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: User = Depends(get_current_user)) -> User:
        if user.role not in self.allowed_roles:
            raise ForbiddenException(
                f"Access forbidden: User role '{user.role}' lacks necessary permissions"
            )
        return user


# Role-based dependency shortcuts
require_customer = RoleChecker([UserRole.CUSTOMER, UserRole.SELLER, UserRole.ADMIN])
require_seller = RoleChecker([UserRole.SELLER, UserRole.ADMIN])
require_admin = RoleChecker([UserRole.ADMIN])
