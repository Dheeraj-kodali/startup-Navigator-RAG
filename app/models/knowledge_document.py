"""
KnowledgeDocument model — represents files uploaded by admins to the knowledge base.
"""

from __future__ import annotations

import uuid
from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    func,
    Uuid,
)
from sqlalchemy.orm import relationship

from app.database import Base


class KnowledgeDocument(Base):
    __tablename__ = "knowledge_documents"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(500), nullable=False)
    filename = Column(String(500), nullable=False)
    file_path = Column(String(1000), nullable=False)
    file_type = Column(String(50), nullable=False)  # pdf, docx, txt, md
    file_size = Column(Integer, nullable=False)     # size in bytes
    uploaded_by = Column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    indexing_status = Column(String(100), default="active", nullable=False)  # active, processing, error
    chunks_count = Column(Integer, default=0, nullable=False)
    indexed_at = Column(DateTime(timezone=True), nullable=True)


    @property
    def status(self) -> str:
        return self.indexing_status

    # ── Relationships ─────────────────────────────────────────
    uploader = relationship("User")

    def __repr__(self) -> str:
        return f"<KnowledgeDocument '{self.title}' ({self.file_type})>"

