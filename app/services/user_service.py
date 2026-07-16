"""
User service — profile management, preferences, bookmarks, reading progress.
"""

from __future__ import annotations

from typing import List, Optional
from uuid import UUID

from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.exceptions import ConflictException, NotFoundException, UserNotFoundException
from app.logging_config import get_logger
from app.models.bookmark import Bookmark, ReadingProgress
from app.models.user import User, UserRole

logger = get_logger(__name__)


class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db

    # ── Profile ──────────────────────────────────────────────
    async def get_profile(self, user_id: UUID) -> User:
        stmt = select(User).where(User.id == user_id)
        result = await self.db.execute(stmt)
        user = result.scalar_one_or_none()
        if not user:
            raise UserNotFoundException()
        return user

    async def update_profile(self, user_id: UUID, **kwargs) -> User:
        user = await self.get_profile(user_id)
        for key, value in kwargs.items():
            if value is not None and hasattr(user, key):
                setattr(user, key, value)
        await self.db.flush()
        await self.db.refresh(user)
        logger.info("profile_updated", user_id=str(user_id), fields=list(kwargs.keys()))
        return user

    async def update_preferences(self, user_id: UUID, preferences: dict) -> User:
        user = await self.get_profile(user_id)
        current = user.preferences or {}
        current.update({k: v for k, v in preferences.items() if v is not None})
        user.preferences = current
        await self.db.flush()
        await self.db.refresh(user)
        return user

    async def deactivate_account(self, user_id: UUID) -> None:
        user = await self.get_profile(user_id)
        user.is_active = False
        await self.db.flush()
        logger.info("account_deactivated", user_id=str(user_id))

    # ── Bookmarks ────────────────────────────────────────────
    async def get_bookmarks(self, user_id: UUID, page: int = 1, page_size: int = 20):
        offset = (page - 1) * page_size
        count_stmt = select(func.count()).where(Bookmark.user_id == user_id)
        total = (await self.db.execute(count_stmt)).scalar() or 0

        stmt = (
            select(Bookmark)
            .where(Bookmark.user_id == user_id)
            .order_by(Bookmark.created_at.desc())
            .offset(offset)
            .limit(page_size)
        )
        result = await self.db.execute(stmt)
        bookmarks = result.scalars().all()
        return bookmarks, total

    async def add_bookmark(self, user_id: UUID, article_id: UUID, note: str | None = None) -> Bookmark:
        # Check for duplicate
        stmt = select(Bookmark).where(
            Bookmark.user_id == user_id, Bookmark.article_id == article_id
        )
        result = await self.db.execute(stmt)
        if result.scalar_one_or_none():
            raise ConflictException(message="Article already bookmarked.")

        bookmark = Bookmark(user_id=user_id, article_id=article_id, note=note)
        self.db.add(bookmark)
        await self.db.flush()
        await self.db.refresh(bookmark)
        return bookmark

    async def remove_bookmark(self, user_id: UUID, bookmark_id: UUID) -> None:
        stmt = delete(Bookmark).where(Bookmark.id == bookmark_id, Bookmark.user_id == user_id)
        result = await self.db.execute(stmt)
        if result.rowcount == 0:
            raise NotFoundException(message="Bookmark not found.")

    # ── Reading Progress ─────────────────────────────────────
    async def get_reading_progress(self, user_id: UUID):
        stmt = (
            select(ReadingProgress)
            .where(ReadingProgress.user_id == user_id)
            .order_by(ReadingProgress.last_read_at.desc())
        )
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def update_reading_progress(
        self, user_id: UUID, article_id: UUID, progress_percent: int
    ) -> ReadingProgress:
        stmt = select(ReadingProgress).where(
            ReadingProgress.user_id == user_id,
            ReadingProgress.article_id == article_id,
        )
        result = await self.db.execute(stmt)
        progress = result.scalar_one_or_none()

        if progress:
            progress.progress_percent = min(progress_percent, 100)
            progress.is_completed = progress_percent >= 100
        else:
            progress = ReadingProgress(
                user_id=user_id,
                article_id=article_id,
                progress_percent=min(progress_percent, 100),
                is_completed=progress_percent >= 100,
            )
            self.db.add(progress)

        await self.db.flush()
        await self.db.refresh(progress)
        return progress

    # ── Admin: User Listing ──────────────────────────────────
    async def list_users(
        self,
        page: int = 1,
        page_size: int = 20,
        role: str | None = None,
        is_active: bool | None = None,
        search: str | None = None,
    ):
        count_stmt = select(func.count()).select_from(User)
        query = select(User)

        if role:
            query = query.where(User.role == role)
            count_stmt = count_stmt.where(User.role == role)
        if is_active is not None:
            query = query.where(User.is_active == is_active)
            count_stmt = count_stmt.where(User.is_active == is_active)
        if search:
            search_filter = User.email.ilike(f"%{search}%") | User.name.ilike(f"%{search}%")
            query = query.where(search_filter)
            count_stmt = count_stmt.where(search_filter)

        total = (await self.db.execute(count_stmt)).scalar() or 0

        offset = (page - 1) * page_size
        query = query.order_by(User.created_at.desc()).offset(offset).limit(page_size)
        result = await self.db.execute(query)
        users = result.scalars().all()

        return users, total

    async def admin_update_user(self, user_id: UUID, **kwargs) -> User:
        user = await self.get_profile(user_id)
        for key, value in kwargs.items():
            if value is not None:
                if key == "role":
                    setattr(user, key, UserRole(value))
                else:
                    setattr(user, key, value)
        await self.db.flush()
        await self.db.refresh(user)
        logger.info("admin_user_updated", target_user=str(user_id), fields=list(kwargs.keys()))
        return user
