"""
SQLAlchemy ORM models — re-exported from this package for convenience.

Usage::
    from app.models import User, Article, Category
"""

from app.models.user import User, UserRole, AuthProvider
from app.models.category import Category
from app.models.article import Article, ArticleVersion, ArticleStatus
from app.models.resource import Resource, ResourceType
from app.models.search_history import SearchHistory
from app.models.bookmark import Bookmark, ReadingProgress
from app.models.feedback import Feedback, FeedbackType
from app.models.admin_audit import AdminAuditLog, AuditAction
from app.models.dashboard_stats import DashboardStats
from app.models.knowledge_document import KnowledgeDocument

__all__ = [
    "User",
    "UserRole",
    "AuthProvider",
    "Category",
    "Article",
    "ArticleVersion",
    "ArticleStatus",
    "Resource",
    "ResourceType",
    "SearchHistory",
    "Bookmark",
    "ReadingProgress",
    "Feedback",
    "FeedbackType",
    "AdminAuditLog",
    "AuditAction",
    "DashboardStats",
    "KnowledgeDocument",
]
