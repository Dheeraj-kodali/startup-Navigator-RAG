"""
Dashboard API endpoints — admin statistics and analytics.
"""

from __future__ import annotations

import math

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_admin_user
from app.database import get_db
from app.models.user import User
from app.schemas.common import ApiResponse, PaginatedResponse, PaginationMeta
from app.schemas.dashboard import (
    CategoryStat,
    DashboardResponse,
    FeedbackResponse,
    OverviewStats,
    PopularArticle,
    RecentActivity,
)
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("", response_model=ApiResponse[DashboardResponse])
async def get_dashboard(
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the full admin dashboard with all statistics."""
    service = DashboardService(db)

    overview = await service.get_overview_stats()
    categories = await service.get_category_stats()
    popular = await service.get_popular_articles(limit=10)
    activity = await service.get_recent_activity(limit=20)

    return ApiResponse(
        data=DashboardResponse(
            overview=OverviewStats(**overview),
            categories=[CategoryStat(**c) for c in categories],
            popular_articles=[PopularArticle(**p) for p in popular],
            recent_activity=[RecentActivity(**a) for a in activity],
        ),
    )


@router.get("/stats", response_model=ApiResponse[OverviewStats])
async def get_stats(
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Get overview statistics only."""
    service = DashboardService(db)
    overview = await service.get_overview_stats()
    return ApiResponse(data=OverviewStats(**overview))


@router.get("/feedback", response_model=PaginatedResponse[FeedbackResponse])
async def get_feedback(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """List all user feedback."""
    service = DashboardService(db)
    feedbacks, total = await service.get_feedback_list(page, page_size)
    return PaginatedResponse(
        data=[FeedbackResponse(**f) for f in feedbacks],
        pagination=PaginationMeta(
            page=page,
            page_size=page_size,
            total_items=total,
            total_pages=math.ceil(total / page_size) if total > 0 else 0,
            has_next=page * page_size < total,
            has_previous=page > 1,
        ),
    )
