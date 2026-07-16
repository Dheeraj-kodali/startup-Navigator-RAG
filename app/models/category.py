"""
Category model — top-level content groupings.

Indexes:
  - ix_categories_slug (unique): URL lookup
  - ix_categories_active_sort: Active categories sorted for listing
"""

from __future__ import annotations

import uuid

from sqlalchemy import Boolean, Column, DateTime, Index, Integer, String, Text, func, Uuid
from sqlalchemy.orm import relationship

from app.database import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String(100), nullable=True)
    color_hex = Column(String(7), nullable=True)
    sort_order = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # ── Indexes ───────────────────────────────────────────────
    __table_args__ = (
        Index("ix_categories_active_sort", "is_active", "sort_order"),
    )

    # ── Relationships ─────────────────────────────────────────
    articles = relationship("Article", back_populates="category", lazy="selectin")
    resources = relationship("Resource", back_populates="category", cascade="all, delete-orphan", lazy="selectin")

    def __repr__(self) -> str:
        return f"<Category {self.slug}>"
