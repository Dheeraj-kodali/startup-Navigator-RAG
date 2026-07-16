"""
Security utilities — JWT token creation/verification and password hashing.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional
from uuid import UUID

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import get_settings
from app.exceptions import InvalidTokenException, TokenExpiredException

settings = get_settings()

# ── Password Hashing ─────────────────────────────────────────
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a plain-text password with bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain-text password against a bcrypt hash."""
    return pwd_context.verify(plain_password, hashed_password)


# ── JWT Tokens ────────────────────────────────────────────────
def create_access_token(
    user_id: UUID,
    role: str,
    extra_claims: Optional[Dict[str, Any]] = None,
) -> str:
    """Create a short-lived access token (default 30 min)."""
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "role": role,
        "type": "access",
        "iat": now,
        "exp": now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    }
    if extra_claims:
        payload.update(extra_claims)
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(user_id: UUID) -> str:
    """Create a long-lived refresh token (default 7 days)."""
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "type": "refresh",
        "iat": now,
        "exp": now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> Dict[str, Any]:
    """
    Decode and validate a JWT token.

    Raises:
        TokenExpiredException: If the token has expired.
        InvalidTokenException: If the token is malformed or tampered with.
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        return payload
    except JWTError as exc:
        error_msg = str(exc).lower()
        if "expired" in error_msg:
            raise TokenExpiredException()
        raise InvalidTokenException()


def verify_access_token(token: str) -> Dict[str, Any]:
    """Decode an access token and verify its type claim."""
    payload = decode_token(token)
    if payload.get("type") != "access":
        raise InvalidTokenException(message="Expected an access token.")
    return payload


def verify_refresh_token(token: str) -> Dict[str, Any]:
    """Decode a refresh token and verify its type claim."""
    payload = decode_token(token)
    if payload.get("type") != "refresh":
        raise InvalidTokenException(message="Expected a refresh token.")
    return payload


def create_reset_token(email: str) -> str:
    """Create a short-lived password reset token (15 mins)."""
    now = datetime.now(timezone.utc)
    payload = {
        "sub": email,
        "type": "reset",
        "iat": now,
        "exp": now + timedelta(minutes=15),
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def verify_reset_token(token: str) -> str:
    """Verify reset token and return the associated email."""
    payload = decode_token(token)
    if payload.get("type") != "reset":
        raise InvalidTokenException(message="Expected a reset token.")
    return payload["sub"]

