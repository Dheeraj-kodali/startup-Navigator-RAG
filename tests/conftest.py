"""
Pytest configuration and fixtures.
Sets up an in-memory SQLite database for testing to ensure tests run fast and isolated.
"""

import asyncio
from typing import AsyncGenerator, Generator
import pytest
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.database import Base, get_db
from app.core.security import hash_password
from app.models.user import User, UserRole

import os
import app.database as app_db

# Use file-based SQLite for testing to support concurrent connections in background tasks
TEST_DATABASE_URL = "sqlite+aiosqlite:///./test_test.db"

engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

TestingSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Globally override the sessionmaker for the test runner process
app_db.AsyncSessionLocal = TestingSessionLocal



@pytest.fixture(scope="session")
def event_loop() -> Generator[asyncio.AbstractEventLoop, None, None]:
    """Create an instance of the default event loop for each test case."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="function", autouse=True)
async def setup_db() -> AsyncGenerator[None, None]:
    """Create tables before each test and drop them after."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()
    try:
        if os.path.exists("./test_test.db"):
            os.remove("./test_test.db")
    except Exception:
        pass


@pytest.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Provide a database session wrapper for direct db calls in tests."""
    async with TestingSessionLocal() as session:
        yield session

@pytest.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Provide an HTTPX AsyncClient for API calls with overridden database dependency."""
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    
    # Use ASGITransport for testing FastAPI app
    async with AsyncClient(
        transport=ASGITransport(app=app), 
        base_url="http://testserver"
    ) as ac:
        yield ac
        
    app.dependency_overrides.clear()

@pytest.fixture
async def test_user(db_session: AsyncSession) -> User:
    """Fixture to create a regular user."""
    user = User(
        email="founder@thirdeye.io",
        password_hash=hash_password("Password123!"),
        name="Founder User",
        role=UserRole.USER,
        email_verified=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user

@pytest.fixture
async def test_admin(db_session: AsyncSession) -> User:
    """Fixture to create an admin user."""
    admin = User(
        email="admin@startupnavigator.com",
        password_hash=hash_password("AdminPassword123!"),
        name="Admin User",
        role=UserRole.ADMIN,
        email_verified=True,
    )
    db_session.add(admin)
    await db_session.commit()
    await db_session.refresh(admin)
    return admin
