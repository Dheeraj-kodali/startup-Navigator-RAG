"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { BookOpen, Building, ShieldCheck, UserPlus, Award, Megaphone, FileText, TrendingUp, Cpu, Rocket, ArrowRight, LucideIcon } from "lucide-react";
import { StateCard } from "@/components/ui/StateCard";
import { LoadingState } from "@/components/ui/LoadingState";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color_hex: string;
  article_count: number;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category_name: string;
  read_time_minutes: number;
}

const iconMap: Record<string, LucideIcon> = {
  building: Building,
  banknote: TrendingUp,
  scale: ShieldCheck,
  users: UserPlus,
  award: Award,
  megaphone: Megaphone,
  percent: FileText,
  "trending-up": TrendingUp,
  cpu: Cpu,
  rocket: Rocket,
};

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const catData = await api.get("/categories");
        setCategories(catData || []);
        
        // Fetch featured articles
        const artData = await api.get("/articles/featured?limit=3");
        setFeaturedArticles(artData || []);
      } catch (err: unknown) {
        console.error("Home Page Fetch error:", err);
        setError("Unable to load articles.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="text-center py-16 md:py-24">
        <h1 className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-4xl sm:text-6xl font-extrabold tracking-tight text-transparent mb-6">
          Navigate Your Startup Journey
        </h1>
        <p className="mx-auto max-w-2xl text-lg sm:text-xl text-muted-foreground mb-8">
          Master registration, funding, hiring, tax, branding, and legal compliance. Get answers from verified guides and AI search.
        </p>
        <div className="flex justify-center space-x-4">
          <Link href="/ai-search" className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow hover:opacity-95 transition-opacity">
            Try AI Search <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <a href="#topics" className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-6 py-3 text-base font-semibold text-foreground hover:bg-muted transition-colors">
            Explore Topics
          </a>
        </div>
      </section>

      {/* Connection Error Banner */}
      {error && (
        <div className="mb-8">
          <StateCard 
            type="error" 
            title="Connection Error" 
            message={`${error} Retry to load local fallbacks.`} 
            action={{ label: "Retry", onClick: () => window.location.reload() }} 
          />
        </div>
      )}

      {/* Grid of Categories */}
      <section id="topics" className="py-12">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-8">Explore Startup Topics</h2>
        
        {isLoading ? (
          <LoadingState type="card-skeleton" />
        ) : categories.length === 0 && !error ? (
          <StateCard type="empty" title="No Categories" message="Categories will appear here." />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const Icon = iconMap[category.icon] || BookOpen;
              return (
                <Link
                  key={category.id}
                  href={`/explore/${category.slug}`}
                  className="group relative rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 duration-200"
                >
                  <div
                    className="inline-flex rounded-lg p-3 text-white mb-4"
                    style={{ backgroundColor: category.color_hex || "#6C5CE7" }}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {category.description}
                  </p>
                  <div className="mt-4 text-xs font-semibold text-primary inline-flex items-center">
                    {category.article_count || 0} Guides <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Featured Articles Section */}
      <section className="py-12 border-t border-border mt-12">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-8">Featured Guides</h2>
        
        {isLoading ? (
          <LoadingState type="card-skeleton" />
        ) : featuredArticles.length === 0 && !error ? (
          <StateCard type="empty" title="No Articles" message="Featured guides will appear here." />
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {featuredArticles.map((article) => (
              <article key={article.id} className="flex flex-col items-start rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2">
                  {article.category_name}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  <Link href={`/explore/category/${article.slug}`} className="hover:text-primary transition-colors">
                    {article.title}
                  </Link>
                </h3>
                <p className="text-muted-foreground text-sm line-clamp-3 flex-grow mb-4">
                  {article.excerpt}
                </p>
                <div className="flex items-center justify-between w-full text-xs text-muted-foreground border-t border-border pt-4">
                  <span>{article.read_time_minutes} min read</span>
                  <Link href={`/explore/category/${article.slug}`} className="font-semibold text-primary inline-flex items-center hover:underline">
                    Read Guide <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
