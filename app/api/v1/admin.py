"""
Admin API endpoints — content management, user management, system operations.
All endpoints require admin or super_admin role.
"""

from __future__ import annotations

import math
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_admin_user, get_super_admin_user
from app.database import get_db
from app.models.user import User
from app.schemas.article import (
    ArticleCreateRequest,
    ArticleDetailResponse,
    ArticleListItem,
    ArticleStatusUpdate,
    ArticleUpdateRequest,
    ArticleVersionResponse,
)
from app.schemas.category import CategoryCreateRequest, CategoryUpdateRequest
from app.schemas.common import ApiResponse, PaginatedResponse, PaginationMeta
from app.schemas.resource import ResourceCreateRequest, ResourceResponse, ResourceUpdateRequest
from app.schemas.user import AdminUserUpdate, UserResponse
from app.services.article_service import ArticleService
from app.services.category_service import CategoryService
from app.services.resource_service import ResourceService
from app.services.user_service import UserService

router = APIRouter(prefix="/admin", tags=["Admin"])


# ═══════════════════════════════════════════════════════════════
# ARTICLES (Admin CRUD)
# ═══════════════════════════════════════════════════════════════

@router.get("/articles", response_model=PaginatedResponse[ArticleListItem])
async def admin_list_articles(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category_id: UUID | None = None,
    status: str | None = None,
    search: str | None = None,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """List all articles (including drafts, archived) for admin management."""
    service = ArticleService(db)
    articles, total = await service.list_articles(
        page=page,
        page_size=page_size,
        category_id=category_id,
        status=status,
        search=search,
        published_only=False,
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


@router.post("/articles", status_code=201, response_model=ApiResponse)
async def admin_create_article(
    body: ArticleCreateRequest,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new article."""
    service = ArticleService(db)
    article = await service.create_article(
        author_id=admin.id,
        **body.model_dump(),
    )
    return ApiResponse(
        message="Article created.",
        data={"id": str(article.id), "slug": article.slug},
    )


@router.patch("/articles/{article_id}", response_model=ApiResponse)
async def admin_update_article(
    article_id: UUID,
    body: ArticleUpdateRequest,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an existing article. Creates a version if content changes."""
    service = ArticleService(db)
    data = body.model_dump(exclude_unset=True)
    change_summary = data.pop("change_summary", None)

    article = await service.update_article(
        article_id=article_id,
        editor_id=admin.id,
        change_summary=change_summary,
        **data,
    )
    return ApiResponse(
        message="Article updated.",
        data={"id": str(article.id), "version": article.version},
    )


@router.patch("/articles/{article_id}/status", response_model=ApiResponse)
async def admin_update_article_status(
    article_id: UUID,
    body: ArticleStatusUpdate,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Change article status (draft / review / published / archived)."""
    service = ArticleService(db)
    article = await service.update_article_status(article_id, body.status)
    return ApiResponse(
        message=f"Article status changed to '{body.status}'.",
        data={"id": str(article.id), "status": article.status.value},
    )


@router.delete("/articles/{article_id}", response_model=ApiResponse)
async def admin_delete_article(
    article_id: UUID,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Soft-delete (archive) an article."""
    service = ArticleService(db)
    await service.delete_article(article_id)
    return ApiResponse(message="Article archived.")


@router.get("/articles/{article_id}/versions")
async def admin_get_article_versions(
    article_id: UUID,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the version history for an article."""
    service = ArticleService(db)
    versions = await service.get_article_versions(article_id)
    return ApiResponse(
        data=[
            ArticleVersionResponse.model_validate(v).model_dump()
            for v in versions
        ],
    )


@router.post("/articles/{article_id}/revert/{version_id}", response_model=ApiResponse)
async def admin_revert_article(
    article_id: UUID,
    version_id: UUID,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Revert an article to a previous version."""
    service = ArticleService(db)
    article = await service.revert_to_version(article_id, version_id, admin.id)
    return ApiResponse(
        message=f"Article reverted to version {article.version}.",
        data={"id": str(article.id), "version": article.version},
    )


# ═══════════════════════════════════════════════════════════════
# CATEGORIES (Admin CRUD)
# ═══════════════════════════════════════════════════════════════

@router.post("/categories", status_code=201, response_model=ApiResponse)
async def admin_create_category(
    body: CategoryCreateRequest,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new category."""
    service = CategoryService(db)
    category = await service.create_category(**body.model_dump())
    return ApiResponse(
        message="Category created.",
        data={"id": str(category.id), "slug": category.slug},
    )


@router.patch("/categories/{category_id}", response_model=ApiResponse)
async def admin_update_category(
    category_id: UUID,
    body: CategoryUpdateRequest,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a category."""
    service = CategoryService(db)
    category = await service.update_category(
        category_id, **body.model_dump(exclude_unset=True)
    )
    return ApiResponse(
        message="Category updated.",
        data={"id": str(category.id), "slug": category.slug},
    )


@router.delete("/categories/{category_id}", response_model=ApiResponse)
async def admin_delete_category(
    category_id: UUID,
    admin: User = Depends(get_super_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Soft-delete a category (super_admin only)."""
    service = CategoryService(db)
    await service.delete_category(category_id)
    return ApiResponse(message="Category deactivated.")


# ═══════════════════════════════════════════════════════════════
# RESOURCES (Admin CRUD)
# ═══════════════════════════════════════════════════════════════

@router.post("/resources", status_code=201, response_model=ApiResponse)
async def admin_create_resource(
    body: ResourceCreateRequest,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new resource."""
    service = ResourceService(db)
    resource = await service.create_resource(**body.model_dump())
    return ApiResponse(
        message="Resource created.",
        data={"id": str(resource.id)},
    )


@router.patch("/resources/{resource_id}", response_model=ApiResponse[ResourceResponse])
async def admin_update_resource(
    resource_id: UUID,
    body: ResourceUpdateRequest,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a resource."""
    service = ResourceService(db)
    resource = await service.update_resource(
        resource_id, **body.model_dump(exclude_unset=True)
    )
    return ApiResponse(
        message="Resource updated.",
        data=ResourceResponse.model_validate(resource),
    )


@router.delete("/resources/{resource_id}", response_model=ApiResponse)
async def admin_delete_resource(
    resource_id: UUID,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a resource permanently."""
    service = ResourceService(db)
    await service.delete_resource(resource_id)
    return ApiResponse(message="Resource deleted.")


# ═══════════════════════════════════════════════════════════════
# USERS (Admin Management)
# ═══════════════════════════════════════════════════════════════

@router.get("/users", response_model=PaginatedResponse[UserResponse])
async def admin_list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    role: str | None = None,
    is_active: bool | None = None,
    search: str | None = None,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """List all users with filters."""
    service = UserService(db)
    users, total = await service.list_users(
        page=page, page_size=page_size, role=role, is_active=is_active, search=search
    )
    return PaginatedResponse(
        data=[UserResponse.model_validate(u) for u in users],
        pagination=PaginationMeta(
            page=page,
            page_size=page_size,
            total_items=total,
            total_pages=math.ceil(total / page_size) if total > 0 else 0,
            has_next=page * page_size < total,
            has_previous=page > 1,
        ),
    )


@router.patch("/users/{user_id}", response_model=ApiResponse[UserResponse])
async def admin_update_user(
    user_id: UUID,
    body: AdminUserUpdate,
    admin: User = Depends(get_super_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Update user role or active status (super_admin only)."""
    service = UserService(db)
    user = await service.admin_update_user(
        user_id, **body.model_dump(exclude_unset=True)
    )
    return ApiResponse(
        message="User updated.",
        data=UserResponse.model_validate(user),
    )
