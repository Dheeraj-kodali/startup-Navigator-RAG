"""
Category API endpoints — public listing and detail.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.common import ApiResponse
from app.services.category_service import CategoryService

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("", response_model=ApiResponse)
async def list_categories(db: AsyncSession = Depends(get_db)):
    """List all active categories with article/resource counts."""
    service = CategoryService(db)
    categories = await service.list_categories(active_only=True)
    return ApiResponse(data=categories)


@router.get("/{slug}", response_model=ApiResponse)
async def get_category(slug: str, db: AsyncSession = Depends(get_db)):
    """Get a single category by slug."""
    service = CategoryService(db)
    category = await service.get_category_by_slug(slug)
    return ApiResponse(
        data={
            "id": str(category.id),
            "slug": category.slug,
            "name": category.name,
            "description": category.description,
            "icon": category.icon,
            "color_hex": category.color_hex,
            "sort_order": category.sort_order,
            "is_active": category.is_active,
            "created_at": category.created_at,
        }
    )
