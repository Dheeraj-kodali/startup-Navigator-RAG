from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta
from collections import defaultdict
from app.models.search_history import SearchHistory
from app.models.knowledge_document import KnowledgeDocument
from app.models.user import User

class AnalyticsService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_dashboard_metrics(self, time_range: str = "all"):
        # Time filter
        time_filter = None
        now = datetime.utcnow()
        if time_range == "today":
            time_filter = now - timedelta(days=1)
        elif time_range == "7d":
            time_filter = now - timedelta(days=7)
        elif time_range == "30d":
            time_filter = now - timedelta(days=30)

        # Build base queries
        history_query = select(SearchHistory)
        docs_query = select(KnowledgeDocument)
        
        if time_filter:
            history_query = history_query.where(SearchHistory.created_at >= time_filter)
            docs_query = docs_query.where(KnowledgeDocument.uploaded_at >= time_filter)

        # Execute queries
        history_result = await self.db.execute(history_query)
        histories = history_result.scalars().all()
        
        docs_result = await self.db.execute(docs_query)
        docs = docs_result.scalars().all()

        # Metrics aggregation
        total_searches = len(histories)
        kb_searches = sum(1 for h in histories if h.knowledge_source == "Knowledge Base")
        general_searches = sum(1 for h in histories if h.knowledge_source == "General AI Knowledge")
        
        total_docs = len(docs)
        indexed_docs = sum(1 for d in docs if d.indexing_status == "active")
        
        valid_response_times = [h.response_time_ms for h in histories if h.response_time_ms]
        valid_retrieval_times = [h.retrieval_time_ms for h in histories if h.retrieval_time_ms]
        valid_embedding_times = [h.embedding_time_ms for h in histories if h.embedding_time_ms]
        valid_generation_times = [h.generation_time_ms for h in histories if h.generation_time_ms]
        valid_chunks = [h.results_count for h in histories if h.results_count is not None]

        avg_response_time = sum(valid_response_times) // len(valid_response_times) if valid_response_times else 0
        avg_retrieval_time = sum(valid_retrieval_times) // len(valid_retrieval_times) if valid_retrieval_times else 0
        avg_embedding_time = sum(valid_embedding_times) // len(valid_embedding_times) if valid_embedding_times else 0
        avg_generation_time = sum(valid_generation_times) // len(valid_generation_times) if valid_generation_times else 0
        avg_chunks = round(sum(valid_chunks) / len(valid_chunks), 1) if valid_chunks else 0

        # Charts Data
        
        # 1. Searches per Day
        searches_per_day = defaultdict(int)
        for h in histories:
            day_str = h.created_at.strftime("%Y-%m-%d")
            searches_per_day[day_str] += 1
        searches_chart = [{"date": k, "count": v} for k, v in sorted(searches_per_day.items())]

        # 2. Top Topics (Simplified: most frequent queries)
        query_counts = defaultdict(int)
        for h in histories:
            query_counts[h.query] += 1
        top_topics = [{"topic": k, "count": v} for k, v in sorted(query_counts.items(), key=lambda x: x[1], reverse=True)[:10]]

        # 3. Document Types
        doc_types = defaultdict(int)
        for d in docs:
            doc_types[d.file_type or "unknown"] += 1
        doc_types_chart = [{"type": k, "count": v} for k, v in doc_types.items()]

        # Top Documents (Extract from JSON sources)
        doc_stats = defaultdict(lambda: {"count": 0, "similarity_sum": 0})
        for h in histories:
            if h.source_documents:
                for doc_ref in h.source_documents:
                    title = doc_ref.get("title", "Unknown")
                    sim = doc_ref.get("similarity", 0)
                    doc_stats[title]["count"] += 1
                    doc_stats[title]["similarity_sum"] += sim
        
        top_docs_list = []
        for title, stats in doc_stats.items():
            avg_sim = stats["similarity_sum"] // stats["count"] if stats["count"] > 0 else 0
            top_docs_list.append({
                "name": title,
                "times_retrieved": stats["count"],
                "average_similarity": avg_sim
            })
        top_docs_list = sorted(top_docs_list, key=lambda x: x["times_retrieved"], reverse=True)[:10]

        return {
            "metrics": {
                "total_searches": total_searches,
                "kb_searches": kb_searches,
                "general_searches": general_searches,
                "uploaded_documents": total_docs,
                "indexed_documents": indexed_docs,
                "average_response_time": avg_response_time,
                "average_retrieval_time": avg_retrieval_time,
                "average_embedding_time": avg_embedding_time,
                "average_generation_time": avg_generation_time,
                "average_chunks_retrieved": avg_chunks
            },
            "charts": {
                "searches_per_day": searches_chart,
                "top_topics": top_topics,
                "doc_types": doc_types_chart
            },
            "top_documents": top_docs_list
        }

    async def get_recent_activity(self, limit: int = 10):
        # Join with users to get username
        stmt = (
            select(SearchHistory, User)
            .join(User, SearchHistory.user_id == User.id)
            .order_by(desc(SearchHistory.created_at))
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        rows = result.all()
        
        activity = []
        for history, user in rows:
            activity.append({
                "id": str(history.id),
                "user": user.name,
                "question": history.query,
                "knowledge_source": history.knowledge_source or "Unknown",
                "time": history.created_at
            })
        return activity
