"""
Search history schemas.
"""

from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class SearchHistoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    query: str
    results_count: int
    search_type: str
    ai_answer: str | None = None
    knowledge_source: str | None = None
    source_documents: list[dict] | None = None
    response_time_ms: int | None = None
    embedding_time_ms: int | None = None
    retrieval_time_ms: int | None = None
    generation_time_ms: int | None = None
    created_at: datetime


class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=500)
    category_slug: str | None = None
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)
