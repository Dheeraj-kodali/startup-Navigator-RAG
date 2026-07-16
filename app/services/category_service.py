"""
Category service — CRUD with article/resource counts.
"""

from __future__ import annotations

from typing import List
from uuid import UUID

from slugify import slugify
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.exceptions import CategoryNotFoundException, SlugAlreadyExistsException
from app.logging_config import get_logger
from app.models.article import Article
from app.models.category import Category
from app.models.resource import Resource

logger = get_logger(__name__)


class CategoryService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_categories(self, active_only: bool = True) -> List[dict]:
        query = select(Category)
        if active_only:
            query = query.where(Category.is_active == True)
        query = query.order_by(Category.sort_order.asc(), Category.name.asc())

        result = await self.db.execute(query)
        categories = result.scalars().all()

        enriched = []
        for cat in categories:
            article_count = (
                await self.db.execute(
                    select(func.count()).where(Article.category_id == cat.id)
                )
            ).scalar() or 0
            resource_count = (
                await self.db.execute(
                    select(func.count()).where(Resource.category_id == cat.id)
                )
            ).scalar() or 0

            enriched.append({
                **{c.key: getattr(cat, c.key) for c in cat.__table__.columns},
                "article_count": article_count,
                "resource_count": resource_count,
            })
        return enriched

    async def get_category_by_slug(self, slug: str) -> Category:
        stmt = select(Category).where(Category.slug == slug)
        result = await self.db.execute(stmt)
        category = result.scalar_one_or_none()
        if not category:
            raise CategoryNotFoundException()
        return category

    async def get_category_by_id(self, category_id: UUID) -> Category:
        stmt = select(Category).where(Category.id == category_id)
        result = await self.db.execute(stmt)
        category = result.scalar_one_or_none()
        if not category:
            raise CategoryNotFoundException()
        return category

    async def create_category(self, **kwargs) -> Category:
        slug = kwargs.pop("slug", None) or slugify(kwargs["name"])

        # Check slug uniqueness
        existing = await self.db.execute(select(Category).where(Category.slug == slug))
        if existing.scalar_one_or_none():
            raise SlugAlreadyExistsException()

        category = Category(slug=slug, **kwargs)
        self.db.add(category)
        await self.db.flush()
        await self.db.refresh(category)
        logger.info("category_created", category_id=str(category.id), slug=slug)
        return category

    async def update_category(self, category_id: UUID, **kwargs) -> Category:
        category = await self.get_category_by_id(category_id)

        if "slug" in kwargs and kwargs["slug"] and kwargs["slug"] != category.slug:
            existing = await self.db.execute(
                select(Category).where(Category.slug == kwargs["slug"], Category.id != category_id)
            )
            if existing.scalar_one_or_none():
                raise SlugAlreadyExistsException()

        for key, value in kwargs.items():
            if value is not None and hasattr(category, key):
                setattr(category, key, value)

        await self.db.flush()
        await self.db.refresh(category)
        logger.info("category_updated", category_id=str(category_id))
        return category

    async def delete_category(self, category_id: UUID) -> None:
        category = await self.get_category_by_id(category_id)
        category.is_active = False
        await self.db.flush()
        logger.info("category_deactivated", category_id=str(category_id))
