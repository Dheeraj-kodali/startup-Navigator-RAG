"""
SearchHistory model — tracks user search queries for analytics.

Indexes:
  - ix_search_history_user_created: User's recent searches
  - ix_search_history_type_created: Filter by search type
  - ix_search_history_query: Query text lookup for analytics
"""

from __future__ import annotations

import uuid

from sqlalchemy import Column, DateTime, ForeignKey, Index, Integer, String, func, Uuid, Text
from sqlalchemy.dialects.sqlite import JSON
from sqlalchemy.orm import relationship

from app.database import Base


class SearchHistory(Base):
    __tablename__ = "search_history"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    query = Column(String(1000), nullable=False)
    results_count = Column(Integer, default=0, nullable=False)
    search_type = Column(String(50), default="fulltext", nullable=False)  # fulltext | ai | ai_rag | ai_general | ai_fallback | ai_error
    
    # New Analytics Columns
    ai_answer = Column(Text, nullable=True)
    knowledge_source = Column(String(100), nullable=True)
    source_documents = Column(JSON, nullable=True)
    response_time_ms = Column(Integer, nullable=True)
    embedding_time_ms = Column(Integer, nullable=True)
    retrieval_time_ms = Column(Integer, nullable=True)
    generation_time_ms = Column(Integer, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # ── Indexes ───────────────────────────────────────────────
    __table_args__ = (
        Index("ix_search_history_user_created", "user_id", "created_at"),
        Index("ix_search_history_type_created", "search_type", "created_at"),
    )

    # ── Relationships ─────────────────────────────────────────
    user = relationship("User", back_populates="search_history")

    def __repr__(self) -> str:
        return f"<SearchHistory '{self.query[:30]}' by user={self.user_id}>"
