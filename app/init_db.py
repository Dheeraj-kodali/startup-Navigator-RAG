"""
Development helper script to initialize the SQLite database schema
directly from SQLAlchemy metadata (bypassing Postgres-specific migrations).
"""

import asyncio
from app.database import Base, engine
# Import models to register them on Base metadata
import app.models
from app.logging_config import setup_logging, get_logger

setup_logging()
logger = get_logger(__name__)

async def init_db():
    logger.info("Initializing SQLite database schema...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database schema initialized successfully!")

if __name__ == "__main__":
    asyncio.run(init_db())
