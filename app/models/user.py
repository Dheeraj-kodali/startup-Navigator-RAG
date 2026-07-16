"""
User model — authentication, profile, and role management.

Indexes:
  - ix_users_email (unique): Fast login lookup
  - ix_users_role: Filter by role for admin queries
  - ix_users_is_active: Filter active users
  - ix_users_provider: OAuth provider + provider_id lookup
  - ix_users_created_at: Sort by registration date
"""

from __future__ import annotations

import enum
import uuid

from sqlalchemy import Boolean, Column, DateTime, Enum as SAEnum, Index, String, func, JSON, Uuid
from sqlalchemy.orm import relationship

from app.database import Base


class UserRole(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"


class AuthProvider(str, enum.Enum):
    CREDENTIALS = "credentials"
    GOOGLE = "google"
    GITHUB = "github"


class User(Base):
    __tablename__ = "users"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=True)
    name = Column(String(255), nullable=False)
    avatar_url = Column(String(500), nullable=True)
    role = Column(SAEnum(UserRole, name="user_role", values_callable=lambda x: [e.value for e in x]), default=UserRole.USER, nullable=False, index=True)
    auth_provider = Column(
        SAEnum(AuthProvider, name="auth_provider", values_callable=lambda x: [e.value for e in x]),
        default=AuthProvider.CREDENTIALS,
        nullable=False,
    )
    provider_id = Column(String(255), nullable=True)
    email_verified = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    preferences = Column(JSON, default=dict, server_default="{}")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
    last_login_at = Column(DateTime(timezone=True), nullable=True)

    # ── Composite & Partial Indexes ───────────────────────────
    __table_args__ = (
        Index("ix_users_provider_lookup", "auth_provider", "provider_id", unique=True,
              postgresql_where=Column("provider_id").isnot(None)),
        Index("ix_users_active_role", "is_active", "role"),
        Index("ix_users_created_at", "created_at"),
        Index("ix_users_email_lower", func.lower(Column("email")), unique=True),
    )

    # ── Relationships ─────────────────────────────────────────
    articles = relationship("Article", back_populates="author", lazy="selectin")
    bookmarks = relationship("Bookmark", back_populates="user", cascade="all, delete-orphan", lazy="selectin")
    search_history = relationship("SearchHistory", back_populates="user", cascade="all, delete-orphan", lazy="selectin")
    reading_progress = relationship("ReadingProgress", back_populates="user", cascade="all, delete-orphan", lazy="selectin")
    feedback = relationship("Feedback", back_populates="user", cascade="all, delete-orphan", lazy="selectin")
    audit_logs = relationship("AdminAuditLog", back_populates="admin_user", foreign_keys="AdminAuditLog.admin_id", cascade="all, delete-orphan", lazy="selectin")

    def __repr__(self) -> str:
        return f"<User {self.email} ({self.role.value})>"
