"""
Tests for AI Search and Ingestion routes.
"""

import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.category import Category
from app.models.article import Article, ArticleStatus
from app.models.search_history import SearchHistory
from app.models.user import User

@pytest.fixture
async def test_category_ai(db_session: AsyncSession) -> Category:
    """Fixture to create a test category."""
    category = Category(
        name="Funding",
        slug="funding",
        description="Venture Capital guides",
        icon="banknote",
        color_hex="#00B894",
        sort_order=2,
    )
    db_session.add(category)
    await db_session.commit()
    await db_session.refresh(category)
    return category

@pytest.fixture
async def admin_headers_ai(client: AsyncClient, test_admin: User) -> dict:
    """Fixture to get headers containing admin auth token."""
    response = await client.post("/api/v1/auth/login", json={
        "email": test_admin.email,
        "password": "AdminPassword123!"
    })
    token = response.json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
async def user_headers_ai(client: AsyncClient, test_user: User) -> dict:
    """Fixture to get headers containing standard user auth token."""
    response = await client.post("/api/v1/auth/login", json={
        "email": test_user.email,
        "password": "Password123!"
    })
    token = response.json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_ai_ingestion(client: AsyncClient, admin_headers_ai: dict):
    """Test that ingestion route executes successfully for admins."""
    response = await client.post("/api/v1/ai/ingest", headers=admin_headers_ai)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["success"] is True
    assert "indexed_chunks" in res_data["data"]


@pytest.mark.asyncio
async def test_ai_ingestion_unauthorized(client: AsyncClient, user_headers_ai: dict):
    """Test that standard users are blocked from triggering ingestion."""
    response = await client.post("/api/v1/ai/ingest", headers=user_headers_ai)
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_ai_search_fallback_pipeline(
    client: AsyncClient,
    test_category_ai: Category,
    admin_headers_ai: dict,
    user_headers_ai: dict,
    db_session: AsyncSession,
    monkeypatch
):
    """Test AI Search fallback pipeline when Gemini is mocked/offline."""
    monkeypatch.setattr("app.services.ai_search_service.HAS_LANGCHAIN", False)
    # 1. Publish an article with specific title
    article = Article(
        category_id=test_category_ai.id,
        author_id=None,
        slug="safe-fundraising",
        title="SAFE Fundraising Standards",
        excerpt="An intro to seed round fundraising using SAFEs.",
        content_markdown="# SAFE standard\nThis explains SAFEs.",
        status=ArticleStatus.published,
    )
    db_session.add(article)
    await db_session.commit()

    # 2. Run semantic search query
    query = "SAFE Fundraising"
    response = await client.post(f"/api/v1/ai/search?q={query}", headers=user_headers_ai)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["success"] is True
    assert "answer" in res_data["data"]
    assert "sources" in res_data["data"]
    
    # 3. Confirm fallback answer mentions the article and links the source
    assert "SAFE Fundraising Standards" in res_data["data"]["answer"]
    assert len(res_data["data"]["sources"]) == 1
    assert res_data["data"]["sources"][0]["title"] == "SAFE Fundraising Standards"

    # 4. Verify search history is logged for the user
    stmt = select(SearchHistory).where(SearchHistory.search_type == "ai_fallback")
    history = (await db_session.execute(stmt)).scalars().all()
    assert len(history) == 1
    assert history[0].query == query
    assert history[0].results_count == 1
