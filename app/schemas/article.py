"""
Article schemas — create, update, list, detail, version history.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.user import UserPublicResponse


# ── Article Responses ────────────────────────────────────────
class ArticleListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    slug: str
    title: str
    excerpt: Optional[str] = None
    status: str
    category_id: Optional[UUID] = None
    category_name: Optional[str] = None
    author_name: Optional[str] = None
    featured_image_url: Optional[str] = None
    read_time_minutes: int
    view_count: int
    tags: List[str] = []
    is_featured: bool
    published_at: Optional[datetime] = None
    created_at: datetime


class ArticleDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    slug: str
    title: str
    excerpt: Optional[str] = None
    content_markdown: str
    content_html: Optional[str] = None
    status: str
    version: int
    category_id: Optional[UUID] = None
    category_name: Optional[str] = None
    author: Optional[UserPublicResponse] = None
    featured_image_url: Optional[str] = None
    read_time_minutes: int
    view_count: int
    seo_metadata: Dict[str, Any] = {}
    tags: List[str] = []
    is_featured: bool
    published_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None


# ── Article Create / Update ──────────────────────────────────
class ArticleCreateRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    category_id: UUID
    excerpt: Optional[str] = Field(None, max_length=1000)
    content_markdown: str = Field(..., min_length=1)
    featured_image_url: Optional[str] = Field(None, max_length=500)
    tags: List[str] = []
    seo_metadata: Dict[str, Any] = {}
    is_featured: bool = False
    status: str = Field(default="draft", pattern="^(draft|review|published)$")


class ArticleUpdateRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    category_id: Optional[UUID] = None
    excerpt: Optional[str] = Field(None, max_length=1000)
    content_markdown: Optional[str] = None
    featured_image_url: Optional[str] = Field(None, max_length=500)
    tags: Optional[List[str]] = None
    seo_metadata: Optional[Dict[str, Any]] = None
    is_featured: Optional[bool] = None
    change_summary: Optional[str] = Field(None, max_length=500, description="Describes what changed in this edit")


class ArticleStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(draft|review|published|archived)$")


# ── Article Versions ─────────────────────────────────────────
class ArticleVersionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    version_number: int
    change_summary: Optional[str] = None
    edited_by: Optional[UUID] = None
    created_at: datetime
