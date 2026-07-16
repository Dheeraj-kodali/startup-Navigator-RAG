"""Initial schema creation containing Users, Categories, Articles, Article Versions, Resources, Search History, Bookmarks, Reading Progress, Feedback, Admin Audit Logs, and Dashboard Stats.

Revision ID: 0001_initial_schema
Revises: None
Create Date: 2026-07-15 20:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '0001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── 1. Create Enums ──
    # Enums are created inline as VARCHAR in SQLite
    # ── 2. Table: users ──
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('avatar_url', sa.String(length=500), nullable=True),
        sa.Column('role', sa.Enum('user', 'admin', 'super_admin', name='user_role'), server_default='user', nullable=False),
        sa.Column('auth_provider', sa.Enum('credentials', 'google', 'github', name='auth_provider'), server_default='credentials', nullable=False),
        sa.Column('provider_id', sa.String(length=255), nullable=True),
        sa.Column('email_verified', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('preferences', postgresql.JSONB(astext_type=sa.Text()), server_default='{}', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('last_login_at', sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index('ix_users_email', 'users', ['email'], unique=True)
    op.create_index('ix_users_role', 'users', ['role'])
    op.create_index('ix_users_is_active', 'users', ['is_active'])
    op.create_index('ix_users_active_role', 'users', ['is_active', 'role'])
    op.create_index('ix_users_created_at', 'users', ['created_at'])
    op.create_index('ix_users_email_lower', 'users', [sa.text('lower(email)')], unique=True)
    op.create_index('ix_users_provider_lookup', 'users', ['auth_provider', 'provider_id'], unique=True, postgresql_where=sa.text("provider_id IS NOT NULL"))

    # ── 3. Table: categories ──
    op.create_table(
        'categories',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('slug', sa.String(length=100), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('icon', sa.String(length=100), nullable=True),
        sa.Column('color_hex', sa.String(length=7), nullable=True),
        sa.Column('sort_order', sa.Integer(), server_default='0', nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index('ix_categories_slug', 'categories', ['slug'], unique=True)
    op.create_index('ix_categories_is_active', 'categories', ['is_active'])
    op.create_index('ix_categories_active_sort', 'categories', ['is_active', 'sort_order'])

    # ── 4. Table: articles ──
    op.create_table(
        'articles',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('category_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('categories.id', ondelete='SET NULL'), nullable=True),
        sa.Column('author_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('slug', sa.String(length=300), nullable=False),
        sa.Column('title', sa.String(length=500), nullable=False),
        sa.Column('excerpt', sa.Text(), nullable=True),
        sa.Column('content_markdown', sa.Text(), nullable=False),
        sa.Column('content_html', sa.Text(), nullable=True),
        sa.Column('status', sa.Enum('draft', 'review', 'published', 'archived', name='article_status'), server_default='draft', nullable=False),
        sa.Column('version', sa.Integer(), server_default='1', nullable=False),
        sa.Column('featured_image_url', sa.String(length=500), nullable=True),
        sa.Column('read_time_minutes', sa.Integer(), server_default='1', nullable=False),
        sa.Column('view_count', sa.Integer(), server_default='0', nullable=False),
        sa.Column('seo_metadata', postgresql.JSONB(astext_type=sa.Text()), server_default='{}', nullable=False),
        sa.Column('tags', postgresql.JSONB(astext_type=sa.Text()), server_default='[]', nullable=False),
        sa.Column('is_featured', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('published_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index('ix_articles_slug', 'articles', ['slug'], unique=True)
    op.create_index('ix_articles_status', 'articles', ['status'])
    op.create_index('ix_articles_is_featured', 'articles', ['is_featured'])
    op.create_index('ix_articles_category_id', 'articles', ['category_id'])
    op.create_index('ix_articles_author_id', 'articles', ['author_id'])
    op.create_index('ix_articles_category_status', 'articles', ['category_id', 'status'])
    op.create_index('ix_articles_status_published', 'articles', ['status', 'published_at'])
    op.create_index('ix_articles_author_status', 'articles', ['author_id', 'status'])
    op.create_index('ix_articles_created_at', 'articles', ['created_at'])
    op.create_index('ix_articles_view_count_desc', 'articles', [sa.text('view_count DESC')])
    op.create_index('ix_articles_featured_published', 'articles', ['is_featured', 'published_at'], postgresql_where=sa.text("is_featured IS TRUE"))

    # ── 5. Table: article_versions ──
    op.create_table(
        'article_versions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('article_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('articles.id', ondelete='CASCADE'), nullable=False),
        sa.Column('edited_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('version_number', sa.Integer(), nullable=False),
        sa.Column('content_markdown', sa.Text(), nullable=False),
        sa.Column('change_summary', sa.String(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index('ix_article_versions_article_id', 'article_versions', ['article_id'])
    op.create_index('ix_article_versions_edited_by', 'article_versions', ['edited_by'])
    op.create_index('ix_article_versions_article_version', 'article_versions', ['article_id', 'version_number'], unique=True)

    # ── 6. Table: resources ──
    op.create_table(
        'resources',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('category_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('categories.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(length=500), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('url', sa.String(length=1000), nullable=True),
        sa.Column('resource_type', sa.Enum('tool', 'template', 'guide', 'video', 'link', 'document', name='resource_type'), server_default='link', nullable=False),
        sa.Column('icon', sa.String(length=100), nullable=True),
        sa.Column('is_featured', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('sort_order', sa.Integer(), server_default='0', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index('ix_resources_category_id', 'resources', ['category_id'])
    op.create_index('ix_resources_resource_type', 'resources', ['resource_type'])
    op.create_index('ix_resources_category_type', 'resources', ['category_id', 'resource_type'])
    op.create_index('ix_resources_category_sort', 'resources', ['category_id', 'sort_order'])
    op.create_index('ix_resources_featured', 'resources', ['is_featured'], postgresql_where=sa.text("is_featured IS TRUE"))

    # ── 7. Table: search_history ──
    op.create_table(
        'search_history',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('query', sa.String(length=1000), nullable=False),
        sa.Column('results_count', sa.Integer(), server_default='0', nullable=False),
        sa.Column('search_type', sa.String(length=50), server_default='fulltext', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index('ix_search_history_user_id', 'search_history', ['user_id'])
    op.create_index('ix_search_history_user_created', 'search_history', ['user_id', 'created_at'])
    op.create_index('ix_search_history_type_created', 'search_history', ['search_type', 'created_at'])

    # ── 8. Table: bookmarks ──
    op.create_table(
        'bookmarks',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('article_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('articles.id', ondelete='CASCADE'), nullable=False),
        sa.Column('note', sa.String(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index('ix_bookmarks_user_id', 'bookmarks', ['user_id'])
    op.create_index('ix_bookmarks_article_id', 'bookmarks', ['article_id'])
    op.create_index('ix_bookmarks_user_created', 'bookmarks', ['user_id', 'created_at'])
    op.create_unique_constraint('uq_user_article_bookmark', 'bookmarks', ['user_id', 'article_id'])

    # ── 9. Table: reading_progress ──
    op.create_table(
        'reading_progress',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('article_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('articles.id', ondelete='CASCADE'), nullable=False),
        sa.Column('progress_percent', sa.Integer(), server_default='0', nullable=False),
        sa.Column('is_completed', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('last_read_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index('ix_reading_progress_user_id', 'reading_progress', ['user_id'])
    op.create_index('ix_reading_progress_article_id', 'reading_progress', ['article_id'])
    op.create_index('ix_reading_progress_user_completed', 'reading_progress', ['user_id', 'is_completed'])
    op.create_index('ix_reading_progress_user_last_read', 'reading_progress', ['user_id', 'last_read_at'])
    op.create_unique_constraint('uq_user_article_progress', 'reading_progress', ['user_id', 'article_id'])

    # ── 10. Table: feedback ──
    op.create_table(
        'feedback',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('article_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('articles.id', ondelete='SET NULL'), nullable=True),
        sa.Column('type', sa.Enum('article_rating', 'bug_report', 'feature_request', 'general', name='feedback_type'), server_default='general', nullable=False),
        sa.Column('rating', sa.Integer(), nullable=True),
        sa.Column('comment', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index('ix_feedback_user_id', 'feedback', ['user_id'])
    op.create_index('ix_feedback_article_id', 'feedback', ['article_id'])
    op.create_index('ix_feedback_user_type', 'feedback', ['user_id', 'type'])
    op.create_index('ix_feedback_type_created', 'feedback', ['type', 'created_at'])
    op.create_index('ix_feedback_article', 'feedback', ['article_id'], postgresql_where=sa.text("article_id IS NOT NULL"))

    # ── 11. Table: admin_audit_logs ──
    op.create_table(
        'admin_audit_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('admin_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('action', sa.Enum('create', 'update', 'delete', 'status_change', 'role_change', 'ban', 'unban', 'revert', 'reindex', name='audit_action'), nullable=False),
        sa.Column('entity_type', sa.String(length=100), nullable=False),
        sa.Column('entity_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('before_data', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('after_data', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('user_agent', sa.String(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index('ix_admin_audit_logs_admin_id', 'admin_audit_logs', ['admin_id'])
    op.create_index('ix_audit_admin_created', 'admin_audit_logs', ['admin_id', 'created_at'])
    op.create_index('ix_audit_entity', 'admin_audit_logs', ['entity_type', 'entity_id'])
    op.create_index('ix_audit_action_created', 'admin_audit_logs', ['action', 'created_at'])
    op.create_index('ix_admin_audit_logs_created_at', 'admin_audit_logs', ['created_at'])

    # ── 12. Table: dashboard_stats ──
    op.create_table(
        'dashboard_stats',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('snapshot_date', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('total_users', sa.Integer(), server_default='0', nullable=False),
        sa.Column('total_articles', sa.Integer(), server_default='0', nullable=False),
        sa.Column('total_categories', sa.Integer(), server_default='0', nullable=False),
        sa.Column('total_resources', sa.Integer(), server_default='0', nullable=False),
        sa.Column('total_bookmarks', sa.Integer(), server_default='0', nullable=False),
        sa.Column('total_searches', sa.Integer(), server_default='0', nullable=False),
        sa.Column('detailed_metrics', postgresql.JSONB(astext_type=sa.Text()), server_default='{}', nullable=False),
    )
    op.create_index('ix_dashboard_stats_snapshot_date', 'dashboard_stats', ['snapshot_date'], unique=True)
    op.create_index('ix_dashboard_stats_snapshot_date_desc', 'dashboard_stats', [sa.text('snapshot_date DESC')])


def downgrade() -> None:
    # Drop Tables in Reverse Order
    op.drop_table('dashboard_stats')
    op.drop_table('admin_audit_logs')
    op.drop_table('feedback')
    op.drop_table('reading_progress')
    op.drop_table('bookmarks')
    op.drop_table('search_history')
    op.drop_table('resources')
    op.drop_table('article_versions')
    op.drop_table('articles')
    op.drop_table('categories')
    op.drop_table('users')

    # Drop Enums
    # No ENUM types to drop in SQLite
