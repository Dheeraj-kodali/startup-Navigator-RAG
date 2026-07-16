"""
Knowledge Document schema definitions.
"""

from __future__ import annotations

from datetime import datetime
from uuid import UUID
from app.schemas.common import BaseSchema


class KnowledgeDocumentResponse(BaseSchema):
    id: UUID
    title: str
    filename: str
    file_path: str
    file_type: str
    file_size: int
    uploaded_by: UUID | None
    uploaded_at: datetime
    indexing_status: str
    status: str
    chunks_count: int
    indexed_at: datetime | None
    preview_text: str | None = None

class KnowledgeStatsResponse(BaseSchema):
    total_documents: int
    total_chunks: int
    indexed_documents: int
    pending_documents: int
    failed_documents: int
    total_storage_bytes: int


