"""
Tests for Knowledge Base document management and auto-indexing API endpoints.
"""

import io
import os
import asyncio
import pytest
import unittest.mock as mock
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.knowledge_document import KnowledgeDocument

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


@pytest.mark.asyncio
async def test_upload_pdf(client: AsyncClient, admin_headers: dict, db_session: AsyncSession):
    """Test successful PDF upload and automatic indexing by admin."""
    file_content = b"%PDF-1.4 dummy pdf content"
    files = {"file": ("test_doc.pdf", file_content, "application/pdf")}
    data = {"title": "Test PDF Guide"}

    with mock.patch("app.services.ai_search_service.extract_text_from_file_path", return_value="Mocked PDF document text content"):
        response = await client.post("/api/v1/knowledge/upload", files=files, data=data, headers=admin_headers)
        assert response.status_code == 200
        res_data = response.json()
        assert res_data["success"] is True
        assert res_data["data"]["title"] == "Test PDF Guide"
        assert res_data["data"]["file_type"] == "pdf"

        # Wait for background task to complete indexing
        doc_id = res_data["data"]["id"]
        from uuid import UUID
        
        db_doc = None
        for _ in range(25):
            await asyncio.sleep(0.5)
            db_session.expire_all()
            stmt = select(KnowledgeDocument).where(KnowledgeDocument.id == UUID(doc_id))
            result = await db_session.execute(stmt)
            db_doc = result.scalar_one_or_none()
            if db_doc and db_doc.indexing_status in ("active", "error"):
                break

        assert db_doc is not None
        assert db_doc.indexing_status == "active"
        assert db_doc.chunks_count > 0
        assert db_doc.indexed_at is not None

        # Cleanup uploaded file
        if os.path.exists(db_doc.file_path):
            os.remove(db_doc.file_path)


@pytest.mark.asyncio
async def test_upload_docx(client: AsyncClient, admin_headers: dict, db_session: AsyncSession):
    """Test successful DOCX upload and indexing."""
    file_content = b"dummy docx content"
    files = {"file": ("manual.docx", file_content, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
    data = {"title": "Company Manual"}

    with mock.patch("app.services.ai_search_service.extract_text_from_file_path", return_value="Mocked Word document text content"):
        response = await client.post("/api/v1/knowledge/upload", files=files, data=data, headers=admin_headers)
        assert response.status_code == 200
        res_data = response.json()
        assert res_data["success"] is True

        # Wait for background task to complete indexing
        doc_id = res_data["data"]["id"]
        from uuid import UUID
        
        db_doc = None
        for _ in range(25):
            await asyncio.sleep(0.5)
            db_session.expire_all()
            stmt = select(KnowledgeDocument).where(KnowledgeDocument.id == UUID(doc_id))
            result = await db_session.execute(stmt)
            db_doc = result.scalar_one_or_none()
            if db_doc and db_doc.indexing_status in ("active", "error"):
                break

        assert db_doc is not None
        assert db_doc.indexing_status == "active"
        assert db_doc.chunks_count > 0
        if db_doc and os.path.exists(db_doc.file_path):
            os.remove(db_doc.file_path)


@pytest.mark.asyncio
async def test_upload_txt(client: AsyncClient, admin_headers: dict, db_session: AsyncSession):
    """Test successful TXT upload and indexing."""
    file_content = b"This is a dummy plain text document content for testing auto indexing."
    files = {"file": ("notes.txt", file_content, "text/plain")}
    data = {"title": "Raw Notes"}

    response = await client.post("/api/v1/knowledge/upload", files=files, data=data, headers=admin_headers)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["success"] is True

    # Wait for background task to complete indexing
    doc_id = res_data["data"]["id"]
    from uuid import UUID
    
    db_doc = None
    for _ in range(25):
        await asyncio.sleep(0.5)
        db_session.expire_all()
        stmt = select(KnowledgeDocument).where(KnowledgeDocument.id == UUID(doc_id))
        result = await db_session.execute(stmt)
        db_doc = result.scalar_one_or_none()
        if db_doc and db_doc.indexing_status in ("active", "error"):
            break

    assert db_doc is not None
    assert db_doc.indexing_status == "active"
    assert db_doc.chunks_count > 0
    if db_doc and os.path.exists(db_doc.file_path):
        os.remove(db_doc.file_path)


@pytest.mark.asyncio
async def test_upload_markdown(client: AsyncClient, admin_headers: dict, db_session: AsyncSession):
    """Test successful Markdown upload and indexing."""
    file_content = b"# Header\nThis is a dummy md document content for testing auto indexing."
    files = {"file": ("readme.md", file_content, "text/markdown")}
    data = {"title": "Read Me First"}

    response = await client.post("/api/v1/knowledge/upload", files=files, data=data, headers=admin_headers)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["success"] is True

    # Wait for background task to complete indexing
    doc_id = res_data["data"]["id"]
    from uuid import UUID
    
    db_doc = None
    for _ in range(25):
        await asyncio.sleep(0.5)
        db_session.expire_all()
        stmt = select(KnowledgeDocument).where(KnowledgeDocument.id == UUID(doc_id))
        result = await db_session.execute(stmt)
        db_doc = result.scalar_one_or_none()
        if db_doc and db_doc.indexing_status in ("active", "error"):
            break

    assert db_doc is not None
    assert db_doc.indexing_status == "active"
    assert db_doc.chunks_count > 0
    if db_doc and os.path.exists(db_doc.file_path):
        os.remove(db_doc.file_path)


@pytest.mark.asyncio
async def test_upload_invalid_type(client: AsyncClient, admin_headers: dict):
    """Test rejection of unsupported file extensions."""
    file_content = b"dummy exe content"
    files = {"file": ("virus.exe", file_content, "application/octet-stream")}
    data = {"title": "Executable"}

    response = await client.post("/api/v1/knowledge/upload", files=files, data=data, headers=admin_headers)
    assert response.status_code == 400
    assert "Invalid file type" in response.json()["detail"]


@pytest.mark.asyncio
async def test_upload_too_large(client: AsyncClient, admin_headers: dict):
    """Test rejection of files exceeding 20 MB."""
    # Create 20 MB + 1 byte dummy content
    large_content = b"0" * (20 * 1024 * 1024 + 1)
    files = {"file": ("large_doc.pdf", large_content, "application/pdf")}
    data = {"title": "Huge Document"}

    response = await client.post("/api/v1/knowledge/upload", files=files, data=data, headers=admin_headers)
    assert response.status_code == 400
    assert "exceeds the maximum limit" in response.json()["detail"]


@pytest.mark.asyncio
async def test_list_documents(client: AsyncClient, admin_headers: dict, db_session: AsyncSession, test_admin: User):
    """Test listing uploaded documents."""
    # Seed a doc first
    doc = KnowledgeDocument(
        title="Seed Doc",
        filename="seed.pdf",
        file_path="./uploads/dummy_seed.pdf",
        file_type="pdf",
        file_size=100,
        uploaded_by=test_admin.id,
        indexing_status="active",
        chunks_count=1
    )
    db_session.add(doc)
    await db_session.commit()

    response = await client.get("/api/v1/knowledge", headers=admin_headers)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["success"] is True
    assert len(res_data["data"]) >= 1
    assert any(d["title"] == "Seed Doc" for d in res_data["data"])


@pytest.mark.asyncio
async def test_get_document_detail(client: AsyncClient, admin_headers: dict, db_session: AsyncSession, test_admin: User):
    """Test getting single document detail by ID."""
    doc = KnowledgeDocument(
        title="Detail Doc",
        filename="detail.pdf",
        file_path="./uploads/dummy_detail.pdf",
        file_type="pdf",
        file_size=100,
        uploaded_by=test_admin.id,
        indexing_status="active",
        chunks_count=2
    )
    db_session.add(doc)
    await db_session.commit()
    await db_session.refresh(doc)

    response = await client.get(f"/api/v1/knowledge/{doc.id}", headers=admin_headers)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["success"] is True
    assert res_data["data"]["title"] == "Detail Doc"
    assert res_data["data"]["indexing_status"] == "active"
    assert res_data["data"]["chunks_count"] == 2


@pytest.mark.asyncio
async def test_delete_document(client: AsyncClient, admin_headers: dict, db_session: AsyncSession, test_admin: User):
    """Test deleting a document."""
    dummy_path = "./uploads/test_delete.pdf"
    os.makedirs("./uploads", exist_ok=True)
    with open(dummy_path, "wb") as f:
        f.write(b"content")

    doc = KnowledgeDocument(
        title="To Delete",
        filename="delete.pdf",
        file_path=dummy_path,
        file_type="pdf",
        file_size=7,
        uploaded_by=test_admin.id,
        indexing_status="active",
        chunks_count=1
    )
    db_session.add(doc)
    await db_session.commit()
    await db_session.refresh(doc)

    response = await client.delete(f"/api/v1/knowledge/{doc.id}", headers=admin_headers)
    assert response.status_code == 200
    assert response.json()["success"] is True

    # Verify physical file is gone
    assert not os.path.exists(dummy_path)

    # Verify DB record is gone
    stmt = select(KnowledgeDocument).where(KnowledgeDocument.id == doc.id)
    result = await db_session.execute(stmt)
    assert result.scalar_one_or_none() is None


@pytest.mark.asyncio
async def test_unauthorized_access(client: AsyncClient):
    """Test that unauthenticated users are blocked from routes."""
    files = {"file": ("test.pdf", b"content", "application/pdf")}
    headers = {"Authorization": "Bearer invalid_token_here"}
    response = await client.post("/api/v1/knowledge/upload", files=files, data={"title": "Test"}, headers=headers)
    assert response.status_code == 401

    response = await client.get("/api/v1/knowledge", headers=headers)
    assert response.status_code == 401
