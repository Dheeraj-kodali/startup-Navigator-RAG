"""
Feedback model — user ratings and reports.

Indexes:
  - ix_feedback_user_type: User's feedback by type
  - ix_feedback_article: Feedback for a specific article
  - ix_feedback_type_created: Admin feedback listing by type
"""

from __future__ import annotations

import enum
import uuid

from sqlalchemy import Column, DateTime, Enum as SAEnum, ForeignKey, Index, Integer, String, Text, func, Uuid
from sqlalchemy.orm import relationship

from app.database import Base


class FeedbackType(str, enum.Enum):
    ARTICLE_RATING = "article_rating"
    BUG_REPORT = "bug_report"
    FEATURE_REQUEST = "feature_request"
    GENERAL = "general"


class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    article_id = Column(
        Uuid(as_uuid=True), ForeignKey("articles.id", ondelete="SET NULL"), nullable=True, index=True
    )
    type = Column(
        SAEnum(FeedbackType, name="feedback_type"),
        default=FeedbackType.GENERAL,
        nullable=False,
        index=True,
    )
    rating = Column(Integer, nullable=True)  # 1-5 scale
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # ── Indexes ───────────────────────────────────────────────
    __table_args__ = (
        Index("ix_feedback_user_type", "user_id", "type"),
        Index("ix_feedback_article", "article_id",
              postgresql_where=Column("article_id").isnot(None)),
        Index("ix_feedback_type_created", "type", "created_at"),
    )

    # ── Relationships ─────────────────────────────────────────
    user = relationship("User", back_populates="feedback")
    article = relationship("Article", back_populates="feedback")

    def __repr__(self) -> str:
        return f"<Feedback {self.type.value} by user={self.user_id}>"
