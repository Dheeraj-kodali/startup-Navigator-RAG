"""
Dashboard / analytics schemas for admin statistics.
"""

from __future__ import annotations

from datetime import datetime
from typing import List

from pydantic import BaseModel


class OverviewStats(BaseModel):
    total_users: int
    total_articles: int
    total_categories: int
    total_resources: int
    published_articles: int
    draft_articles: int
    total_bookmarks: int
    total_searches: int
    new_users_30d: int
    new_articles_30d: int
    total_ai_rag_searches: int = 0
    total_ai_general_searches: int = 0


class CategoryStat(BaseModel):
    category_name: str
    category_slug: str
    article_count: int
    resource_count: int
    total_views: int


class PopularArticle(BaseModel):
    id: str
    title: str
    slug: str
    view_count: int
    bookmark_count: int
    category_name: str | None = None


class RecentActivity(BaseModel):
    type: str  # "user_joined" | "article_published" | "search"
    description: str
    timestamp: datetime


class DashboardResponse(BaseModel):
    overview: OverviewStats
    categories: List[CategoryStat]
    popular_articles: List[PopularArticle]
    recent_activity: List[RecentActivity]


class FeedbackResponse(BaseModel):
    id: str
    user_email: str | None = None
    article_title: str | None = None
    type: str
    rating: int | None = None
    comment: str | None = None
    created_at: datetime
