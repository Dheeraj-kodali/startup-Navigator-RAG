"""
Integration and CRUD tests for Articles, Resources, Dashboard, Search History, and Admin APIs.
"""

import pytest
from httpx import AsyncClient
from uuid import UUID, uuid4
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.category import Category
from app.models.article import Article, ArticleVersion
from app.models.resource import Resource, ResourceType
from app.models.user import User

@pytest.fixture
async def test_category(db_session: AsyncSession) -> Category:
    """Fixture to create a test category."""
    category = Category(
        name="Taxation",
        slug="taxation",
        description="Corporate taxation guides",
        icon="percent",
        color_hex="#D63031",
        sort_order=1,
    )
    db_session.add(category)
    await db_session.commit()
    await db_session.refresh(category)
    return category

@pytest.fixture
async def admin_headers(client: AsyncClient, test_admin: User) -> dict:
    """Fixture to get headers containing admin auth token."""
    response = await client.post("/api/v1/auth/login", json={
        "email": test_admin.email,
        "password": "AdminPassword123!"
    })
    token = response.json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
async def user_headers(client: AsyncClient, test_user: User) -> dict:
    """Fixture to get headers containing standard user auth token."""
    response = await client.post("/api/v1/auth/login", json={
        "email": test_user.email,
        "password": "Password123!"
    })
    token = response.json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}


# ═══════════════════════════════════════════════════════════════
# 1. ARTICLES CRUD TESTS
# ═══════════════════════════════════════════════════════════════

@pytest.mark.asyncio
async def test_admin_article_lifecycle(client: AsyncClient, test_category: Category, admin_headers: dict, db_session: AsyncSession):
    """Test full admin CRUD lifecycle for an article (create, status update, read, revert)."""
    # A. CREATE
    create_payload = {
        "title": "Demystifying GST for Startups",
        "category_id": str(test_category.id),
        "excerpt": "A simplified guide to Goods and Services Tax.",
        "content_markdown": "# GST Guide\nGST is simple.",
        "featured_image_url": "http://example.com/gst.jpg",
        "tags": ["tax", "gst", "india"],
        "is_featured": True,
        "status": "draft"
    }
    create_resp = await client.post("/api/v1/admin/articles", json=create_payload, headers=admin_headers)
    assert create_resp.status_code == 201
    article_id = create_resp.json()["data"]["id"]
    
    # B. READ DRAFT (Confirm database save and draft status)
    db_article = await db_session.get(Article, UUID(article_id))
    assert db_article is not None
    assert db_article.title == create_payload["title"]
    assert db_article.version == 1

    # C. UPDATE (Triggers version history creation)
    update_payload = {
        "title": "Demystifying GST for Startups - Updated",
        "content_markdown": "# GST Guide V2\nGST is still simple.",
        "change_summary": "Updated markdown body"
    }
    update_resp = await client.patch(f"/api/v1/admin/articles/{article_id}", json=update_payload, headers=admin_headers)
    assert update_resp.status_code == 200
    assert update_resp.json()["data"]["version"] == 2

    # Verify version audit logs
    version_stmt = select(ArticleVersion).where(ArticleVersion.article_id == UUID(article_id))
    versions = (await db_session.execute(version_stmt)).scalars().all()
    assert len(versions) == 2  # v1 (initial) + v2

    # D. PUBLISH
    status_payload = {"status": "published"}
    status_resp = await client.patch(f"/api/v1/admin/articles/{article_id}/status", json=status_payload, headers=admin_headers)
    assert status_resp.status_code == 200
    assert status_resp.json()["data"]["status"] == "published"

    # E. READ PUBLIC (Ensure it is now visible under articles route)
    list_resp = await client.get("/api/v1/articles")
    assert list_resp.status_code == 200
    items = list_resp.json()["data"]
    assert len(items) >= 1
    assert items[0]["id"] == article_id

    # F. DELETE (Archive status)
    delete_resp = await client.delete(f"/api/v1/admin/articles/{article_id}", headers=admin_headers)
    assert delete_resp.status_code == 200
    
    # Verify soft deleted article status
    await db_session.refresh(db_article)
    assert db_article.status.value == "archived"


# ═══════════════════════════════════════════════════════════════
# 2. RESOURCES CRUD TESTS
# ═══════════════════════════════════════════════════════════════

@pytest.mark.asyncio
async def test_resources_crud(client: AsyncClient, test_category: Category, admin_headers: dict, db_session: AsyncSession):
    """Test full CRUD lifecycle for Resource directories."""
    # A. CREATE
    create_payload = {
        "category_id": str(test_category.id),
        "title": "Startup Tax Calculator",
        "description": "Calculates tax obligations.",
        "url": "https://calculator.startupnavigator.com",
        "resource_type": "tool",
        "icon": "calculator",
        "is_featured": True
    }
    response = await client.post("/api/v1/admin/resources", json=create_payload, headers=admin_headers)
    assert response.status_code == 201
    resource_id = response.json()["data"]["id"]

    # B. LIST (with category filter)
    list_resp = await client.get(f"/api/v1/resources?category_id={test_category.id}")
    assert list_resp.status_code == 200
    assert len(list_resp.json()["data"]) == 1
    assert list_resp.json()["data"][0]["title"] == create_payload["title"]

    # C. UPDATE
    update_payload = {"title": "Startup Tax Calculator - Revised"}
    update_resp = await client.patch(f"/api/v1/admin/resources/{resource_id}", json=update_payload, headers=admin_headers)
    assert update_resp.status_code == 200
    assert update_resp.json()["data"]["title"] == "Startup Tax Calculator - Revised"

    # D. DELETE
    delete_resp = await client.delete(f"/api/v1/admin/resources/{resource_id}", headers=admin_headers)
    assert delete_resp.status_code == 200
    
    # Confirm deletion from database
    db_res = await db_session.get(Resource, UUID(resource_id))
    assert db_res is None


# ═══════════════════════════════════════════════════════════════
# 3. SEARCH AND SEARCH HISTORY TESTS
# ═══════════════════════════════════════════════════════════════

@pytest.mark.asyncio
async def test_search_and_history(client: AsyncClient, test_category: Category, admin_headers: dict, user_headers: dict):
    """Test full-text search engine and automated search history logging."""
    # Publish an article to search for
    create_payload = {
        "title": "Unique tax compliance methods",
        "category_id": str(test_category.id),
        "content_markdown": "Searchable body paragraph.",
        "status": "published"
    }
    await client.post("/api/v1/admin/articles", json=create_payload, headers=admin_headers)

    # A. Search as authenticated user (should trigger history log)
    search_resp = await client.get("/api/v1/search?q=compliance", headers=user_headers)
    assert search_resp.status_code == 200
    assert len(search_resp.json()["data"]) >= 1

    # B. Verify search history log
    history_resp = await client.get("/api/v1/search/history", headers=user_headers)
    assert history_resp.status_code == 200
    history_data = history_resp.json()["data"]
    assert len(history_data) >= 1
    assert history_data[0]["query"] == "compliance"

    # C. Clear search history
    clear_resp = await client.delete("/api/v1/search/history", headers=user_headers)
    assert clear_resp.status_code == 200

    # D. Verify empty history
    history_resp_after = await client.get("/api/v1/search/history", headers=user_headers)
    assert len(history_resp_after.json()["data"]) == 0


# ═══════════════════════════════════════════════════════════════
# 4. DASHBOARD STATISTICS TESTS
# ═══════════════════════════════════════════════════════════════

@pytest.mark.asyncio
async def test_dashboard_stats(client: AsyncClient, admin_headers: dict):
    """Test dashboard stats aggregation and user feedback lists."""
    response = await client.get("/api/v1/dashboard", headers=admin_headers)
    assert response.status_code == 200
    res_data = response.json()
    assert "overview" in res_data["data"]
    assert "categories" in res_data["data"]
    assert "popular_articles" in res_data["data"]
    assert "recent_activity" in res_data["data"]
