"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { Upload, Trash2, FileText, File, Loader2, Eye, X, RefreshCw, Download, Search, Filter } from "lucide-react";
import toast from "react-hot-toast";
import { StateCard } from "@/components/ui/StateCard";
import { LoadingState } from "@/components/ui/LoadingState";

interface KnowledgeDocument {
  id: string;
  title: string;
  filename: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  uploaded_at: string;
  indexing_status: string;
  status: string;
  chunks_count: number;
  indexed_at: string | null;
  preview_text?: string;
}

interface KnowledgeStats {
  total_documents: number;
  total_chunks: number;
  indexed_documents: number;
  pending_documents: number;
  failed_documents: number;
  total_storage_bytes: number;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function KnowledgeBasePage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [stats, setStats] = useState<KnowledgeStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Form states
  const [title, setTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  // Message states
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // View Detail state
  const [viewingDocument, setViewingDocument] = useState<KnowledgeDocument | null>(null);
  const [loadingStepText, setLoadingStepText] = useState("");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isUploading && uploadProgress === 100) {
      let step = 0;
      const texts = [
        "Extracting text...",
        "Chunking...",
        "Generating embeddings...",
        "Indexing...",
      ];
      setTimeout(() => setLoadingStepText(texts[0]), 0);
      interval = setInterval(() => {
        step = Math.min(step + 1, texts.length - 1);
        setLoadingStepText(texts[step]);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isUploading, uploadProgress]);

  const fetchData = async () => {
    setTimeout(() => setIsLoading(true), 0);
    try {
      const [docsData, statsData] = await Promise.all([
        api.get("/knowledge"),
        api.get("/knowledge/stats")
      ]);
      setDocuments(docsData || []);
      setStats(statsData || null);
    } catch (err: unknown) {
      console.error(err);
      toast.error("Failed to load knowledge base data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  const handleViewDetails = async (id: string) => {
    try {
      const data = await api.get(`/knowledge/${id}`);
      setViewingDocument(data);
    } catch (err: unknown) {
      console.error(err);
      toast.error("Failed to load document details.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/knowledge/${id}`);
      toast.success("Document deleted successfully.");
      setDeleteConfirmId(null);
      fetchData();
    } catch (err: unknown) {
      console.error(err);
      toast.error("Failed to delete document.");
    }
  };

  const handleReindex = async (id: string) => {
    try {
      await api.post(`/knowledge/${id}/reindex`);
      toast.success("Re-indexing started.");
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to start re-indexing.");
    }
  };

  const handleDownload = (id: string) => {
    const token = localStorage.getItem("token");
    const url = `${BASE_URL}/knowledge/${id}/download`;
    
    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(response => {
        if (!response.ok) throw new Error("Network response was not ok");
        return response.blob();
      })
      .then(blob => {
        const doc = documents.find(d => d.id === id);
        const filename = doc ? doc.filename : "download";
        const windowUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = windowUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(windowUrl);
      })
      .catch(err => {
        console.error(err);
        toast.error("Download failed.");
      });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragActive(true);
    else if (e.type === "dragleave") setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const processSelectedFile = (file: File) => {
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    const allowed = [".pdf", ".docx", ".txt", ".md"];
    if (!allowed.includes(ext)) {
      toast.error("Invalid file format. Only PDF, DOCX, TXT and Markdown files are supported.");
      setSelectedFile(null);
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error("File exceeds the maximum limit of 20 MB.");
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
    if (!title) {
      setTitle(file.name.substring(0, file.name.lastIndexOf(".")));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!selectedFile) {
      toast.error("Please select a file to upload.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(false);

    const formData = new FormData();
    formData.append("title", title.trim() || selectedFile.name);
    formData.append("file", selectedFile);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${BASE_URL}/knowledge/upload`);

    const token = localStorage.getItem("token");
    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setUploadProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      setIsUploading(false);
      setLoadingStepText("");
      if (xhr.status >= 200 && xhr.status < 300) {
        toast.success("Document uploaded successfully.");
        setSelectedFile(null);
        setTitle("");
        setUploadError(false);
        fetchData();
      } else {
        try {
          const resp = JSON.parse(xhr.responseText);
          const errorMsg = resp.detail || resp.message || "Knowledge Base upload failed.";
          toast.error(`Upload Failed: ${typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg)}`);
        } catch (e) {
          toast.error(`Upload Failed: ${xhr.responseText || xhr.statusText}`);
        }
        setUploadError(true);
      }
    };
    xhr.onerror = () => {
      setIsUploading(false);
      setLoadingStepText("");
      toast.error("Upload Failed: Network error or server unreachable.");
      setUploadError(true);
    };
    xhr.send(formData);
  };

  const formatBytes = (bytes: number): string => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          doc.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          formatDate(doc.uploaded_at).toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === "indexed") matchesStatus = doc.indexing_status === "active";
    else if (statusFilter === "not_indexed") matchesStatus = doc.indexing_status !== "active";
    else if (statusFilter === "processing") matchesStatus = doc.indexing_status === "processing";
    else if (statusFilter === "failed") matchesStatus = doc.indexing_status === "error";

    let matchesType = true;
    if (typeFilter !== "all") {
      matchesType = doc.file_type.toLowerCase() === typeFilter.toLowerCase();
    }

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 pt-28 space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Document Library</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage and organize your AI Knowledge Base documents</p>
      </div>

      {/* Statistics Dashboard */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col justify-center items-center">
            <span className="text-muted-foreground text-xs uppercase font-bold tracking-wider mb-1">Total Docs</span>
            <span className="text-2xl font-extrabold text-foreground">{stats.total_documents}</span>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col justify-center items-center">
            <span className="text-muted-foreground text-xs uppercase font-bold tracking-wider mb-1">Total Chunks</span>
            <span className="text-2xl font-extrabold text-foreground">{stats.total_chunks}</span>
          </div>
          <div className="bg-card border border-emerald-500/30 bg-emerald-500/5 rounded-xl p-4 shadow-sm flex flex-col justify-center items-center">
            <span className="text-emerald-600 text-xs uppercase font-bold tracking-wider mb-1">Indexed</span>
            <span className="text-2xl font-extrabold text-emerald-600">{stats.indexed_documents}</span>
          </div>
          <div className="bg-card border border-amber-500/30 bg-amber-500/5 rounded-xl p-4 shadow-sm flex flex-col justify-center items-center">
            <span className="text-amber-600 text-xs uppercase font-bold tracking-wider mb-1">Pending</span>
            <span className="text-2xl font-extrabold text-amber-600">{stats.pending_documents}</span>
          </div>
          <div className="bg-card border border-destructive/30 bg-destructive/5 rounded-xl p-4 shadow-sm flex flex-col justify-center items-center">
            <span className="text-destructive text-xs uppercase font-bold tracking-wider mb-1">Failed</span>
            <span className="text-2xl font-extrabold text-destructive">{stats.failed_documents}</span>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col justify-center items-center">
            <span className="text-muted-foreground text-xs uppercase font-bold tracking-wider mb-1">Storage</span>
            <span className="text-xl font-extrabold text-foreground">{formatBytes(stats.total_storage_bytes)}</span>
          </div>
        </div>
      )}

      {/* Drag & Drop Upload Area */}
      {uploadError ? (
        <StateCard 
          type="error"
          title="Upload Failed"
          message="Knowledge Base upload failed. Try again."
          action={{ label: "Try again", onClick: () => { setUploadError(false); setSelectedFile(null); setTitle(""); } }}
        />
      ) : (
        <div 
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            isDragActive 
              ? "border-primary bg-primary/5 scale-[1.01]" 
              : selectedFile 
                ? "border-emerald-500/40 bg-emerald-500/5" 
                : "border-border bg-card hover:border-muted-foreground/30"
          }`}
        >
          <div className="max-w-md mx-auto space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <Upload className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {selectedFile ? `Selected File: ${selectedFile.name}` : "Drag & drop your documents here, or click to browse"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Supports PDF, DOCX, TXT, and Markdown up to 20MB</p>
            </div>
            <div className="flex justify-center gap-3">
              <label className="cursor-pointer inline-flex items-center justify-center rounded-lg bg-muted hover:bg-muted/80 text-foreground px-4 py-2 text-xs font-semibold border border-border transition-colors">
                <span>Choose Files</span>
                <input type="file" accept=".pdf,.docx,.txt,.md" onChange={handleFileChange} className="hidden" disabled={isUploading} />
              </label>
              {selectedFile && (
                <button type="button" onClick={() => { setSelectedFile(null); setTitle(""); }} className="inline-flex items-center justify-center rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive px-4 py-2 text-xs font-semibold transition-colors">
                  Clear Selection
                </button>
              )}
            </div>
            {selectedFile && (
              <div className="pt-4 border-t border-border/40 space-y-3 text-left">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Document Title</label>
                  <input type="text" placeholder="Enter custom title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" disabled={isUploading} />
                </div>
                <button onClick={() => handleUploadSubmit()} disabled={isUploading} className="w-full inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow disabled:opacity-50 transition-colors">
                  {isUploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {uploadProgress < 100 ? `Uploading ${uploadProgress}%` : loadingStepText || "Completed"}</> : <><Upload className="mr-2 h-4.5 w-4.5" /> Start Auto-Indexing</>}
                </button>
              </div>
            )}
            {isUploading && (
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div className="bg-primary h-2 transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Controls & Filters */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by title, filename, or date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
          <div className="flex items-center text-sm font-medium text-muted-foreground whitespace-nowrap">
            <Filter className="h-4 w-4 mr-2" /> Filters:
          </div>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-background border border-input text-foreground text-sm rounded-lg focus:ring-primary focus:border-primary block p-2"
          >
            <option value="all">All Statuses</option>
            <option value="indexed">Indexed</option>
            <option value="not_indexed">Not Indexed</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
          </select>
          <select 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-background border border-input text-foreground text-sm rounded-lg focus:ring-primary focus:border-primary block p-2"
          >
            <option value="all">All Types</option>
            <option value="pdf">PDF</option>
            <option value="docx">DOCX</option>
            <option value="txt">TXT</option>
            <option value="md">Markdown</option>
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="space-y-4">
        {isLoading ? (
          <LoadingState type="table-skeleton" />
        ) : filteredDocs.length === 0 ? (
          <StateCard 
            type="empty" 
            title="No Knowledge Documents" 
            message={searchQuery || typeFilter !== 'all' || statusFilter !== 'all' ? "No documents match your current filters." : "Use the upload area above to add PDF, DOCX, TXT, or Markdown documents to your AI knowledge base."}
          />
        ) : (
          <div className="border border-border bg-card rounded-xl overflow-x-auto shadow-sm">
            <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-muted-foreground font-bold text-xs uppercase tracking-wider">
                  <th className="p-4">Document Name</th>
                  <th className="p-4">File Type</th>
                  <th className="p-4">Size</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Chunks</th>
                  <th className="p-4">Indexed</th>
                  <th className="p-4">Uploaded By</th>
                  <th className="p-4">Upload Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-foreground">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-semibold">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4.5 w-4.5 text-muted-foreground flex-shrink-0" />
                        <div className="flex flex-col">
                          <span className="truncate max-w-[200px]" title={doc.title}>{doc.title}</span>
                          <span className="text-[10px] text-muted-foreground font-normal truncate max-w-[200px]">{doc.filename}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center rounded bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border border-primary/20">
                        {doc.file_type}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground text-xs">{formatBytes(doc.file_size)}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        doc.indexing_status === "active" 
                          ? "bg-emerald-500/10 text-emerald-500" 
                          : doc.indexing_status === "processing" 
                            ? "bg-amber-500/10 text-amber-500 animate-pulse" 
                            : "bg-destructive/10 text-destructive"
                      }`}>
                        {doc.indexing_status}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-muted-foreground text-xs">{doc.chunks_count || 0}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                        doc.indexing_status === "active" ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
                          doc.indexing_status === "active" ? "bg-emerald-500" : "bg-muted-foreground"
                        }`} />
                        {doc.indexing_status === "active" ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground text-xs">{user?.name || "Unknown User"}</td>
                    <td className="p-4 text-muted-foreground text-xs">{formatDate(doc.uploaded_at)}</td>
                    <td className="p-4 text-right">
                      {deleteConfirmId === doc.id ? (
                        <div className="flex items-center justify-end space-x-1.5">
                          <button onClick={() => handleDelete(doc.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground text-[10px] font-bold px-2 py-1 rounded">Confirm</button>
                          <button onClick={() => setDeleteConfirmId(null)} className="bg-muted hover:bg-muted/80 text-foreground text-[10px] font-semibold px-2 py-1 rounded border border-border">Cancel</button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end space-x-1">
                          <button onClick={() => handleViewDetails(doc.id)} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-muted rounded" title="View Details">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDownload(doc.id)} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-muted rounded" title="Download Original">
                            <Download className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleReindex(doc.id)} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-muted rounded" title="Re-index">
                            <RefreshCw className="h-4 w-4" />
                          </button>
                          <button onClick={() => setDeleteConfirmId(doc.id)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-muted rounded" title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Document Detail Modal */}
      {viewingDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl max-w-2xl w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/10">
              <h3 className="text-lg font-bold text-foreground flex items-center">
                <FileText className="mr-2 h-5 w-5 text-primary" />
                Document Details
              </h3>
              <button onClick={() => setViewingDocument(null)} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Document Name</span>
                  <p className="font-semibold text-foreground">{viewingDocument.title}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Filename</span>
                  <p className="text-foreground truncate">{viewingDocument.filename}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">File Type</span>
                  <p className="font-bold text-primary uppercase">{viewingDocument.file_type}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Size</span>
                  <p className="text-foreground">{formatBytes(viewingDocument.file_size)}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Upload Date</span>
                  <p className="text-foreground">{formatDate(viewingDocument.uploaded_at)}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</span>
                  <div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      viewingDocument.indexing_status === "active" ? "bg-emerald-500/10 text-emerald-500" : viewingDocument.indexing_status === "processing" ? "bg-amber-500/10 text-amber-500" : "bg-destructive/10 text-destructive"
                    }`}>
                      {viewingDocument.indexing_status}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Chunks</span>
                  <p className="text-foreground font-mono">{viewingDocument.chunks_count || 0}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Chunk Size & Embedding Model</span>
                  <p className="text-foreground">500 (Overlap: 50) | FastEmbed</p>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-border/60">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Preview of Extracted Text (First 500 characters)</span>
                <div className="bg-muted/30 border border-border rounded-lg p-4 font-mono text-xs text-foreground/80 whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {viewingDocument.preview_text || "Preview text is not available for this document."}
                </div>
              </div>
            </div>
            <div className="bg-muted/30 border-t border-border px-6 py-4 flex justify-end">
              <button onClick={() => setViewingDocument(null)} className="bg-primary text-primary-foreground font-semibold px-6 py-2 rounded-lg text-sm hover:opacity-90 transition-opacity">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
