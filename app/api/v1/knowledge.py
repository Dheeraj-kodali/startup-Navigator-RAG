"""
Knowledge Document API router — handles file uploading, listing, details and deletions.
"""

from __future__ import annotations

import os
import shutil
import uuid
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.database import get_db
from app.models.user import User
from app.models.knowledge_document import KnowledgeDocument
from app.schemas.common import ApiResponse
from app.schemas.knowledge import KnowledgeDocumentResponse, KnowledgeStatsResponse
from fastapi.responses import FileResponse
from sqlalchemy import func

router = APIRouter(prefix="/knowledge", tags=["Knowledge Base"])

UPLOAD_DIR = "./uploads"
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt", ".md"}

# Ensure upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload", response_model=ApiResponse[KnowledgeDocumentResponse])
async def upload_document(
    title: str = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Upload a document (PDF, DOCX, TXT, MD) to the knowledge base.
    Accessible to authenticated users.
    """
    # 1. Validate file extension
    original_filename = file.filename or "uploaded_file"
    _, ext = os.path.splitext(original_filename.lower())
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Only {', '.join(sorted(ALLOWED_EXTENSIONS))} files are allowed."
        )

    # Validate file size upfront if possible
    MAX_FILE_SIZE = 20 * 1024 * 1024
    if file.size and file.size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File size exceeds the maximum limit of 20 MB."
        )

    # 2. Create a unique filename to prevent collisions on disk
    unique_filename = f"{uuid.uuid4()}{ext}"
    dest_path = os.path.join(UPLOAD_DIR, unique_filename)

    # 3. Save physical file to disk
    try:
        with open(dest_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save file to server storage: {str(e)}"
        )

    # Calculate file size and validate
    file_size = os.path.getsize(dest_path)
    if file_size > MAX_FILE_SIZE:
        if os.path.exists(dest_path):
            os.remove(dest_path)
        raise HTTPException(
            status_code=400,
            detail="File size exceeds the maximum limit of 20 MB."
        )

    # 4. Save metadata record to database
    try:
        doc = KnowledgeDocument(
            title=title.strip() or original_filename,
            filename=original_filename,
            file_path=dest_path,
            file_type=ext.lstrip("."),
            file_size=file_size,
            uploaded_by=current_user.id,
            indexing_status="processing"
        )
        db.add(doc)
        await db.flush()
        await db.commit()
    except Exception as e:
        # Cleanup file if DB insert fails
        if os.path.exists(dest_path):
            os.remove(dest_path)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save document metadata: {str(e)}"
        )

    # Trigger automatic text extraction, chunking, and embedding generation
    from app.services.ai_search_service import AISearchService
    ai_service = AISearchService(db)
    await ai_service.index_document(doc.id)

    return ApiResponse(
        message="Document uploaded successfully",
        data=KnowledgeDocumentResponse.model_validate(doc)
    )




@router.get("", response_model=ApiResponse[List[KnowledgeDocumentResponse]])
async def list_documents(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    List documents uploaded by the current user.
    """
    stmt = select(KnowledgeDocument).where(KnowledgeDocument.uploaded_by == current_user.id).order_by(KnowledgeDocument.uploaded_at.desc())
    result = await db.execute(stmt)
    docs = result.scalars().all()
    return ApiResponse(
        data=[KnowledgeDocumentResponse.model_validate(d) for d in docs]
    )


@router.get("/stats", response_model=ApiResponse[KnowledgeStatsResponse])
async def get_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get aggregated statistics for the current user's documents.
    """
    stmt = select(KnowledgeDocument).where(KnowledgeDocument.uploaded_by == current_user.id)
    result = await db.execute(stmt)
    docs = result.scalars().all()
    
    total = len(docs)
    total_chunks = sum(d.chunks_count for d in docs)
    total_storage = sum(d.file_size for d in docs)
    
    indexed = sum(1 for d in docs if d.indexing_status == "active")
    pending = sum(1 for d in docs if d.indexing_status == "processing")
    failed = sum(1 for d in docs if d.indexing_status == "error")
    
    stats = KnowledgeStatsResponse(
        total_documents=total,
        total_chunks=total_chunks,
        indexed_documents=indexed,
        pending_documents=pending,
        failed_documents=failed,
        total_storage_bytes=total_storage
    )
    return ApiResponse(data=stats)


@router.get("/{doc_id}", response_model=ApiResponse[KnowledgeDocumentResponse])
async def get_document(
    doc_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get a single knowledge document's metadata by ID.
    Verify ownership. Includes a preview_text.
    """
    stmt = select(KnowledgeDocument).where(
        KnowledgeDocument.id == doc_id,
        KnowledgeDocument.uploaded_by == current_user.id
    )
    result = await db.execute(stmt)
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
        
    preview_text = None
    if os.path.exists(doc.file_path):
        try:
            from app.services.knowledge_extraction import extract_text_from_file_path
            full_text = extract_text_from_file_path(doc.file_path, doc.file_type)
            preview_text = full_text[:500] if full_text else ""
        except Exception as e:
            preview_text = "Preview unavailable."
            
    doc_resp = KnowledgeDocumentResponse.model_validate(doc)
    doc_resp.preview_text = preview_text
    
    return ApiResponse(data=doc_resp)

@router.post("/{doc_id}/reindex", response_model=ApiResponse)
async def reindex_document(
    doc_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Rebuild embeddings for a single document.
    """
    stmt = select(KnowledgeDocument).where(
        KnowledgeDocument.id == doc_id,
        KnowledgeDocument.uploaded_by == current_user.id
    )
    result = await db.execute(stmt)
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
        
    from app.services.ai_search_service import AISearchService
    ai_service = AISearchService(db)
    await ai_service.index_document(doc.id)
    
    return ApiResponse(message="Re-indexing started.")


@router.get("/{doc_id}/download")
async def download_document(
    doc_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Download the original file.
    """
    stmt = select(KnowledgeDocument).where(
        KnowledgeDocument.id == doc_id,
        KnowledgeDocument.uploaded_by == current_user.id
    )
    result = await db.execute(stmt)
    doc = result.scalar_one_or_none()
    if not doc or not os.path.exists(doc.file_path):
        raise HTTPException(status_code=404, detail="Document or file not found.")
        
    return FileResponse(path=doc.file_path, filename=doc.filename)


@router.delete("/{doc_id}", response_model=ApiResponse[None])
async def delete_document(
    doc_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Delete a knowledge document record and remove its physical file.
    Verify ownership.
    """
    stmt = select(KnowledgeDocument).where(
        KnowledgeDocument.id == doc_id,
        KnowledgeDocument.uploaded_by == current_user.id
    )
    result = await db.execute(stmt)
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    # Remove physical file from disk if it exists
    if os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except Exception as e:
            # We log the error but still proceed to clear the DB entry to avoid invalid states
            logger.error("file_deletion_failed", path=doc.file_path, error=str(e))

    # Remove record from database
    await db.delete(doc)
    await db.commit()

    # Remove embeddings from vector store
    from app.services.ai_search_service import AISearchService
    ai_service = AISearchService(db)
    await ai_service.delete_document(doc_id)

    return ApiResponse(message="Document deleted successfully")

