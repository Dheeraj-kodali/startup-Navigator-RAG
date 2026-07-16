"""
DashboardStats model — stores periodic system analytics snapshots.

This is a time-series or snapshot cache model for dashboard charts and metrics
to avoid expensive table scan queries during traffic spikes.
"""

from __future__ import annotations

import uuid
from sqlalchemy import Column, DateTime, Index, Integer, func, JSON, Uuid

from app.database import Base


class DashboardStats(Base):
    __tablename__ = "dashboard_stats"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    snapshot_date = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, unique=True, index=True)
    total_users = Column(Integer, default=0, nullable=False)
    total_articles = Column(Integer, default=0, nullable=False)
    total_categories = Column(Integer, default=0, nullable=False)
    total_resources = Column(Integer, default=0, nullable=False)
    total_bookmarks = Column(Integer, default=0, nullable=False)
    total_searches = Column(Integer, default=0, nullable=False)
    
    # Detailed nested metrics: daily views, category breakdowns, growth rates
    detailed_metrics = Column(JSON, default=dict, server_default="{}")

    # ── Indexes ───────────────────────────────────────────────
    __table_args__ = (
        Index("ix_dashboard_stats_snapshot_date_desc", snapshot_date.desc()),
    )

    def __repr__(self) -> str:
        return f"<DashboardStats snapshot={self.snapshot_date.isoformat()}>"
