"""
Category schemas — CRUD and listing.
"""

from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class CategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    slug: str
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    color_hex: Optional[str] = None
    sort_order: int
    is_active: bool
    article_count: int = 0
    resource_count: int = 0
    created_at: datetime


class CategoryCreateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    slug: Optional[str] = Field(None, max_length=100, pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$")
    description: Optional[str] = None
    icon: Optional[str] = Field(None, max_length=100)
    color_hex: Optional[str] = Field(None, pattern="^#[0-9A-Fa-f]{6}$")
    sort_order: int = 0
    is_active: bool = True


class CategoryUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    slug: Optional[str] = Field(None, max_length=100, pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$")
    description: Optional[str] = None
    icon: Optional[str] = Field(None, max_length=100)
    color_hex: Optional[str] = Field(None, pattern="^#[0-9A-Fa-f]{6}$")
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None
