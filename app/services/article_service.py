"""
Article service — CRUD, versioning, search, view counting.
"""

from __future__ import annotations

import math
from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID

from slugify import slugify
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.exceptions import ArticleNotFoundException, SlugAlreadyExistsException
from app.logging_config import get_logger
from app.models.article import Article, ArticleStatus, ArticleVersion
from app.models.bookmark import Bookmark

logger = get_logger(__name__)


class ArticleService:
    def __init__(self, db: AsyncSession):
        self.db = db

    # ── Create ───────────────────────────────────────────────
    async def create_article(self, author_id: UUID, **kwargs) -> Article:
        title = kwargs["title"]
        slug = kwargs.get("slug") or slugify(title)

        # Ensure unique slug
        slug = await self._ensure_unique_slug(slug)

        status_str = kwargs.pop("status", "draft")
        status = ArticleStatus(status_str)

        article = Article(
            author_id=author_id,
            slug=slug,
            status=status,
            read_time_minutes=self._estimate_read_time(kwargs.get("content_markdown", "")),
            published_at=datetime.now(timezone.utc) if status == ArticleStatus.PUBLISHED else None,
            **{k: v for k, v in kwargs.items() if k != "slug"},
        )
        self.db.add(article)
        await self.db.flush()
        await self.db.refresh(article)

        # Create initial version
        version = ArticleVersion(
            article_id=article.id,
            edited_by=author_id,
            version_number=1,
            content_markdown=article.content_markdown,
            change_summary="Initial version",
        )
        self.db.add(version)
        await self.db.flush()

        logger.info("article_created", article_id=str(article.id), slug=slug)
        # Auto-embed in vector store
        try:
            from app.services.ai_search_service import AISearchService
            await AISearchService(self.db).index_article(article)
        except Exception as e:
            logger.error("article_auto_embed_failed", error=str(e))
        return article

    # ── Read ─────────────────────────────────────────────────
    async def get_article_by_slug(self, slug: str) -> Article:
        stmt = select(Article).where(Article.slug == slug)
        result = await self.db.execute(stmt)
        article = result.scalar_one_or_none()
        if not article:
            raise ArticleNotFoundException()
        return article

    async def get_article_by_id(self, article_id: UUID) -> Article:
        stmt = select(Article).where(Article.id == article_id)
        result = await self.db.execute(stmt)
        article = result.scalar_one_or_none()
        if not article:
            raise ArticleNotFoundException()
        return article

    async def list_articles(
        self,
        page: int = 1,
        page_size: int = 20,
        category_id: UUID | None = None,
        status: str | None = None,
        is_featured: bool | None = None,
        search: str | None = None,
        published_only: bool = True,
    ):
        count_stmt = select(func.count()).select_from(Article)
        query = select(Article)

        if published_only:
            query = query.where(Article.status == ArticleStatus.PUBLISHED)
            count_stmt = count_stmt.where(Article.status == ArticleStatus.PUBLISHED)
        elif status:
            query = query.where(Article.status == ArticleStatus(status))
            count_stmt = count_stmt.where(Article.status == ArticleStatus(status))

        if category_id:
            query = query.where(Article.category_id == category_id)
            count_stmt = count_stmt.where(Article.category_id == category_id)
        if is_featured is not None:
            query = query.where(Article.is_featured == is_featured)
            count_stmt = count_stmt.where(Article.is_featured == is_featured)
        if search:
            search_filter = or_(
                Article.title.ilike(f"%{search}%"),
                Article.excerpt.ilike(f"%{search}%"),
            )
            query = query.where(search_filter)
            count_stmt = count_stmt.where(search_filter)

        total = (await self.db.execute(count_stmt)).scalar() or 0
        offset = (page - 1) * page_size
        query = query.order_by(Article.published_at.desc().nulls_last(), Article.created_at.desc())
        query = query.offset(offset).limit(page_size)

        result = await self.db.execute(query)
        articles = result.scalars().all()
        return articles, total

    async def get_featured_articles(self, limit: int = 10) -> List[Article]:
        stmt = (
            select(Article)
            .where(Article.status == ArticleStatus.PUBLISHED, Article.is_featured == True)
            .order_by(Article.published_at.desc())
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    # ── Update ───────────────────────────────────────────────
    async def update_article(self, article_id: UUID, editor_id: UUID, change_summary: str | None = None, **kwargs) -> Article:
        article = await self.get_article_by_id(article_id)

        # Track content changes for versioning
        content_changed = False
        if "content_markdown" in kwargs and kwargs["content_markdown"] is not None:
            if kwargs["content_markdown"] != article.content_markdown:
                content_changed = True

        for key, value in kwargs.items():
            if value is not None and hasattr(article, key):
                setattr(article, key, value)

        if "content_markdown" in kwargs and kwargs["content_markdown"]:
            article.read_time_minutes = self._estimate_read_time(kwargs["content_markdown"])

        # Create new version on content changes
        if content_changed:
            article.version += 1
            version = ArticleVersion(
                article_id=article.id,
                edited_by=editor_id,
                version_number=article.version,
                content_markdown=article.content_markdown,
                change_summary=change_summary or f"Updated to version {article.version}",
            )
            self.db.add(version)

        await self.db.flush()
        await self.db.refresh(article)
        logger.info("article_updated", article_id=str(article_id), version=article.version)
        # Auto-embed updates
        try:
            from app.services.ai_search_service import AISearchService
            await AISearchService(self.db).index_article(article)
        except Exception as e:
            logger.error("article_update_embed_failed", error=str(e))
        return article

    async def update_article_status(self, article_id: UUID, status: str) -> Article:
        article = await self.get_article_by_id(article_id)
        article.status = ArticleStatus(status)
        if status == "published" and not article.published_at:
            article.published_at = datetime.now(timezone.utc)
        await self.db.flush()
        await self.db.refresh(article)
        logger.info("article_status_changed", article_id=str(article_id), status=status)
        # Auto-embed updates
        try:
            from app.services.ai_search_service import AISearchService
            await AISearchService(self.db).index_article(article)
        except Exception as e:
            logger.error("article_status_embed_failed", error=str(e))
        return article

    # ── Delete ───────────────────────────────────────────────
    async def delete_article(self, article_id: UUID) -> None:
        article = await self.get_article_by_id(article_id)
        article.status = ArticleStatus.ARCHIVED
        await self.db.flush()
        logger.info("article_archived", article_id=str(article_id))
        # Remove from vector index since it is archived
        try:
            from app.services.ai_search_service import AISearchService
            await AISearchService(self.db).delete_document(article_id)
        except Exception as e:
            logger.error("article_delete_embed_failed", error=str(e))

    # ── Versions ─────────────────────────────────────────────
    async def get_article_versions(self, article_id: UUID) -> List[ArticleVersion]:
        stmt = (
            select(ArticleVersion)
            .where(ArticleVersion.article_id == article_id)
            .order_by(ArticleVersion.version_number.desc())
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def revert_to_version(self, article_id: UUID, version_id: UUID, editor_id: UUID) -> Article:
        stmt = select(ArticleVersion).where(
            ArticleVersion.id == version_id, ArticleVersion.article_id == article_id
        )
        result = await self.db.execute(stmt)
        version = result.scalar_one_or_none()
        if not version:
            raise ArticleNotFoundException(message="Article version not found.")

        return await self.update_article(
            article_id=article_id,
            editor_id=editor_id,
            content_markdown=version.content_markdown,
            change_summary=f"Reverted to version {version.version_number}",
        )

    # ── View Counting ────────────────────────────────────────
    async def increment_view_count(self, article_id: UUID) -> None:
        stmt = select(Article).where(Article.id == article_id)
        result = await self.db.execute(stmt)
        article = result.scalar_one_or_none()
        if article:
            article.view_count += 1
            await self.db.flush()

    # ── Helpers ──────────────────────────────────────────────
    async def _ensure_unique_slug(self, slug: str) -> str:
        """Append a numeric suffix if slug already exists."""
        base_slug = slug
        counter = 1
        while True:
            stmt = select(Article).where(Article.slug == slug)
            result = await self.db.execute(stmt)
            if not result.scalar_one_or_none():
                return slug
            slug = f"{base_slug}-{counter}"
            counter += 1

    @staticmethod
    def _estimate_read_time(content: str) -> int:
        """Estimate reading time in minutes (~200 WPM)."""
        word_count = len(content.split())
        return max(1, math.ceil(word_count / 200))
