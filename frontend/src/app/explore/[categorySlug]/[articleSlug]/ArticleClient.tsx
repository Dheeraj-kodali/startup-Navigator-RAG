"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { ArrowLeft, Bookmark, CheckCircle, Clock, Eye, Share2, HelpCircle } from "lucide-react";

interface Article {
  id: string;
  title: string;
  slug: string;
  content_markdown: string;
  excerpt: string;
  read_time_minutes: number;
  view_count: number;
  tags: string[];
}

export default function ArticleDetailPage({
  params,
}: {
  params: Promise<{ categorySlug: string; articleSlug: string }>;
}) {
  const { categorySlug, articleSlug } = use(params);
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [readingProgress, setReadingProgress] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState<number | null>(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    async function fetchArticle() {
      try {
        const data = await api.get(`/articles/${articleSlug}`);
        setArticle(data);
      } catch (err) {
        console.error("Fetch Article Detail Error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchArticle();
  }, [articleSlug]);

  useEffect(() => {
    // Reading progress calculation based on window scroll
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setReadingProgress(Math.min(progress, 100));
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleBookmarkToggle = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleFeedbackSubmit = async (rating: number) => {
    setFeedbackRating(rating);
    try {
      // Mock submit user feedback rating
      await new Promise((resolve) => setTimeout(resolve, 500));
      setFeedbackSubmitted(true);
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 animate-pulse">
        <div className="h-6 w-32 bg-card rounded mb-6" />
        <div className="h-10 w-3/4 bg-card rounded mb-4" />
        <div className="h-6 w-1/4 bg-card rounded mb-8" />
        <div className="space-y-4">
          <div className="h-4 w-full bg-card rounded" />
          <div className="h-4 w-full bg-card rounded" />
          <div className="h-4 w-3/4 bg-card rounded" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-24">
        <h2 className="text-2xl font-bold">Article not found</h2>
        <Link href={`/explore/${categorySlug}`} className="text-primary mt-4 inline-block hover:underline">
          Back to category
        </Link>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-4xl px-4 py-8">
      {/* Top Reading Progress Bar */}
      <div className="fixed top-[60px] left-0 right-0 h-1 bg-muted z-50">
        <div
          className="h-full bg-primary transition-all duration-100"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Back Link */}
      <Link
        href={`/explore/${categorySlug}`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to List
      </Link>

      {/* Meta details */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-4">
        <span className="flex items-center">
          <Clock className="mr-1 h-3.5 w-3.5" /> {article.read_time_minutes} min read
        </span>
        <span className="flex items-center">
          <Eye className="mr-1 h-3.5 w-3.5" /> {article.view_count} views
        </span>
      </div>

      {/* Article Title */}
      <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-6 leading-tight">
        {article.title}
      </h1>

      {/* Excerpt panel */}
      {article.excerpt && (
        <div className="border-l-4 border-primary/40 bg-card/40 p-4 rounded-r-lg mb-8 text-muted-foreground italic text-base">
          {article.excerpt}
        </div>
      )}

      {/* Action buttons (Bookmark, Share) */}
      <div className="flex items-center space-x-3 mb-8 border-b border-border pb-6">
        <button
          onClick={handleBookmarkToggle}
          className={`inline-flex items-center space-x-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
            isBookmarked
              ? "bg-primary/10 border-primary text-primary"
              : "bg-card border-border text-muted-foreground hover:bg-muted"
          }`}
        >
          <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-primary" : ""}`} />
          <span>{isBookmarked ? "Bookmarked" : "Bookmark"}</span>
        </button>
        <button className="inline-flex items-center space-x-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors">
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </button>
      </div>

      {/* Article Content Render */}
      <div className="prose prose-invert max-w-none text-foreground/90 space-y-6 leading-relaxed">
        {article.content_markdown.split("\n\n").map((para, index) => {
          if (para.startsWith("# ")) {
            return (
              <h1 key={index} className="text-3xl font-bold tracking-tight text-foreground mt-8 mb-4 border-b border-border pb-2">
                {para.replace("# ", "")}
              </h1>
            );
          }
          if (para.startsWith("## ")) {
            return (
              <h2 key={index} className="text-2xl font-semibold tracking-tight text-foreground mt-6 mb-3">
                {para.replace("## ", "")}
              </h2>
            );
          }
          if (para.startsWith("* ")) {
            return (
              <ul key={index} className="list-disc pl-6 space-y-2 my-4">
                {para.split("\n").map((li, liIdx) => (
                  <li key={liIdx}>{li.replace("* ", "")}</li>
                ))}
              </ul>
            );
          }
          if (para.startsWith("1. ")) {
            return (
              <ol key={index} className="list-decimal pl-6 space-y-2 my-4">
                {para.split("\n").map((li, liIdx) => (
                  <li key={liIdx}>{li.replace(/^\d+\.\s/, "")}</li>
                ))}
              </ol>
            );
          }
          return <p key={index}>{para}</p>;
        })}
      </div>

      {/* Helpful / Rating Section */}
      <div className="border-t border-border mt-16 pt-8 text-center max-w-md mx-auto">
        <h3 className="text-base font-semibold mb-4 inline-flex items-center justify-center">
          <HelpCircle className="mr-1.5 h-4 w-4 text-primary" /> Was this guide helpful?
        </h3>
        
        {feedbackSubmitted ? (
          <div className="flex items-center justify-center text-sm text-secondary font-medium animate-fade-in">
            <CheckCircle className="mr-1.5 h-5 w-5" /> Thank you for your feedback!
          </div>
        ) : (
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleFeedbackSubmit(star)}
                className={`rounded-lg border border-border bg-card p-3 text-lg font-bold hover:bg-muted hover:border-primary transition-all duration-150 ${
                  feedbackRating && feedbackRating >= star ? "text-primary border-primary bg-primary/5" : "text-muted-foreground"
                }`}
              >
                {star}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
