"""
Resource model — external links, tools, templates tied to categories.
Indexes:
  - ix_resources_category_type: Filter by category + type
  - ix_resources_category_sort: Sorted resources per category
  - ix_resources_featured: Featured resources across categories
"""
from __future__ import annotations
import enum
import uuid
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum as SAEnum,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    func,
    Uuid,
)
from sqlalchemy.orm import relationship
from app.database import Base
class ResourceType(str, enum.Enum):
    tool = "tool"
    template = "template"
    guide = "guide"
    video = "video"
    link = "link"
    document = "document"
class Resource(Base):
    __tablename__ = "resources"
    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    category_id = Column(
        Uuid(as_uuid=True), ForeignKey("categories.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    url = Column(String(1000), nullable=True)
    resource_type = Column(
        SAEnum(ResourceType, name="resource_type"),
        default=ResourceType.LINK,
        nullable=False,
        index=True,
    )
    icon = Column(String(100), nullable=True)
    is_featured = Column(Boolean, default=False, nullable=False)
    sort_order = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
    # ── Indexes ───────────────────────────────────────────────
    __table_args__ = (
        Index("ix_resources_category_type", "category_id", "resource_type"),
        Index("ix_resources_category_sort", "category_id", "sort_order"),
        Index("ix_resources_featured", "is_featured",
              postgresql_where=Column("is_featured").is_(True)),
    )
    # ── Relationships ─────────────────────────────────────────
    category = relationship("Category", back_populates="resources")
    def __repr__(self) -> str:
        return f"<Resource '{self.title[:40]}' ({self.resource_type.value})>"
