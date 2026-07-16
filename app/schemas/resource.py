"""
Resource schemas — CRUD for external tools, templates, links per category.
"""

from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ResourceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    category_id: UUID
    title: str
    description: Optional[str] = None
    url: Optional[str] = None
    resource_type: str
    icon: Optional[str] = None
    is_featured: bool
    sort_order: int
    created_at: datetime
    updated_at: Optional[datetime] = None


class ResourceCreateRequest(BaseModel):
    category_id: UUID
    title: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = None
    url: Optional[str] = Field(None, max_length=1000)
    resource_type: str = Field(default="link", pattern="^(tool|template|guide|video|link|document)$")
    icon: Optional[str] = Field(None, max_length=100)
    is_featured: bool = False
    sort_order: int = 0


class ResourceUpdateRequest(BaseModel):
    category_id: Optional[UUID] = None
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = None
    url: Optional[str] = Field(None, max_length=1000)
    resource_type: Optional[str] = Field(None, pattern="^(tool|template|guide|video|link|document)$")
    icon: Optional[str] = Field(None, max_length=100)
    is_featured: Optional[bool] = None
    sort_order: Optional[int] = None
