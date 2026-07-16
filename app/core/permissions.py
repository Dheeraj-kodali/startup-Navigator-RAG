"""
Role-based permission checks used as FastAPI dependencies.
"""

from __future__ import annotations

from functools import wraps
from typing import List

from app.exceptions import ForbiddenException
from app.models.user import UserRole


def require_roles(allowed_roles: List[UserRole]):
    """
    Dependency factory — returns a checker that raises ForbiddenException
    if the current user's role is not in ``allowed_roles``.

    Usage in a route::

        @router.get("/admin/users", dependencies=[Depends(require_roles([UserRole.ADMIN, UserRole.SUPER_ADMIN]))])
        async def list_users(...): ...
    """

    def _checker(current_user=None):
        if current_user is None:
            raise ForbiddenException()
        if current_user.role not in allowed_roles:
            raise ForbiddenException(
                message=f"Role '{current_user.role.value}' is not permitted for this action."
            )
        return current_user

    return _checker


def is_admin(user) -> bool:
    """Check if a user has admin-level privileges."""
    return user.role in (UserRole.ADMIN, UserRole.SUPER_ADMIN)


def is_super_admin(user) -> bool:
    """Check if a user is a super admin."""
    return user.role == UserRole.SUPER_ADMIN


def is_owner_or_admin(user, resource_owner_id) -> bool:
    """Check if the user owns the resource or is an admin."""
    return str(user.id) == str(resource_owner_id) or is_admin(user)
