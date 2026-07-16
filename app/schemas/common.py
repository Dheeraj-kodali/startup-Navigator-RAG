"""
Shared schema primitives — pagination, standard API responses, health check.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Generic, List, Optional, TypeVar
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

T = TypeVar("T")


# ── Standard API Response ────────────────────────────────────
class ApiResponse(BaseModel, Generic[T]):
    """Wraps every successful API response for consistency."""
    success: bool = True
    message: str = "OK"
    data: Optional[T] = None


class ApiErrorResponse(BaseModel):
    """Returned for all error responses (mapped from AppException)."""
    error: bool = True
    error_code: str
    message: str
    details: Optional[dict] = None


# ── Pagination ───────────────────────────────────────────────
class PaginationParams(BaseModel):
    page: int = Field(default=1, ge=1, description="Page number (1-indexed)")
    page_size: int = Field(default=20, ge=1, le=100, description="Items per page")

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size


class PaginationMeta(BaseModel):
    page: int
    page_size: int
    total_items: int
    total_pages: int
    has_next: bool
    has_previous: bool


class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated list response with metadata."""
    success: bool = True
    data: List[T]
    pagination: PaginationMeta


# ── Health Check ─────────────────────────────────────────────
class HealthResponse(BaseModel):
    status: str = "healthy"
    version: str
    environment: str
    timestamp: datetime


# ── Base ORM Model ───────────────────────────────────────────
class BaseSchema(BaseModel):
    """Base schema with ORM mode enabled."""
    model_config = ConfigDict(from_attributes=True)


class TimestampMixin(BaseModel):
    """Mixin for models with created_at / updated_at."""
    created_at: datetime
    updated_at: Optional[datetime] = None
