"""
Resource service — CRUD for tools, templates, guides per category.
"""

from __future__ import annotations

from typing import List
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.exceptions import ResourceNotFoundException
from app.logging_config import get_logger
from app.models.resource import Resource, ResourceType

logger = get_logger(__name__)


class ResourceService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_resources(
        self,
        category_id: UUID | None = None,
        resource_type: str | None = None,
        page: int = 1,
        page_size: int = 20,
    ):
        count_stmt = select(func.count()).select_from(Resource)
        query = select(Resource)

        if category_id:
            query = query.where(Resource.category_id == category_id)
            count_stmt = count_stmt.where(Resource.category_id == category_id)
        if resource_type:
            query = query.where(Resource.resource_type == ResourceType(resource_type))
            count_stmt = count_stmt.where(Resource.resource_type == ResourceType(resource_type))

        total = (await self.db.execute(count_stmt)).scalar() or 0
        offset = (page - 1) * page_size
        query = query.order_by(Resource.sort_order.asc(), Resource.created_at.desc())
        query = query.offset(offset).limit(page_size)

        result = await self.db.execute(query)
        resources = result.scalars().all()
        return resources, total

    async def get_resource_by_id(self, resource_id: UUID) -> Resource:
        stmt = select(Resource).where(Resource.id == resource_id)
        result = await self.db.execute(stmt)
        resource = result.scalar_one_or_none()
        if not resource:
            raise ResourceNotFoundException()
        return resource

    async def create_resource(self, **kwargs) -> Resource:
        resource_type_str = kwargs.pop("resource_type", "link")
        resource = Resource(
            resource_type=ResourceType(resource_type_str),
            **kwargs,
        )
        self.db.add(resource)
        await self.db.flush()
        await self.db.refresh(resource)
        logger.info("resource_created", resource_id=str(resource.id))
        # Auto-embed in vector store
        try:
            from app.services.ai_search_service import AISearchService
            await AISearchService(self.db).index_resource(resource)
        except Exception as e:
            logger.error("resource_auto_embed_failed", error=str(e))
        return resource

    async def update_resource(self, resource_id: UUID, **kwargs) -> Resource:
        resource = await self.get_resource_by_id(resource_id)

        for key, value in kwargs.items():
            if value is not None:
                if key == "resource_type":
                    setattr(resource, key, ResourceType(value))
                elif hasattr(resource, key):
                    setattr(resource, key, value)

        await self.db.flush()
        await self.db.refresh(resource)
        logger.info("resource_updated", resource_id=str(resource_id))
        # Auto-embed updates
        try:
            from app.services.ai_search_service import AISearchService
            await AISearchService(self.db).index_resource(resource)
        except Exception as e:
            logger.error("resource_update_embed_failed", error=str(e))
        return resource

    async def delete_resource(self, resource_id: UUID) -> None:
        resource = await self.get_resource_by_id(resource_id)
        await self.db.delete(resource)
        await self.db.flush()
        logger.info("resource_deleted", resource_id=str(resource_id))
        # Delete from vector store
        try:
            from app.services.ai_search_service import AISearchService
            await AISearchService(self.db).delete_document(resource_id)
        except Exception as e:
            logger.error("resource_delete_embed_failed", error=str(e))
