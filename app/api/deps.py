"""
Shared FastAPI dependencies — current user extraction, DB sessions.
"""

from __future__ import annotations

from uuid import UUID

from fastapi import Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import verify_access_token
from app.database import get_db
from app.exceptions import ForbiddenException, InactiveUserException, UnauthorizedException
from app.models.user import User, UserRole
from app.services.auth_service import AuthService


async def get_current_user(
    authorization: str = Header(..., description="Bearer <access_token>"),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Extract and validate the current user from the Authorization header.
    Raises 401 if token is missing/invalid, 403 if user is inactive.
    """
    if not authorization.startswith("Bearer "):
        raise UnauthorizedException(message="Authorization header must start with 'Bearer '.")

    token = authorization[7:]
    payload = verify_access_token(token)
    user_id = UUID(payload["sub"])

    auth_service = AuthService(db)
    user = await auth_service.get_user_by_id(user_id)

    if not user.is_active:
        raise InactiveUserException()

    return user


async def get_current_user_optional(
    authorization: str | None = Header(None),
    db: AsyncSession = Depends(get_db),
) -> User | None:
    """
    Like get_current_user but returns None for unauthenticated requests.
    Used for public endpoints that optionally personalize for logged-in users.
    """
    if not authorization or not authorization.startswith("Bearer "):
        return None
    try:
        return await get_current_user(authorization=authorization, db=db)
    except Exception:
        return None


async def get_admin_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Require admin or super_admin role."""
    if current_user.role not in (UserRole.ADMIN, UserRole.SUPER_ADMIN):
        raise ForbiddenException()
    return current_user


async def get_super_admin_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Require super_admin role."""
    if current_user.role != UserRole.SUPER_ADMIN:
        raise ForbiddenException()
    return current_user
