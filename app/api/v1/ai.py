"""
AI Assistant and Semantic Search API routes.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_admin_user, get_current_user_optional
from app.database import get_db
from app.models.user import User
from app.schemas.common import ApiResponse
from app.services.ai_search_service import AISearchService

router = APIRouter(prefix="/ai", tags=["AI Search"])


@router.post("/search", response_model=ApiResponse)
async def ai_search(
    q: str = Query(..., min_length=1, max_length=500, description="Semantic search query"),
    force_ai: bool = Query(False, description="Bypass Knowledge Base and force General AI answer"),
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):
    """Perform semantic vector RAG search over Articles and Resources using Gemini."""
    service = AISearchService(db)
    result = await service.rag_search(query=q, user_id=current_user.id if current_user else None, force_ai=force_ai)
    return ApiResponse(data=result)


@router.post("/ingest", response_model=ApiResponse)
async def ingest_knowledge_base(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """Chunk, embed, and index all published articles and resources into Vector DB."""
    service = AISearchService(db)
    result = await service.ingest_knowledge_base()
    return ApiResponse(message="Ingestion process executed.", data=result)
