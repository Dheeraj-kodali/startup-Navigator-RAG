"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { BookOpen, ExternalLink, Filter, FileText, Video, Link as LinkIcon, Download, LucideIcon } from "lucide-react";
import { StateCard } from "@/components/ui/StateCard";
import { LoadingState } from "@/components/ui/LoadingState";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Resource {
  id: string;
  category_id: string;
  title: string;
  description: string;
  url: string;
  resource_type: "tool" | "template" | "guide" | "video" | "link" | "document";
}

const typeMap: Record<string, { label: string; icon: LucideIcon }> = {
  tool: { label: "Tool", icon: LinkIcon },
  template: { label: "Template", icon: FileText },
  guide: { label: "Guide", icon: BookOpen },
  video: { label: "Video", icon: Video },
  link: { label: "External Link", icon: ExternalLink },
  document: { label: "Document", icon: Download },
};

export default function ResourcesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const catData = await api.get("/categories");
        setCategories(catData || []);

        const resData = await api.get("/resources?page_size=50");
        setResources(resData.data || []);
      } catch (err: unknown) {
        console.error("Resources Fetch Error:", err);
        setError("Unable to load resources.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredResources = resources.filter((res) => {
    const matchCat = !selectedCategory || res.category_id === selectedCategory;
    const matchType = !selectedType || res.resource_type === selectedType;
    return matchCat && matchType;
  });



  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-4">
          Founder Resource Directory
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Curated collection of tools, legal templates, registration portals, calculators, and scaling frameworks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filtering panel sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          {/* Category Filter */}
          <div className="border border-border bg-card/40 rounded-xl p-5">
            <h3 className="text-sm font-bold text-foreground mb-4 inline-flex items-center">
              <Filter className="mr-2 h-4 w-4 text-primary" /> Filter by Category
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`w-full text-left text-xs font-semibold px-3 py-2 rounded-lg transition-colors ${
                  !selectedCategory ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full text-left text-xs font-semibold px-3 py-2 rounded-lg transition-colors ${
                    selectedCategory === cat.id ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Resource Type Filter */}
          <div className="border border-border bg-card/40 rounded-xl p-5">
            <h3 className="text-sm font-bold text-foreground mb-4 inline-flex items-center">
              <Filter className="mr-2 h-4 w-4 text-primary" /> Resource Type
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedType(null)}
                className={`w-full text-left text-xs font-semibold px-3 py-2 rounded-lg transition-colors ${
                  !selectedType ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"
                }`}
              >
                All Types
              </button>
              {Object.keys(typeMap).map((key) => (
                <button
                  key={key}
                  onClick={() => setSelectedType(key)}
                  className={`w-full text-left text-xs font-semibold px-3 py-2 rounded-lg transition-colors ${
                    selectedType === key ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"
                  }`}
                >
                  {typeMap[key].label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Resources Grid */}
        <section className="lg:col-span-3">
          {isLoading ? (
            <LoadingState type="card-skeleton" />
          ) : error ? (
            <StateCard 
              type="error" 
              title="Connection Error" 
              message={`${error} Retry to load local fallbacks.`} 
              action={{ label: "Retry", onClick: () => window.location.reload() }} 
            />
          ) : filteredResources.length === 0 ? (
            <StateCard type="empty" title="No Resources" message="No resources match your filters. Try resetting the filter options." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredResources.map((res) => {
                const info = typeMap[res.resource_type] || { label: "Link", icon: ExternalLink };
                const IconComponent = info.icon;
                return (
                  <div
                    key={res.id}
                    className="flex flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <div>
                      <div className="inline-flex items-center space-x-1 bg-primary/10 text-primary px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-4">
                        <IconComponent className="h-3 w-3 mr-1" /> {info.label}
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-2">
                        {res.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {res.description}
                      </p>
                    </div>

                    {res.url && (
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-6 font-semibold text-primary text-xs inline-flex items-center hover:underline border-t border-border pt-4"
                      >
                        Visit Resource <ExternalLink className="ml-1 h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
