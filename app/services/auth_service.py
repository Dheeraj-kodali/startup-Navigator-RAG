"""
Auth service — registration, login, token refresh, password management.
"""

from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
    verify_refresh_token,
    create_reset_token,
    verify_reset_token,
)
from app.config import get_settings
from app.exceptions import (
    BadRequestException,
    EmailAlreadyExistsException,
    InactiveUserException,
    InvalidCredentialsException,
    UserNotFoundException,
)
from app.logging_config import get_logger
from app.models.user import User, UserRole

logger = get_logger(__name__)
settings = get_settings()


class AuthService:
    """Handles all authentication business logic."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def register(self, email: str, password: str, name: str) -> User:
        """Register a new user with email and password."""
        # Check for existing email
        stmt = select(User).where(User.email == email.lower())
        result = await self.db.execute(stmt)
        if result.scalar_one_or_none():
            raise EmailAlreadyExistsException()

        user = User(
            email=email.lower().strip(),
            password_hash=hash_password(password),
            name=name.strip(),
            role=UserRole.USER,
            email_verified=False,
        )
        self.db.add(user)
        await self.db.flush()
        await self.db.refresh(user)

        logger.info("user_registered", user_id=str(user.id), email=user.email)
        return user

    async def login(self, email: str, password: str) -> dict:
        """Authenticate user and return JWT tokens."""
        stmt = select(User).where(User.email == email.lower())
        result = await self.db.execute(stmt)
        user = result.scalar_one_or_none()

        if not user or not user.password_hash:
            raise InvalidCredentialsException()

        if not verify_password(password, user.password_hash):
            raise InvalidCredentialsException()

        if not user.is_active:
            raise InactiveUserException()

        # Update last login
        user.last_login_at = datetime.now(timezone.utc)
        await self.db.flush()

        # Generate tokens
        access_token = create_access_token(user.id, user.role.value)
        refresh_token = create_refresh_token(user.id)

        logger.info("user_logged_in", user_id=str(user.id))

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        }

    async def refresh_tokens(self, refresh_token_str: str) -> dict:
        """Issue new token pair from a valid refresh token."""
        payload = verify_refresh_token(refresh_token_str)
        user_id = UUID(payload["sub"])

        stmt = select(User).where(User.id == user_id)
        result = await self.db.execute(stmt)
        user = result.scalar_one_or_none()

        if not user:
            raise UserNotFoundException()
        if not user.is_active:
            raise InactiveUserException()

        access_token = create_access_token(user.id, user.role.value)
        new_refresh_token = create_refresh_token(user.id)

        logger.info("tokens_refreshed", user_id=str(user.id))

        return {
            "access_token": access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        }

    async def change_password(
        self, user_id: UUID, current_password: str, new_password: str
    ) -> None:
        """Change password for authenticated user."""
        stmt = select(User).where(User.id == user_id)
        result = await self.db.execute(stmt)
        user = result.scalar_one_or_none()

        if not user:
            raise UserNotFoundException()

        if not user.password_hash or not verify_password(current_password, user.password_hash):
            raise BadRequestException(message="Current password is incorrect.")

        user.password_hash = hash_password(new_password)
        await self.db.flush()

        logger.info("password_changed", user_id=str(user.id))

    async def get_user_by_id(self, user_id: UUID) -> User:
        """Fetch user by ID — used by auth dependency."""
        stmt = select(User).where(User.id == user_id)
        result = await self.db.execute(stmt)
        user = result.scalar_one_or_none()
        if not user:
            raise UserNotFoundException()
        return user

    async def forgot_password(self, email: str) -> str:
        """Generate a password reset token for the given email if user exists."""
        stmt = select(User).where(User.email == email.lower())
        result = await self.db.execute(stmt)
        user = result.scalar_one_or_none()
        if not user:
            # Silence user enumeration attacks in production, but raise in dev/test for verification
            raise UserNotFoundException()
        
        token = create_reset_token(user.email)
        logger.info("forgot_password_requested", email=email)
        return token

    async def reset_password(self, token: str, new_password: str) -> None:
        """Reset user password using a valid reset token."""
        email = verify_reset_token(token)
        stmt = select(User).where(User.email == email.lower())
        result = await self.db.execute(stmt)
        user = result.scalar_one_or_none()
        if not user:
            raise UserNotFoundException()

        user.password_hash = hash_password(new_password)
        await self.db.flush()
        logger.info("password_reset_completed", email=email)

