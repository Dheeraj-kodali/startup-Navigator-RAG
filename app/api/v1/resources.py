"""
Resource API endpoints — public listing by category.
"""

from __future__ import annotations

import math
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.common import ApiResponse, PaginatedResponse, PaginationMeta
from app.schemas.resource import ResourceResponse
from app.services.resource_service import ResourceService

router = APIRouter(prefix="/resources", tags=["Resources"])


@router.get("", response_model=PaginatedResponse[ResourceResponse])
async def list_resources(
    category_id: UUID | None = None,
    resource_type: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """List resources with optional category and type filters."""
    service = ResourceService(db)
    resources, total = await service.list_resources(
        category_id=category_id,
        resource_type=resource_type,
        page=page,
        page_size=page_size,
    )
    return PaginatedResponse(
        data=[ResourceResponse.model_validate(r) for r in resources],
        pagination=PaginationMeta(
            page=page,
            page_size=page_size,
            total_items=total,
            total_pages=math.ceil(total / page_size) if total > 0 else 0,
            has_next=page * page_size < total,
            has_previous=page > 1,
        ),
    )


@router.get("/{resource_id}", response_model=ApiResponse[ResourceResponse])
async def get_resource(resource_id: UUID, db: AsyncSession = Depends(get_db)):
    """Get a single resource by ID."""
    service = ResourceService(db)
    resource = await service.get_resource_by_id(resource_id)
    return ApiResponse(data=ResourceResponse.model_validate(resource))
