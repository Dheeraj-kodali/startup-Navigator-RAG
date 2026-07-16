"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Edit2, Trash2, Plus, Search, Filter, Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { StateCard } from "@/components/ui/StateCard";
import { LoadingState } from "@/components/ui/LoadingState";

interface Category {
  id: string;
  name: string;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content_markdown: string;
  status: string;
  category_id: string;
  version: number;
}

export default function AdminArticlesCrud() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("draft");

  // Delete Confirm Dialog States
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchArticles = async () => {
    setTimeout(() => setIsLoading(true), 0);
    try {
      const data = await api.get(`/articles?page=${page}&page_size=20`);
      setArticles(data.data || []);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load articles.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await api.get("/categories");
      setCategories(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchArticles();
    fetchCategories();
  }, [page]);

  const handleEditClick = (article: Article) => {
    setEditingArticle(article);
    setTitle(article.title);
    setExcerpt(article.excerpt || "");
    setContent(article.content_markdown || "");
    setCategoryId(article.category_id || "");
    setStatus(article.status || "draft");
    setShowModal(true);
  };

  const handleCreateClick = () => {
    setEditingArticle(null);
    setTitle("");
    setExcerpt("");
    setContent("");
    setCategoryId(categories[0]?.id || "");
    setStatus("draft");
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const payload = {
      title,
      excerpt,
      content_markdown: content,
      category_id: categoryId,
      status,
    };

    try {
      if (editingArticle) {
        await api.patch(`/admin/articles/${editingArticle.id}`, payload);
      } else {
        await api.post("/admin/articles", payload);
      }
      toast.success("Article saved successfully.");
      setShowModal(false);
      fetchArticles();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to save article.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsSubmitting(true);
    try {
      await api.delete(`/admin/articles/${id}`);
      setDeleteConfirmId(null);
      toast.success("Article archived successfully.");
      fetchArticles();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete article.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Articles Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">Add, edit, or archive articles</p>
        </div>
        <button
          onClick={handleCreateClick}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow"
        >
          <Plus className="mr-1.5 h-4.5 w-4.5" /> New Article
        </button>
      </div>

      {/* Table Listing */}
      {isLoading ? (
        <LoadingState type="table-skeleton" />
      ) : error ? (
        <StateCard 
          type="error" 
          title="Connection Error" 
          message={`${error} Retry to load local fallbacks.`} 
          action={{ label: "Retry", onClick: () => window.location.reload() }} 
        />
      ) : articles.length === 0 ? (
        <StateCard type="empty" title="No Articles" message="Click 'New Article' above to create your first article." />
      ) : (
        <div className="border border-border bg-card rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/20 text-muted-foreground">
                <th className="p-4 font-bold uppercase tracking-wider">Title</th>
                <th className="p-4 font-bold uppercase tracking-wider">Status</th>
                <th className="p-4 font-bold uppercase tracking-wider">Ver</th>
                <th className="p-4 font-bold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {articles.map((art) => (
                <tr key={art.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-semibold text-foreground max-w-xs truncate">{art.title}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                        art.status === "published"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : art.status === "draft"
                          ? "bg-yellow-500/10 text-yellow-500"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {art.status}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground font-medium">v{art.version}</td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleEditClick(art)}
                      className="p-1.5 text-muted-foreground hover:text-primary hover:bg-muted rounded transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="h-4.5 w-4.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(art.id)}
                      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-muted rounded transition-colors"
                      title="Delete (Archive)"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination bar */}
          <div className="flex items-center justify-between p-4 border-t border-border bg-muted/10">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="inline-flex items-center space-x-1 text-xs text-muted-foreground hover:text-primary disabled:opacity-30 transition-all"
            >
              <ArrowLeft className="h-4 w-4" /> <span>Previous</span>
            </button>
            <span className="text-xs text-muted-foreground font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="inline-flex items-center space-x-1 text-xs text-muted-foreground hover:text-primary disabled:opacity-30 transition-all"
            >
              <span>Next</span> <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-foreground mb-4">
              {editingArticle ? "Edit Article Details" : "Create New Article"}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Excerpt</label>
                <input
                  type="text"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Content (Markdown)</label>
                <textarea
                  rows={6}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full rounded-lg border border-border bg-transparent p-3 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="review">Review</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={isSubmitting}
                  className="rounded-lg border border-border bg-transparent px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-95 disabled:opacity-50 flex items-center"
                >
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl shadow-xl max-w-sm w-full p-6 text-center">
            <h3 className="text-lg font-bold text-foreground mb-2">Archive Article?</h3>
            <p className="text-xs text-muted-foreground mb-6">
              This will set the article status to archived. You can restore or change the status back later.
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                disabled={isSubmitting}
                className="rounded-lg border border-border bg-transparent px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={isSubmitting}
                className="rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground hover:opacity-95 disabled:opacity-50 flex items-center"
              >
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Yes, Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
