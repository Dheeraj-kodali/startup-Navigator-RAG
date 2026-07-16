"""
User schemas — profile, preferences, public representation.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ── User Responses ───────────────────────────────────────────
class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: EmailStr
    name: str
    avatar_url: Optional[str] = None
    role: str
    email_verified: bool
    preferences: Dict[str, Any] = {}
    created_at: datetime
    last_login_at: Optional[datetime] = None


class UserPublicResponse(BaseModel):
    """Minimal user info exposed in article author fields, etc."""
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    avatar_url: Optional[str] = None


# ── Profile Updates ──────────────────────────────────────────
class UserUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    avatar_url: Optional[str] = Field(None, max_length=500)


class UserPreferencesUpdate(BaseModel):
    interested_topics: Optional[List[str]] = None
    theme: Optional[str] = Field(None, pattern="^(light|dark|system)$")
    email_notifications: Optional[bool] = None


# ── Admin: User Management ───────────────────────────────────
class AdminUserUpdate(BaseModel):
    role: Optional[str] = Field(None, pattern="^(user|admin|super_admin)$")
    is_active: Optional[bool] = None
    email_verified: Optional[bool] = None
