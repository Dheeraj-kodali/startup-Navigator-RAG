"""
Dashboard service — aggregated statistics for admin dashboard.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.article import Article, ArticleStatus
from app.models.bookmark import Bookmark
from app.models.category import Category
from app.models.feedback import Feedback
from app.models.resource import Resource
from app.models.search_history import SearchHistory
from app.models.user import User


class DashboardService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_overview_stats(self) -> dict:
        now = datetime.now(timezone.utc)
        thirty_days_ago = now - timedelta(days=30)

        total_users = (await self.db.execute(select(func.count()).select_from(User))).scalar() or 0
        total_articles = (await self.db.execute(select(func.count()).select_from(Article))).scalar() or 0
        total_categories = (
            await self.db.execute(
                select(func.count()).where(Category.is_active == True)
            )
        ).scalar() or 0
        total_resources = (await self.db.execute(select(func.count()).select_from(Resource))).scalar() or 0

        published_articles = (
            await self.db.execute(
                select(func.count()).where(Article.status == ArticleStatus.published)
            )
        ).scalar() or 0
        draft_articles = (
            await self.db.execute(
                select(func.count()).where(Article.status == ArticleStatus.draft)
            )
        ).scalar() or 0
        total_bookmarks = (await self.db.execute(select(func.count()).select_from(Bookmark))).scalar() or 0
        total_searches = (await self.db.execute(select(func.count()).select_from(SearchHistory))).scalar() or 0

        new_users_30d = (
            await self.db.execute(
                select(func.count()).where(User.created_at >= thirty_days_ago)
            )
        ).scalar() or 0
        new_articles_30d = (
            await self.db.execute(
                select(func.count()).where(Article.created_at >= thirty_days_ago)
            )
        ).scalar() or 0

        total_ai_rag_searches = (
            await self.db.execute(
                select(func.count()).where(SearchHistory.search_type == "ai_rag")
            )
        ).scalar() or 0

        total_ai_general_searches = (
            await self.db.execute(
                select(func.count()).where(SearchHistory.search_type == "ai_general")
            )
        ).scalar() or 0

        return {
            "total_users": total_users,
            "total_articles": total_articles,
            "total_categories": total_categories,
            "total_resources": total_resources,
            "published_articles": published_articles,
            "draft_articles": draft_articles,
            "total_bookmarks": total_bookmarks,
            "total_searches": total_searches,
            "new_users_30d": new_users_30d,
            "new_articles_30d": new_articles_30d,
            "total_ai_rag_searches": total_ai_rag_searches,
            "total_ai_general_searches": total_ai_general_searches,
        }

    async def get_category_stats(self) -> list:
        stmt = select(Category).where(Category.is_active == True).order_by(Category.sort_order)
        result = await self.db.execute(stmt)
        categories = result.scalars().all()

        stats = []
        for cat in categories:
            article_count = (
                await self.db.execute(
                    select(func.count()).where(Article.category_id == cat.id)
                )
            ).scalar() or 0
            resource_count = (
                await self.db.execute(
                    select(func.count()).where(Resource.category_id == cat.id)
                )
            ).scalar() or 0
            total_views = (
                await self.db.execute(
                    select(func.coalesce(func.sum(Article.view_count), 0)).where(
                        Article.category_id == cat.id
                    )
                )
            ).scalar() or 0

            stats.append({
                "category_name": cat.name,
                "category_slug": cat.slug,
                "article_count": article_count,
                "resource_count": resource_count,
                "total_views": total_views,
            })
        return stats

    async def get_popular_articles(self, limit: int = 10) -> list:
        stmt = (
            select(Article)
            .where(Article.status == ArticleStatus.published)
            .order_by(Article.view_count.desc())
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        articles = result.scalars().all()

        popular = []
        for art in articles:
            bookmark_count = (
                await self.db.execute(
                    select(func.count()).where(Bookmark.article_id == art.id)
                )
            ).scalar() or 0

            popular.append({
                "id": str(art.id),
                "title": art.title,
                "slug": art.slug,
                "view_count": art.view_count,
                "bookmark_count": bookmark_count,
                "category_name": art.category.name if art.category else None,
            })
        return popular

    async def get_recent_activity(self, limit: int = 20) -> list:
        activities = []

        # Recent users
        users_stmt = select(User).order_by(User.created_at.desc()).limit(limit // 2)
        users_result = await self.db.execute(users_stmt)
        for user in users_result.scalars().all():
            activities.append({
                "type": "user_joined",
                "description": f"{user.name} joined the platform",
                "timestamp": user.created_at,
            })

        # Recent published articles
        articles_stmt = (
            select(Article)
            .where(Article.status == ArticleStatus.published)
            .order_by(Article.published_at.desc().nulls_last())
            .limit(limit // 2)
        )
        articles_result = await self.db.execute(articles_stmt)
        for article in articles_result.scalars().all():
            activities.append({
                "type": "article_published",
                "description": f"Article '{article.title[:50]}' was published",
                "timestamp": article.published_at or article.created_at,
            })

        # Sort combined by timestamp descending
        activities.sort(key=lambda x: x["timestamp"], reverse=True)
        return activities[:limit]

    async def get_feedback_list(self, page: int = 1, page_size: int = 20):
        count_stmt = select(func.count()).select_from(Feedback)
        total = (await self.db.execute(count_stmt)).scalar() or 0

        offset = (page - 1) * page_size
        stmt = (
            select(Feedback)
            .order_by(Feedback.created_at.desc())
            .offset(offset)
            .limit(page_size)
        )
        result = await self.db.execute(stmt)
        feedbacks = result.scalars().all()

        items = []
        for fb in feedbacks:
            items.append({
                "id": str(fb.id),
                "user_email": fb.user.email if fb.user else None,
                "article_title": fb.article.title if fb.article else None,
                "type": fb.type.value,
                "rating": fb.rating,
                "comment": fb.comment,
                "created_at": fb.created_at,
            })
        return items, total
