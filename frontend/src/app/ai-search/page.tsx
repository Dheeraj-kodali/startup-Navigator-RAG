"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Sparkles, Send, BookOpen, Clock, AlertCircle, Compass, Trash2, ArrowRight, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { StateCard } from "@/components/ui/StateCard";

interface Source {
  id: string;
  title: string;
  slug: string;
  url?: string;
  source_type: string;
  similarity?: number;
  section?: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  engine?: string;
  confidence?: string;
  knowledgeSource?: string;
  responseTimeMs?: number;
  status?: string;
  originalQuery?: string;
}

interface SearchHistoryItem {
  id: string;
  query: string;
  ai_answer?: string;
  source_documents?: Source[];
  knowledge_source?: string;
  response_time_ms?: number;
  created_at: string;
}

export default function AISearchPage() {
  const [query, setQuery] = useState("");
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [isEmptyState, setIsEmptyState] = useState(false);
  const [loadingText, setLoadingText] = useState("Searching knowledge base...");

  const suggestedQuestions = [
    "Should I form an LLC or a C-Corp for my software startup?",
    "What is a SAFE agreement and how does the valuation cap work?",
    "How does Stripe Atlas work for company registration?",
    "What are the standard steps for hiring my first employee?",
  ];

  useEffect(() => {
    // Load local chat session and search histories on load if user is authenticated
    async function loadHistory() {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) return;
      
      try {
        const historyData = await api.get("/search/history?page_size=20");
        setSearchHistory(historyData || []);
      } catch (e) {
        console.error("History fetch error:", e);
      }
    }

    async function checkEmptyState() {
      try {
        const docsResponse = await api.get("/knowledge");
        if (!docsResponse || docsResponse.length === 0) {
          setIsEmptyState(true);
        }
      } catch (e) {
        console.error("Failed to check knowledge base state:", e);
      }
    }

    loadHistory();
    checkEmptyState();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSearching) {
      let step = 0;
      const texts = [
        "Searching knowledge base...",
        "Retrieving relevant documents...",
        "Generating AI response..."
      ];
      setTimeout(() => setLoadingText(texts[0]), 0);
      interval = setInterval(() => {
        step = (step + 1) % texts.length;
        setLoadingText(texts[step]);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isSearching]);

  const handleSearchSubmit = async (searchQuery: string) => {
    if (!searchQuery.trim() || isSearching) return;
    
    setIsSearching(true);
    setQuery("");

    const userMsg: Message = { role: "user", content: searchQuery };
    setChatHistory((prev) => [...prev, userMsg]);

    try {
      const response = await api.post(`/ai/search?q=${encodeURIComponent(searchQuery)}`);
      
      const assistantMsg: Message = {
        role: "assistant",
        content: response.answer,
        sources: response.sources || [],
        engine: response.engine,
        confidence: response.confidence,
        knowledgeSource: response.knowledge_source,
        responseTimeMs: response.response_time_ms,
        status: response.status,
        originalQuery: searchQuery,
      };

      setChatHistory((prev) => [...prev, assistantMsg]);
      
      // Refresh local history list
      const updatedHistory = await api.get("/search/history?page_size=20");
      setSearchHistory(updatedHistory || []);
    } catch {
      const errorMsg: Message = {
        role: "assistant",
        content: "AI service unavailable. Please try again later.",
        status: "error"
      };
      setChatHistory((prev) => [...prev, errorMsg]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleForceAi = async (searchQuery: string) => {
    if (!searchQuery.trim() || isSearching) return;
    
    setIsSearching(true);

    try {
      const response = await api.post(`/ai/search?q=${encodeURIComponent(searchQuery)}&force_ai=true`);
      
      const assistantMsg: Message = {
        role: "assistant",
        content: response.answer,
        sources: response.sources || [],
        engine: response.engine,
        confidence: response.confidence,
        knowledgeSource: response.knowledge_source,
        responseTimeMs: response.response_time_ms,
      };

      setChatHistory((prev) => [...prev, assistantMsg]);
      
      // Refresh local history list
      const updatedHistory = await api.get("/search/history?page_size=20");
      setSearchHistory(updatedHistory || []);
    } catch {
      const errorMsg: Message = {
        role: "assistant",
        content: "AI service unavailable. Please try again later.",
        status: "error"
      };
      setChatHistory((prev) => [...prev, errorMsg]);
    } finally {
      setIsSearching(false);
    }
  };

  const deleteHistoryItem = async (id: string) => {
    try {
      await api.delete(`/search/history/${id}`);
      setSearchHistory((prev) => prev.filter((item) => item.id !== id));
      toast.success("History item deleted");
    } catch (e) {
      console.error("Failed to delete history item", e);
      toast.error("Failed to delete history item.");
    }
  };

  const clearAllHistory = async () => {
    if (!confirm("Are you sure you want to clear all your search history?")) return;
    try {
      await api.delete("/search/history");
      setSearchHistory([]);
      setChatHistory([]);
      toast.success("Search history cleared");
    } catch (e) {
      console.error("Failed to clear history", e);
      toast.error("Failed to clear search history.");
    }
  };

  const viewAnswer = (item: SearchHistoryItem) => {
    const userMsg: Message = { role: "user", content: item.query };
    const assistantMsg: Message = {
      role: "assistant",
      content: item.ai_answer || "Answer not available in history.",
      sources: item.source_documents || [],
      knowledgeSource: item.knowledge_source,
      responseTimeMs: item.response_time_ms,
      confidence: item.source_documents && item.source_documents.length > 0 ? "High" : undefined // simplify for history replay
    };
    setChatHistory([userMsg, assistantMsg]);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar Panel for History */}
      <aside className="lg:col-span-1 border border-border bg-card/50 rounded-xl p-5 h-[calc(100vh-200px)] overflow-y-auto flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-foreground inline-flex items-center">
            <Clock className="mr-2 h-4 w-4 text-primary" /> Search History
          </h3>
          {searchHistory.length > 0 && (
            <button onClick={clearAllHistory} className="text-xs text-destructive hover:underline">
              Clear All
            </button>
          )}
        </div>
        
        {searchHistory.length === 0 ? (
          <div className="mt-4">
            <StateCard type="empty" title="No Search History" message="Your past AI searches will appear here." />
          </div>
        ) : (
          <div className="space-y-3 flex-grow overflow-y-auto pr-1">
            {searchHistory.map((item) => (
              <div
                key={item.id}
                className="flex flex-col text-left border border-border/50 bg-card p-3 rounded-lg hover:border-primary/50 transition-all group"
              >
                <div className="text-xs font-medium text-foreground line-clamp-2 mb-2">
                  {item.query}
                </div>
                
                <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-3">
                  <span className="flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1"></span>
                    {item.knowledge_source || "AI"}
                  </span>
                  <span>{new Date(item.created_at).toLocaleDateString()}</span>
                </div>
                
                <div className="flex items-center justify-between border-t border-border/30 pt-2 mt-1">
                  <button
                    onClick={() => viewAnswer(item)}
                    className="text-xs text-primary hover:text-primary/80 inline-flex items-center font-medium"
                  >
                    View Answer <ArrowRight className="ml-1 h-3 w-3" />
                  </button>
                  <button
                    onClick={() => deleteHistoryItem(item.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                    title="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* Main AI chat dashboard container */}
      <section className="lg:col-span-3 flex flex-col justify-between h-[calc(100vh-200px)]">
        {/* Chat History bubble display area */}
        <div className="flex-grow overflow-y-auto space-y-6 pb-6 px-2">
          {isEmptyState ? (
            <div className="text-center py-16 max-w-xl mx-auto flex flex-col items-center justify-center h-full">
              <div className="inline-flex rounded-full bg-destructive/10 p-4 text-destructive mb-6">
                <AlertCircle className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground mb-4">
                No documents have been uploaded yet.
              </h2>
              <p className="text-muted-foreground text-sm mb-8 text-center max-w-md mx-auto">
                Visit the Knowledge Base page to upload PDFs, DOCX, TXT, or Markdown files.
              </p>
              <Link
                href="/knowledge"
                className="bg-primary text-primary-foreground hover:opacity-90 px-6 py-3 rounded-lg font-medium transition-opacity inline-flex items-center"
              >
                Go to Knowledge Base
              </Link>
            </div>
          ) : chatHistory.length === 0 ? (
            <div className="text-center py-16 max-w-xl mx-auto">
              <div className="inline-flex rounded-full bg-primary/10 p-4 text-primary mb-6 animate-pulse">
                <Sparkles className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground mb-2">
                Ask Startup Navigator AI
              </h2>
              <p className="text-muted-foreground text-sm mb-8">
                Get instant, contextual answers generated directly from our database of registration guides, legal docs, and growth tutorials.
              </p>
              
              {/* Suggestion questions card box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                {suggestedQuestions.map((qText, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearchSubmit(qText)}
                    className="text-xs text-muted-foreground border border-border bg-card p-3 rounded-lg hover:border-primary/50 hover:bg-muted/30 transition-all text-left"
                  >
                    {qText}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    msg.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-2xl rounded-2xl px-4 py-3 text-sm shadow-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-card border border-border text-foreground rounded-tl-none leading-relaxed"
                    }`}
                  >
                    {/* Handle special not_found state */}
                    {msg.status === "error" ? (
                      <div className="p-2 -m-4">
                        <StateCard type="error" title="Service Unavailable" message={msg.content} />
                      </div>
                    ) : msg.status === "not_found" ? (
                      <div className="flex flex-col items-center text-center p-4">
                        <p className="text-foreground font-medium mb-6">
                          No relevant information was found in your uploaded Knowledge Base.
                        </p>
                        <p className="text-sm text-muted-foreground mb-4">You can:</p>
                        <div className="flex flex-col sm:flex-row gap-4">
                          <Link
                            href="/knowledge"
                            className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-lg font-medium transition-all"
                          >
                            Upload More Documents
                          </Link>
                          <button
                            onClick={() => msg.originalQuery && handleForceAi(msg.originalQuery)}
                            className="bg-primary text-primary-foreground hover:opacity-90 px-4 py-2 rounded-lg font-medium transition-all inline-flex items-center"
                          >
                            <Sparkles className="mr-2 h-4 w-4" /> Generate with AI
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Generated AI Disclaimer top */}
                        {msg.role === "assistant" && msg.knowledgeSource === "General AI Knowledge" && (
                          <div className="mb-4 pb-3 border-b border-border text-muted-foreground font-medium text-xs">
                            Generated using General AI.
                          </div>
                        )}
                        
                        {/* Render paragraph blocks */}
                        {msg.content.split("\n\n").map((chunk, chunkIdx) => (
                          <p key={chunkIdx} className={chunkIdx > 0 ? "mt-3" : ""}>
                            {chunk}
                          </p>
                        ))}
                        
                        {msg.role === "assistant" && msg.knowledgeSource === "General AI Knowledge" && (
                          <div className="mt-4 pt-3 border-t border-border text-muted-foreground italic text-xs">
                            No matching document was found in your uploaded Knowledge Base.
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Render Sources and Metadata Section if assistant answer */}
                  {msg.role === "assistant" && msg.status !== "not_found" && (
                    <div className="mt-3 max-w-2xl space-y-4 bg-muted/20 border border-border/50 rounded-xl p-4">
                      
                      {/* Sources Display */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div>
                          <div className="text-xs font-bold text-foreground mb-3 flex items-center">
                            <Compass className="mr-2 h-4 w-4 text-primary" /> Sources
                          </div>
                          <div className="flex flex-col gap-2">
                            {msg.sources.map((src, srcIdx) => (
                              <div
                                key={srcIdx}
                                className="flex flex-col sm:flex-row sm:items-center justify-between border border-border/80 bg-card rounded-lg px-3 py-2 text-xs"
                              >
                                <div className="flex items-center space-x-2 text-primary font-medium mb-1 sm:mb-0">
                                  <BookOpen className="h-3.5 w-3.5 flex-shrink-0" />
                                  <span className="truncate">
                                    {src.source_type === "document" ? `📄 ${src.title}` : src.title}
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground">
                                  {src.section && (
                                    <span>Section: <span className="text-foreground">{src.section}</span></span>
                                  )}
                                  {src.similarity !== undefined && (
                                    <span>Similarity: <span className="text-foreground">{src.similarity}%</span></span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <hr className="border-border/60" />

                      {/* Confidence and Knowledge Source */}
                      <div className="flex flex-wrap gap-4 text-xs">
                        {msg.confidence && (
                          <div className="flex flex-col space-y-1">
                            <span className="text-muted-foreground font-semibold uppercase text-[10px]">Confidence</span>
                            <span className={`font-medium ${msg.confidence === 'High' ? 'text-green-500' : msg.confidence === 'Medium' ? 'text-yellow-500' : 'text-red-500'}`}>
                              {msg.confidence}
                            </span>
                          </div>
                        )}
                        
                        {msg.knowledgeSource && (
                          <div className="flex flex-col space-y-1">
                            <span className="text-muted-foreground font-semibold uppercase text-[10px]">Knowledge Source</span>
                            <span className={`font-medium flex items-center px-2 py-0.5 rounded-full text-[10px] w-fit ${
                              msg.knowledgeSource === 'General AI Knowledge' 
                                ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' 
                                : 'bg-green-500/10 text-green-500 border border-green-500/20'
                            }`}>
                              {msg.knowledgeSource === 'General AI Knowledge' ? <Sparkles className="h-3 w-3 mr-1" /> : <span className="mr-1">✓</span>}
                              {msg.knowledgeSource === 'General AI Knowledge' ? 'General AI' : 'Knowledge Base'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Waiting search skeleton indicator */}
              {isSearching && (
                <div className="flex flex-col items-start">
                  <div className="max-w-2xl rounded-2xl rounded-tl-none bg-card border border-border px-4 py-4 w-full animate-pulse space-y-3">
                    <div className="flex items-center space-x-2 text-primary text-sm font-medium">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{loadingText}</span>
                    </div>
                    <div className="h-3 w-3/4 bg-muted rounded mt-2" />
                    <div className="h-3 w-full bg-muted rounded" />
                    <div className="h-3 w-5/6 bg-muted rounded" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Form Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearchSubmit(query);
          }}
          className="relative border border-border bg-card rounded-xl p-2 flex items-center shadow-lg"
        >
          <input
            type="text"
            placeholder="Ask AI search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isSearching}
            className="flex-grow bg-transparent px-4 py-3 text-sm text-foreground focus:outline-none placeholder-muted-foreground disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="rounded-lg bg-primary p-3 text-primary-foreground hover:opacity-95 disabled:opacity-30 transition-all flex items-center justify-center"
          >
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </form>
      </section>
    </div>
  );
}
