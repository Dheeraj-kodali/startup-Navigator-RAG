"""
Seeding script to populate the Startup Navigator database with initial categories,
sample articles, admin accounts, resources, and bookmark/progress templates.
"""

import asyncio
from datetime import datetime, timezone
import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import AsyncSessionLocal
from app.core.security import hash_password
from app.models import (
    User,
    UserRole,
    Category,
    Article,
    ArticleVersion,
    ArticleStatus,
    Resource,
    ResourceType,
)
from app.logging_config import setup_logging, get_logger

setup_logging()
logger = get_logger(__name__)

# --- Raw Data Definitions ---

CATEGORIES_DATA = [
    {
        "name": "Company Registration",
        "slug": "company-registration",
        "description": "How to register your company, choose the right legal structure, and get official licenses.",
        "icon": "building",
        "color_hex": "#6C5CE7",
        "sort_order": 1,
    },
    {
        "name": "Funding",
        "slug": "funding",
        "description": "Understanding venture capital, angel investment, debt, and crowdfunding.",
        "icon": "banknote",
        "color_hex": "#00B894",
        "sort_order": 2,
    },
    {
        "name": "Legal Compliance",
        "slug": "legal-compliance",
        "description": "Keep your company compliant with labor laws, agreements, and standard requirements.",
        "icon": "scale",
        "color_hex": "#0984E3",
        "sort_order": 3,
    },
    {
        "name": "Hiring",
        "slug": "hiring",
        "description": "Strategies for hiring your first employees, compensation, and onboarding processes.",
        "icon": "users",
        "color_hex": "#E17055",
        "sort_order": 4,
    },
    {
        "name": "Branding",
        "slug": "branding",
        "description": "Build a unique brand voice, design system, identity, and style guidelines.",
        "icon": "award",
        "color_hex": "#FD79A8",
        "sort_order": 5,
    },
    {
        "name": "Marketing",
        "slug": "marketing",
        "description": "SEO, content marketing, paid acquisition channels, and social media.",
        "icon": "megaphone",
        "color_hex": "#E84393",
        "sort_order": 6,
    },
    {
        "name": "Taxation",
        "slug": "taxation",
        "description": "Guide to corporate taxes, payroll taxes, deductions, and tax compliance.",
        "icon": "percent",
        "color_hex": "#D63031",
        "sort_order": 7,
    },
    {
        "name": "Fundraising",
        "slug": "fundraising",
        "description": "Create a pitch deck, find investors, handle term sheets, and close deals.",
        "icon": "trending-up",
        "color_hex": "#27AE60",
        "sort_order": 8,
    },
    {
        "name": "AI Tools",
        "slug": "ai-tools",
        "description": "Leverage artificial intelligence to automate operations and boost productivity.",
        "icon": "cpu",
        "color_hex": "#2980B9",
        "sort_order": 9,
    },
    {
        "name": "Business Growth",
        "slug": "business-growth",
        "description": "Scale sales, establish key partnerships, and measure product-market fit metrics.",
        "icon": "rocket",
        "color_hex": "#8E44AD",
        "sort_order": 10,
    },
]

ARTICLES_DATA = [
    {
        "category_slug": "company-registration",
        "title": "Choosing the Right Business Structure: LLC vs. C-Corp",
        "excerpt": "A complete guide comparing LLCs and C-Corps to help you choose the best structure for your startup.",
        "content_markdown": """# Choosing the Right Business Structure: LLC vs. C-Corp

When starting a business, one of the first major decisions you will make is choosing its legal structure. This choice affects everything from daily operations to taxes and the ability to raise money.

## LLC (Limited Liability Company)
An LLC is a flexible structure that combines the limited liability of a corporation with the pass-through taxation of a partnership or sole proprietorship.

*   **Pros:** Easy to manage, pass-through taxation (no double taxation), flexible management structures.
*   **Cons:** Harder to issue equity/stock options, not suitable for high-growth startups looking to raise venture capital.

## C-Corp (C Corporation)
A C-Corp is a standard legal entity type that is entirely separate from its owners.

*   **Pros:** Highly preferred by VC investors, easy to issue stock options, unlimited scaling capability.
*   **Cons:** Double taxation (corporate and individual level), high maintenance and reporting requirements.

## Which should you choose?
If you are planning to bootstrap a lifestyle business, an **LLC** is highly recommended. However, if your plan is to raise VC funding and scale globally, a **C-Corp** is the absolute standard.
""",
        "tags": ["legal", "incorporation", "c-corp", "llc"],
        "is_featured": True,
    },
    {
        "category_slug": "funding",
        "title": "Understanding Safe Agreements: YC SAFE Explained",
        "excerpt": "Learn how Simple Agreements for Future Equity (SAFE) work and why they are standard for early-stage funding.",
        "content_markdown": """# Understanding YC SAFE Agreements

The Simple Agreement for Future Equity (SAFE) was created by Y Combinator in 2013. It has since become the industry standard for early-stage funding.

## What is a SAFE?
A SAFE is not debt. It is an agreement where an investor provides capital today in exchange for the right to receive stock in the future during a priced round.

## Key Terms
1.  **Valuation Cap:** The maximum valuation at which your SAFE converts into equity.
2.  **Discount Rate:** A percentage discount the investor gets compared to priced round investors.
3.  **Pre-Money vs. Post-Money:** Post-Money SAFEs are now standard, giving clearer visibility into ownership dilution.

Use SAFEs to move quickly without establishing complex valuations early on.
""",
        "tags": ["funding", "safe", "y-combinator", "seed-round"],
        "is_featured": True,
    },
]

RESOURCES_DATA = [
    {
        "category_slug": "company-registration",
        "title": "Stripe Atlas",
        "description": "Easily incorporate a US Delaware C-Corp from anywhere in the world.",
        "url": "https://stripe.com/atlas",
        "resource_type": "tool",
        "icon": "globe",
        "is_featured": True,
    },
    {
        "category_slug": "funding",
        "title": "YC Standard SAFE Template",
        "description": "Standard Safe template files from Y Combinator's website.",
        "url": "https://www.ycombinator.com/documents",
        "resource_type": "template",
        "icon": "file-text",
        "is_featured": True,
    },
]

async def seed_database():
    async with AsyncSessionLocal() as session:
        try:
            logger.info("Starting database seeding...")

            # 1. Seed Admin Users
            logger.info("Seeding users...")
            admin_email = "admin@startupnavigator.com"
            user_email = "founder@thirdeye.io"

            # Check if admin exists
            admin_query = await session.execute(select(User).where(User.email == admin_email))
            admin = admin_query.scalar_one_or_none()
            if not admin:
                admin = User(
                    email=admin_email,
                    password_hash=hash_password("SuperSecretAdminPassword123!"),
                    name="Global Admin",
                    role=UserRole.SUPER_ADMIN,
                    email_verified=True,
                )
                session.add(admin)
                await session.flush()

            # Check if test founder user exists
            user_query = await session.execute(select(User).where(User.email == user_email))
            user = user_query.scalar_one_or_none()
            if not user:
                user = User(
                    email=user_email,
                    password_hash=hash_password("FounderPassword123!"),
                    name="Erlich Bachman",
                    role=UserRole.USER,
                    email_verified=True,
                )
                session.add(user)
                await session.flush()

            # 2. Seed Categories
            logger.info("Seeding categories...")
            category_map = {}
            for cat_info in CATEGORIES_DATA:
                cat_query = await session.execute(
                    select(Category).where(Category.slug == cat_info["slug"])
                )
                db_cat = cat_query.scalar_one_or_none()
                if not db_cat:
                    db_cat = Category(**cat_info)
                    session.add(db_cat)
                    await session.flush()
                category_map[cat_info["slug"]] = db_cat.id

            # 3. Seed Articles
            logger.info("Seeding articles...")
            for art_info in ARTICLES_DATA:
                slug = art_info.pop("category_slug")
                cat_id = category_map.get(slug)
                if not cat_id:
                    continue
                
                art_query = await session.execute(
                    select(Article).where(Article.slug == slugify_title(art_info["title"]))
                )
                db_art = art_query.scalar_one_or_none()
                if not db_art:
                    db_art = Article(
                        category_id=cat_id,
                        author_id=admin.id,
                        slug=slugify_title(art_info["title"]),
                        status=ArticleStatus.published,
                        published_at=datetime.now(timezone.utc),
                        content_html=f"<p>{art_info['excerpt']}</p>", # simple mock html conversion
                        **art_info
                    )
                    session.add(db_art)
                    await session.flush()

                    # Add version
                    version = ArticleVersion(
                        article_id=db_art.id,
                        edited_by=admin.id,
                        version_number=1,
                        content_markdown=db_art.content_markdown,
                        change_summary="Initial publication",
                    )
                    session.add(version)
                    await session.flush()

            # 4. Seed Resources
            logger.info("Seeding resources...")
            for res_info in RESOURCES_DATA:
                slug = res_info.pop("category_slug")
                cat_id = category_map.get(slug)
                if not cat_id:
                    continue

                res_query = await session.execute(
                    select(Resource).where(Resource.title == res_info["title"])
                )
                db_res = res_query.scalar_one_or_none()
                if not db_res:
                    resource_type_val = ResourceType(res_info.pop("resource_type"))
                    db_res = Resource(
                        category_id=cat_id,
                        resource_type=resource_type_val,
                        **res_info
                    )
                    session.add(db_res)
                    await session.flush()

            await session.commit()
            logger.info("Database seeding successfully completed!")
        except Exception as e:
            await session.rollback()
            logger.error(f"Seeding failed: {str(e)}")
            raise e

def slugify_title(title: str) -> str:
    import re
    return re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')

if __name__ == "__main__":
    asyncio.run(seed_database())
