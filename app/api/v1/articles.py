"""
Article API endpoints — public listing, detail, featured.
"""

from __future__ import annotations

import math
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user_optional
from app.database import get_db
from app.models.user import User
from app.schemas.article import ArticleDetailResponse, ArticleListItem
from app.schemas.common import ApiResponse, PaginatedResponse, PaginationMeta
from app.services.article_service import ArticleService

router = APIRouter(prefix="/articles", tags=["Articles"])


@router.get("", response_model=PaginatedResponse[ArticleListItem])
async def list_articles(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category_id: UUID | None = None,
    search: str | None = None,
    is_featured: bool | None = None,
    db: AsyncSession = Depends(get_db),
):
    """List published articles with filtering and pagination."""
    service = ArticleService(db)
    articles, total = await service.list_articles(
        page=page,
        page_size=page_size,
        category_id=category_id,
        search=search,
        is_featured=is_featured,
        published_only=True,
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


@router.get("/featured", response_model=ApiResponse)
async def get_featured_articles(
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    """Get featured/trending articles."""
    service = ArticleService(db)
    articles = await service.get_featured_articles(limit)
    return ApiResponse(
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
            ).model_dump()
            for a in articles
        ],
    )


@router.get("/{slug}", response_model=ApiResponse[ArticleDetailResponse])
async def get_article(
    slug: str,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):
    """Get full article by slug. Increments view count."""
    service = ArticleService(db)
    article = await service.get_article_by_slug(slug)
    await service.increment_view_count(article.id)

    return ApiResponse(
        data=ArticleDetailResponse(
            id=article.id,
            slug=article.slug,
            title=article.title,
            excerpt=article.excerpt,
            content_markdown=article.content_markdown,
            content_html=article.content_html,
            status=article.status.value,
            version=article.version,
            category_id=article.category_id,
            category_name=article.category.name if article.category else None,
            author={
                "id": article.author.id,
                "name": article.author.name,
                "avatar_url": article.author.avatar_url,
            } if article.author else None,
            featured_image_url=article.featured_image_url,
            read_time_minutes=article.read_time_minutes,
            view_count=article.view_count + 1,
            seo_metadata=article.seo_metadata or {},
            tags=article.tags or [],
            is_featured=article.is_featured,
            published_at=article.published_at,
            created_at=article.created_at,
            updated_at=article.updated_at,
        ),
    )
