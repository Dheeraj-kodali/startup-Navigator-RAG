"""
Search API endpoints — full-text search and search history.
"""

from __future__ import annotations

import math
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_current_user_optional
from app.database import get_db
from app.models.user import User
from app.schemas.article import ArticleListItem
from app.schemas.common import ApiResponse, PaginatedResponse, PaginationMeta
from app.schemas.search_history import SearchHistoryResponse, SearchRequest
from app.services.search_service import SearchService

router = APIRouter(prefix="/search", tags=["Search"])


@router.get("", response_model=PaginatedResponse[ArticleListItem])
async def search_articles(
    q: str = Query(..., min_length=1, max_length=500, description="Search query"),
    category_slug: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):
    """Search published articles by title, excerpt, and content."""
    service = SearchService(db)
    articles, total = await service.search_articles(
        query=q,
        category_slug=category_slug,
        page=page,
        page_size=page_size,
        user_id=current_user.id if current_user else None,
    )
    return PaginatedResponse(
        data=[
            ArticleListItem(
                id=a.id,
                slug=a.slug,
                title=a.title,
                excerpt=a.excerpt,
                status=a.status.value,
                category_id=a.category_id,
                category_name=a.category.name if a.category else None,
                author_name=a.author.name if a.author else None,
                featured_image_url=a.featured_image_url,
                read_time_minutes=a.read_time_minutes,
                view_count=a.view_count,
                tags=a.tags or [],
                is_featured=a.is_featured,
                published_at=a.published_at,
                created_at=a.created_at,
            )
            for a in articles
        ],
        pagination=PaginationMeta(
            page=page,
            page_size=page_size,
            total_items=total,
            total_pages=math.ceil(total / page_size) if total > 0 else 0,
            has_next=page * page_size < total,
            has_previous=page > 1,
        ),
    )


@router.get("/history", response_model=PaginatedResponse[SearchHistoryResponse])
async def get_search_history(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the authenticated user's search history."""
    service = SearchService(db)
    history, total = await service.get_user_search_history(
        current_user.id, page, page_size
    )
    return PaginatedResponse(
        data=[SearchHistoryResponse.model_validate(h) for h in history],
        pagination=PaginationMeta(
            page=page,
            page_size=page_size,
            total_items=total,
            total_pages=math.ceil(total / page_size) if total > 0 else 0,
            has_next=page * page_size < total,
            has_previous=page > 1,
        ),
    )


@router.delete("/history/{history_id}", response_model=ApiResponse)
async def delete_search_history_item(
    history_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a single search history entry."""
    service = SearchService(db)
    await service.delete_search_history(current_user.id, history_id)
    return ApiResponse(message="Search history entry deleted.")


@router.delete("/history", response_model=ApiResponse)
async def clear_search_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Clear all search history for the authenticated user."""
    service = SearchService(db)
    await service.clear_search_history(current_user.id)
    return ApiResponse(message="Search history cleared.")
