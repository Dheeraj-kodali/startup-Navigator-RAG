"""
Search service — full-text article search + search history tracking.
"""

from __future__ import annotations

from typing import List
from uuid import UUID

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.logging_config import get_logger
from app.models.article import Article, ArticleStatus
from app.models.category import Category
from app.models.search_history import SearchHistory

logger = get_logger(__name__)


class SearchService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def search_articles(
        self,
        query: str,
        category_slug: str | None = None,
        page: int = 1,
        page_size: int = 20,
        user_id: UUID | None = None,
    ):
        """
        Full-text search across article title, excerpt, and content.
        Logs the search to history if user_id is provided.
        """
        search_term = f"%{query.strip()}%"

        stmt = select(Article).where(
            Article.status == ArticleStatus.published,
            or_(
                Article.title.ilike(search_term),
                Article.excerpt.ilike(search_term),
                Article.content_markdown.ilike(search_term),
            ),
        )
        count_stmt = select(func.count()).select_from(Article).where(
            Article.status == ArticleStatus.published,
            or_(
                Article.title.ilike(search_term),
                Article.excerpt.ilike(search_term),
                Article.content_markdown.ilike(search_term),
            ),
        )

        # Filter by category if provided
        if category_slug:
            cat_stmt = select(Category.id).where(Category.slug == category_slug)
            cat_result = await self.db.execute(cat_stmt)
            cat_id = cat_result.scalar_one_or_none()
            if cat_id:
                stmt = stmt.where(Article.category_id == cat_id)
                count_stmt = count_stmt.where(Article.category_id == cat_id)

        total = (await self.db.execute(count_stmt)).scalar() or 0

        offset = (page - 1) * page_size
        stmt = stmt.order_by(Article.view_count.desc(), Article.published_at.desc())
        stmt = stmt.offset(offset).limit(page_size)

        result = await self.db.execute(stmt)
        articles = result.scalars().all()

        # Log search to history
        if user_id:
            history = SearchHistory(
                user_id=user_id,
                query=query.strip()[:1000],
                results_count=total,
                search_type="fulltext",
            )
            self.db.add(history)
            await self.db.flush()

        logger.info("search_executed", query=query[:50], results=total)
        return articles, total

    async def get_user_search_history(
        self, user_id: UUID, page: int = 1, page_size: int = 20
    ):
        count_stmt = select(func.count()).where(SearchHistory.user_id == user_id)
        total = (await self.db.execute(count_stmt)).scalar() or 0

        offset = (page - 1) * page_size
        stmt = (
            select(SearchHistory)
            .where(SearchHistory.user_id == user_id)
            .order_by(SearchHistory.created_at.desc())
            .offset(offset)
            .limit(page_size)
        )
        result = await self.db.execute(stmt)
        history = result.scalars().all()
        return history, total

    async def delete_search_history(self, user_id: UUID, history_id: UUID) -> None:
        from sqlalchemy import delete

        stmt = delete(SearchHistory).where(
            SearchHistory.id == history_id,
            SearchHistory.user_id == user_id,
        )
        await self.db.execute(stmt)
        await self.db.flush()

    async def clear_search_history(self, user_id: UUID) -> None:
        from sqlalchemy import delete

        stmt = delete(SearchHistory).where(SearchHistory.user_id == user_id)
        await self.db.execute(stmt)
        await self.db.flush()
        logger.info("search_history_cleared", user_id=str(user_id))
