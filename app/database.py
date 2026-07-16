"""
Async SQLAlchemy engine and session factory for Neon PostgreSQL.

Uses asyncpg as the async driver. Connection pooling is configured
for serverless-friendly behaviour (Neon auto-suspends idle computes).
"""

from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config import get_settings

settings = get_settings()

# ── Engine ────────────────────────────────────────────────────
db_kwargs = {
    "pool_size": 5,
    "max_overflow": 10,
    "pool_pre_ping": True,
    "pool_recycle": 300,
}

import logging
logger = logging.getLogger(__name__)

# Mask password
masked_url = settings.DATABASE_URL
if "@" in masked_url and "://" in masked_url:
    prefix, rest = masked_url.split("://", 1)
    if "@" in rest:
        creds, host = rest.split("@", 1)
        if ":" in creds:
            user, _ = creds.split(":", 1)
            masked_url = f"{prefix}://{user}:***@{host}"

print("="*50, flush=True)
print(f"DATABASE_URL (masked): {masked_url}", flush=True)
print(f"Database type: {settings.DATABASE_URL.split('://')[0]}", flush=True)
print(f"APP_ENV: {settings.APP_ENV}", flush=True)
print("="*50, flush=True)

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG and not settings.is_production,
    connect_args={
        "statement_cache_size": 0,
        "prepared_statement_cache_size": 0,
        "prepared_statement_name_func": lambda: "",
    },
    **db_kwargs
)

# ── Session Factory ───────────────────────────────────────────
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


# ── Declarative Base ─────────────────────────────────────────
class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models."""
    pass


# ── Dependency ────────────────────────────────────────────────
async def get_db():
    """FastAPI dependency that yields an async DB session per request."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
