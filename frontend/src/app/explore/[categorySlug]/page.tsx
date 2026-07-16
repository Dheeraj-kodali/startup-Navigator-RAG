"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { ArrowLeft, BookOpen, Clock, Eye, Calendar } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  read_time_minutes: number;
  view_count: number;
  tags: string[];
  published_at: string;
}

export default function CategoryExplorePage({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}) {
  const { categorySlug } = use(params);
  const [category, setCategory] = useState<Category | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>("published_at");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const cat = await api.get(`/categories/${categorySlug}`);
        setCategory(cat);

        // Fetch articles filtered by category
        const artData = await api.get(`/articles?category_id=${cat.id}`);
        setArticles(artData.data || []);
      } catch (err) {
        console.error("Explore Category error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [categorySlug]);

  const allTags = Array.from(
    new Set(articles.flatMap((art) => art.tags || []))
  );

  const filteredArticles = articles
    .filter((art) => !selectedTag || (art.tags && art.tags.includes(selectedTag)))
    .sort((a, b) => {
      if (sortBy === "view_count") return b.view_count - a.view_count;
      return new Date(b.published_at || b.id).getTime() - new Date(a.published_at || a.id).getTime();
    });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 animate-pulse">
        <div className="h-6 w-32 bg-card rounded mb-6" />
        <div className="h-8 w-64 bg-card rounded mb-4" />
        <div className="h-16 w-full bg-card rounded mb-8" />
        <div className="space-y-6">
          <div className="h-40 bg-card rounded-xl" />
          <div className="h-40 bg-card rounded-xl" />
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="text-center py-24">
        <h2 className="text-2xl font-bold">Category not found</h2>
        <Link href="/" className="text-primary mt-4 inline-block hover:underline">
          Go back home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Back navigation */}
      <Link
        href="/"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Topics
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-4">
          {category.name}
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          {category.description}
        </p>
      </div>

      {/* Filters and Sorting bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6 mb-8">
        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTag(null)}
            className={`rounded-full px-4 py-1 text-xs font-semibold border transition-colors ${
              !selectedTag
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`rounded-full px-4 py-1 text-xs font-semibold border transition-colors ${
                selectedTag === tag
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>

        {/* Sort select */}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground self-end sm:self-auto">
          <span>Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-card border border-border rounded-md px-2.5 py-1 text-foreground focus:outline-none"
          >
            <option value="published_at">Latest</option>
            <option value="view_count">Most Viewed</option>
          </select>
        </div>
      </div>

      {/* Articles List */}
      {filteredArticles.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-bold">No articles found</h3>
          <p className="text-muted-foreground text-sm mt-1">Try resetting your filter.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredArticles.map((article) => (
            <article
              key={article.id}
              className="group flex flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div>
                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  <Link href={`/explore/${categorySlug}/${article.slug}`}>{article.title}</Link>
                </h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {article.excerpt}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-between w-full text-xs text-muted-foreground border-t border-border pt-4 mt-6 gap-2">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <Clock className="mr-1 h-3.5 w-3.5" /> {article.read_time_minutes} min
                  </span>
                  <span className="flex items-center">
                    <Eye className="mr-1 h-3.5 w-3.5" /> {article.view_count} views
                  </span>
                  {article.published_at && (
                    <span className="flex items-center">
                      <Calendar className="mr-1 h-3.5 w-3.5" />{" "}
                      {new Date(article.published_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <Link
                  href={`/explore/${categorySlug}/${article.slug}`}
                  className="font-semibold text-primary inline-flex items-center hover:underline"
                >
                  Read Article &rarr;
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
