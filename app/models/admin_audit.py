"""
AdminAuditLog model — tracks all admin actions for accountability.

Every create, update, delete, or status change performed by an admin
is logged here with before/after snapshots for forensic auditing.

Indexes:
  - ix_audit_admin_created: Admin's actions sorted by date
  - ix_audit_entity: Lookup all changes to a specific entity
  - ix_audit_action_created: Filter by action type
"""

from __future__ import annotations

import enum
import uuid

from sqlalchemy import Column, DateTime, Enum as SAEnum, ForeignKey, Index, String, Text, func, JSON, Uuid
from sqlalchemy.orm import relationship

from app.database import Base


class AuditAction(str, enum.Enum):
    create = "create"
    update = "update"
    delete = "delete"
    status_change = "status_change"
    role_change = "role_change"
    ban = "ban"
    unban = "unban"
    revert = "revert"
    reindex = "reindex"
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"
    STATUS_CHANGE = "status_change"
    ROLE_CHANGE = "role_change"
    BAN = "ban"
    UNBAN = "unban"
    REVERT = "revert"
    REINDEX = "reindex"


class AdminAuditLog(Base):
    __tablename__ = "admin_audit_logs"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    admin_id = Column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    action = Column(
        SAEnum(AuditAction, name="audit_action"),
        nullable=False,
    )
    entity_type = Column(String(100), nullable=False)     # "article", "category", "user", "resource"
    entity_id = Column(Uuid(as_uuid=True), nullable=True)  # ID of the affected entity
    description = Column(Text, nullable=True)              # Human-readable summary
    before_data = Column(JSON, nullable=True)              # Snapshot before change
    after_data = Column(JSON, nullable=True)               # Snapshot after change
    ip_address = Column(String(45), nullable=True)          # Admin's IP
    user_agent = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # ── Indexes ───────────────────────────────────────────────
    __table_args__ = (
        Index("ix_audit_admin_created", "admin_id", "created_at"),
        Index("ix_audit_entity", "entity_type", "entity_id"),
        Index("ix_audit_action_created", "action", "created_at"),
        Index("ix_audit_created_at", "created_at"),
    )

    # ── Relationships ─────────────────────────────────────────
    admin_user = relationship("User", back_populates="audit_logs", foreign_keys=[admin_id], lazy="selectin")

    def __repr__(self) -> str:
        return f"<AuditLog {self.action.value} {self.entity_type} by admin={self.admin_id}>"
