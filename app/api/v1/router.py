"""
V1 API router — aggregates all v1 endpoint modules.
"""

from fastapi import APIRouter

from app.api.v1.admin import router as admin_router
from app.api.v1.articles import router as articles_router
from app.api.v1.auth import router as auth_router
from app.api.v1.categories import router as categories_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.resources import router as resources_router
from app.api.v1.search import router as search_router
from app.api.v1.users import router as users_router
from app.api.v1.ai import router as ai_router
from app.api.v1.knowledge import router as knowledge_router
from app.api.v1.analytics import router as analytics_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(articles_router)
api_router.include_router(categories_router)
api_router.include_router(resources_router)
api_router.include_router(search_router)
api_router.include_router(dashboard_router)
api_router.include_router(admin_router)
api_router.include_router(ai_router)
api_router.include_router(knowledge_router)
api_router.include_router(analytics_router)

