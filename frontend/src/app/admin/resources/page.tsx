"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Edit2, Trash2, Plus, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { StateCard } from "@/components/ui/StateCard";
import { LoadingState } from "@/components/ui/LoadingState";

interface Category {
  id: string;
  name: string;
}

interface Resource {
  id: string;
  category_id: string;
  title: string;
  description: string;
  url: string;
  resource_type: string;
  icon: string;
  is_featured: boolean;
}

export default function AdminResourcesCrud() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [resourceType, setResourceType] = useState("link");
  const [categoryId, setCategoryId] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);

  // Delete Confirm Dialog States
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchResources = async () => {
    setTimeout(() => setIsLoading(true), 0);
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      
      const response = await fetch(`${BASE_URL}/resources?page=${page}&page_size=10`, { headers });
      const result = await response.json();
      
      setResources(result.data || []);
      setTotalPages(result.pagination?.total_pages || 1);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Unable to load resources.");
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
    fetchResources();
    fetchCategories();
  }, [page]);

  const handleEditClick = (resource: Resource) => {
    setEditingResource(resource);
    setTitle(resource.title);
    setDescription(resource.description || "");
    setUrl(resource.url || "");
    setResourceType(resource.resource_type || "link");
    setCategoryId(resource.category_id || "");
    setIsFeatured(resource.is_featured || false);
    setShowModal(true);
  };

  const handleCreateClick = () => {
    setEditingResource(null);
    setTitle("");
    setDescription("");
    setUrl("");
    setResourceType("link");
    setCategoryId(categories[0]?.id || "");
    setIsFeatured(false);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const payload = {
      title,
      description,
      url,
      resource_type: resourceType,
      category_id: categoryId,
      is_featured: isFeatured,
    };

    try {
      if (editingResource) {
        await api.patch(`/admin/resources/${editingResource.id}`, payload);
      } else {
        await api.post("/admin/resources", payload);
      }
      toast.success("Resource saved successfully.");
      setShowModal(false);
      fetchResources();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to save resource.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsSubmitting(true);
    try {
      await api.delete(`/admin/resources/${id}`);
      setDeleteConfirmId(null);
      toast.success("Resource deleted successfully.");
      fetchResources();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete resource.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Resources Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage portal external links and templates</p>
        </div>
        <button
          onClick={handleCreateClick}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow"
        >
          <Plus className="mr-1.5 h-4.5 w-4.5" /> New Resource
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
      ) : resources.length === 0 ? (
        <StateCard type="empty" title="No Resources" message="Click 'New Resource' above to create your first resource." />
      ) : (
        <div className="border border-border bg-card rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/20 text-muted-foreground">
                <th className="p-4 font-bold uppercase tracking-wider">Resource Title</th>
                <th className="p-4 font-bold uppercase tracking-wider">Type</th>
                <th className="p-4 font-bold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {resources.map((res) => (
                <tr key={res.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-semibold text-foreground max-w-xs truncate">{res.title}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center rounded bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                      {res.resource_type}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleEditClick(res)}
                      className="p-1.5 text-muted-foreground hover:text-primary hover:bg-muted rounded transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="h-4.5 w-4.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(res.id)}
                      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-muted rounded transition-colors"
                      title="Delete"
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
              {editingResource ? "Edit Resource Details" : "Create New Resource"}
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
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Resource Type</label>
                <select
                  value={resourceType}
                  onChange={(e) => setResourceType(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="link">Link</option>
                  <option value="tool">Tool</option>
                  <option value="template">Template</option>
                  <option value="guide">Guide</option>
                  <option value="document">Document</option>
                  <option value="video">Video</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">URL</label>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-border bg-transparent p-3 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4 bg-transparent"
                />
                <label htmlFor="featured" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Feature this resource on homepage
                </label>
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
            <h3 className="text-lg font-bold text-foreground mb-2">Delete Resource?</h3>
            <p className="text-xs text-muted-foreground mb-6">
              This action cannot be undone. This resource will be permanently removed from the category index.
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
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
