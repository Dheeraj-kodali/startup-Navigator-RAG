from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any, Dict

from app.api.deps import get_admin_user
from app.database import get_db
from app.models.user import User
from app.schemas.common import ApiResponse
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/dashboard", response_model=ApiResponse[Dict[str, Any]])
async def get_analytics_dashboard(
    time_range: str = Query("all", description="Time range: today, 7d, 30d, all"),
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the full analytics dashboard statistics for the AI Search RAG pipeline."""
    service = AnalyticsService(db)
    
    data = await service.get_dashboard_metrics(time_range=time_range)
    recent_activity = await service.get_recent_activity(limit=10)
    
    data["recent_activity"] = recent_activity
    
    return ApiResponse(data=data)
