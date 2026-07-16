"""
User API endpoints — profile, preferences, bookmarks, reading progress.
"""

from __future__ import annotations

import math
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.common import ApiResponse, PaginatedResponse, PaginationMeta
from app.schemas.user import UserPreferencesUpdate, UserResponse, UserUpdateRequest
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/profile", response_model=ApiResponse[UserResponse])
async def get_profile(current_user: User = Depends(get_current_user)):
    """Get the authenticated user's full profile."""
    return ApiResponse(data=UserResponse.model_validate(current_user))


@router.patch("/profile", response_model=ApiResponse[UserResponse])
async def update_profile(
    body: UserUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update user profile fields."""
    service = UserService(db)
    user = await service.update_profile(
        user_id=current_user.id,
        **body.model_dump(exclude_unset=True),
    )
    return ApiResponse(data=UserResponse.model_validate(user))


@router.patch("/preferences", response_model=ApiResponse[UserResponse])
async def update_preferences(
    body: UserPreferencesUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update user preferences (topics, theme, notifications)."""
    service = UserService(db)
    user = await service.update_preferences(
        user_id=current_user.id,
        preferences=body.model_dump(exclude_unset=True),
    )
    return ApiResponse(data=UserResponse.model_validate(user))


@router.delete("/account", response_model=ApiResponse)
async def deactivate_account(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Soft-delete the user's account."""
    service = UserService(db)
    await service.deactivate_account(current_user.id)
    return ApiResponse(message="Account deactivated successfully.")


# ── Bookmarks ────────────────────────────────────────────────
@router.get("/bookmarks")
async def get_bookmarks(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = UserService(db)
    bookmarks, total = await service.get_bookmarks(current_user.id, page, page_size)
    return PaginatedResponse(
        data=[
            {
                "id": str(b.id),
                "article_id": str(b.article_id),
                "article_title": b.article.title if b.article else None,
                "article_slug": b.article.slug if b.article else None,
                "note": b.note,
                "created_at": b.created_at,
            }
            for b in bookmarks
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


@router.post("/bookmarks", status_code=201)
async def add_bookmark(
    article_id: UUID,
    note: str | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = UserService(db)
    bookmark = await service.add_bookmark(current_user.id, article_id, note)
    return ApiResponse(message="Article bookmarked.", data={"id": str(bookmark.id)})


@router.delete("/bookmarks/{bookmark_id}")
async def remove_bookmark(
    bookmark_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = UserService(db)
    await service.remove_bookmark(current_user.id, bookmark_id)
    return ApiResponse(message="Bookmark removed.")


# ── Reading Progress ─────────────────────────────────────────
@router.get("/reading-progress")
async def get_reading_progress(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = UserService(db)
    progress = await service.get_reading_progress(current_user.id)
    return ApiResponse(
        data=[
            {
                "article_id": str(p.article_id),
                "article_title": p.article.title if p.article else None,
                "progress_percent": p.progress_percent,
                "is_completed": p.is_completed,
                "last_read_at": p.last_read_at,
            }
            for p in progress
        ]
    )


@router.patch("/reading-progress/{article_id}")
async def update_reading_progress(
    article_id: UUID,
    progress_percent: int = Query(..., ge=0, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = UserService(db)
    progress = await service.update_reading_progress(
        current_user.id, article_id, progress_percent
    )
    return ApiResponse(
        message="Progress updated.",
        data={
            "progress_percent": progress.progress_percent,
            "is_completed": progress.is_completed,
        },
    )
