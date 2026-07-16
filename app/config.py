"""
Application configuration loaded from environment variables.

Uses pydantic-settings for type-safe config with .env file support.
All secrets and environment-specific values are configured here.
"""

from __future__ import annotations

from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central application settings — sourced from environment variables / .env file."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    # ── Application ──────────────────────────────────────────
    APP_NAME: str = "Startup Navigator"
    APP_VERSION: str = "1.0.0"
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"

    # ── Server ───────────────────────────────────────────────
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # ── Database (Neon PostgreSQL) ───────────────────────────
    DATABASE_URL: str = ""
    
    from pydantic import model_validator
    
    @model_validator(mode="after")
    def override_database_url(self) -> 'Settings':
        self.DATABASE_URL = "postgresql+asyncpg://neondb_owner:npg_UWQ1fNBmJ6uj@ep-curly-voice-aw7txmm6-pooler.c-12.us-east-1.aws.neon.tech/neondb?ssl=require"
        return self

    # ── JWT Authentication ───────────────────────────────────
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── CORS ─────────────────────────────────────────────────
    CORS_ORIGINS: List[str] = ["*"]

    # ── Storage ──────────────────────────────────────────────
    UPLOAD_DIR: str = "./uploads"
    CHROMA_DB_DIR: str = "./chromadb_groq"

    # ── Rate Limiting ────────────────────────────────────────
    RATE_LIMIT_PER_MINUTE: int = 60

    # ── Logging ──────────────────────────────────────────────
    LOG_LEVEL: str = "INFO"

    # ── AI / Groq ─────────────────────────────────────────────
    GROQ_API_KEY: str = ""

    @property
    def is_production(self) -> bool:
        return self.APP_ENV == "production"

    @property
    def sync_database_url(self) -> str:
        """Return a synchronous database URL for Alembic migrations."""
        return self.DATABASE_URL.replace(
            "postgresql+asyncpg://", "postgresql+psycopg2://"
        ).replace("postgresql://", "postgresql+psycopg2://")


@lru_cache()
def get_settings() -> Settings:
    """Cached singleton — avoids re-reading .env on every request."""
    return Settings()
