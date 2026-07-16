"""
Article and ArticleVersion models — versioned knowledge-base content.
Indexes:
  - ix_articles_slug (unique): URL-friendly lookup
  - ix_articles_status: Filter by publication state
  - ix_articles_category_status: Category page with status filter
  - ix_articles_published_at: Chronological listing
  - ix_articles_view_count: Popular articles ranking
  - ix_articles_featured_published: Featured articles on homepage
  - ix_article_versions_article_version: Version history lookup
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
    JSON,
    Uuid,
)
from sqlalchemy.orm import relationship
from app.database import Base
class ArticleStatus(str, enum.Enum):
    draft = "draft"
    review = "review"
    published = "published"
    archived = "archived"
class Article(Base):
    __tablename__ = "articles"
    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    category_id = Column(
        Uuid(as_uuid=True), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True
    )
    author_id = Column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    slug = Column(String(300), unique=True, nullable=False, index=True)
    title = Column(String(500), nullable=False)
    excerpt = Column(Text, nullable=True)
    content_markdown = Column(Text, nullable=False, default="")
    content_html = Column(Text, nullable=True)
    status = Column(
        SAEnum(ArticleStatus, name="article_status"),
        default=ArticleStatus.DRAFT,
        nullable=False,
        index=True,
    )
    version = Column(Integer, default=1, nullable=False)
    featured_image_url = Column(String(500), nullable=True)
    read_time_minutes = Column(Integer, default=1, nullable=False)
    view_count = Column(Integer, default=0, nullable=False)
    seo_metadata = Column(JSON, default=dict, server_default="{}")
    tags = Column(JSON, default=list, server_default="[]")
    is_featured = Column(Boolean, default=False, nullable=False, index=True)
    published_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
    # ── Composite & Performance Indexes ───────────────────────
    __table_args__ = (
        Index("ix_articles_category_status", "category_id", "status"),
        Index("ix_articles_status_published", "status", "published_at"),
        Index("ix_articles_view_count_desc", view_count.desc()),
        Index("ix_articles_featured_published", "is_featured", "published_at",
              postgresql_where=Column("is_featured").is_(True)),
        Index("ix_articles_author_status", "author_id", "status"),
        Index("ix_articles_created_at", "created_at"),
    )
    # ── Relationships ─────────────────────────────────────────
    category = relationship("Category", back_populates="articles", lazy="selectin")
    author = relationship("User", back_populates="articles", lazy="selectin")
    versions = relationship(
        "ArticleVersion", back_populates="article", cascade="all, delete-orphan",
        order_by="ArticleVersion.version_number.desc()", lazy="selectin",
    )
    bookmarks = relationship("Bookmark", back_populates="article", cascade="all, delete-orphan", lazy="selectin")
    reading_progress = relationship("ReadingProgress", back_populates="article", cascade="all, delete-orphan", lazy="selectin")
    feedback = relationship("Feedback", back_populates="article", cascade="all, delete-orphan", lazy="selectin")
    def __repr__(self) -> str:
        return f"<Article '{self.title[:40]}' [{self.status.value}]>"
class ArticleVersion(Base):
    __tablename__ = "article_versions"
    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    article_id = Column(
        Uuid(as_uuid=True), ForeignKey("articles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    edited_by = Column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    version_number = Column(Integer, nullable=False)
    content_markdown = Column(Text, nullable=False)
    change_summary = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    # ── Indexes ───────────────────────────────────────────────
    __table_args__ = (
        Index("ix_article_versions_article_version", "article_id", "version_number", unique=True),
        Index("ix_article_versions_edited_by", "edited_by"),
    )
    # ── Relationships ─────────────────────────────────────────
    article = relationship("Article", back_populates="versions")
    editor = relationship("User", foreign_keys=[edited_by], lazy="selectin")
    def __repr__(self) -> str:
        return f"<ArticleVersion article={self.article_id} v{self.version_number}>"
