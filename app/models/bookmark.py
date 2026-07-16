"""
Bookmark and ReadingProgress models — user engagement tracking.

Indexes:
  - uq_user_article_bookmark (unique): One bookmark per user-article pair
  - uq_user_article_progress (unique): One progress record per user-article pair
  - ix_bookmarks_user_created: User's bookmarks sorted by date
  - ix_reading_progress_user_completed: Filter completed readings per user
"""

from __future__ import annotations

import uuid

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Index, Integer, String, UniqueConstraint, func, Uuid
from sqlalchemy.orm import relationship

from app.database import Base


class Bookmark(Base):
    __tablename__ = "bookmarks"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    article_id = Column(
        Uuid(as_uuid=True), ForeignKey("articles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    note = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint("user_id", "article_id", name="uq_user_article_bookmark"),
        Index("ix_bookmarks_user_created", "user_id", "created_at"),
        Index("ix_bookmarks_article", "article_id"),
    )

    # ── Relationships ─────────────────────────────────────────
    user = relationship("User", back_populates="bookmarks")
    article = relationship("Article", back_populates="bookmarks")

    def __repr__(self) -> str:
        return f"<Bookmark user={self.user_id} article={self.article_id}>"


class ReadingProgress(Base):
    __tablename__ = "reading_progress"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    article_id = Column(
        Uuid(as_uuid=True), ForeignKey("articles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    progress_percent = Column(Integer, default=0, nullable=False)
    is_completed = Column(Boolean, default=False, nullable=False)
    last_read_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint("user_id", "article_id", name="uq_user_article_progress"),
        Index("ix_reading_progress_user_completed", "user_id", "is_completed"),
        Index("ix_reading_progress_user_last_read", "user_id", "last_read_at"),
    )

    # ── Relationships ─────────────────────────────────────────
    user = relationship("User", back_populates="reading_progress")
    article = relationship("Article", back_populates="reading_progress")

    def __repr__(self) -> str:
        return f"<ReadingProgress user={self.user_id} article={self.article_id} {self.progress_percent}%>"
