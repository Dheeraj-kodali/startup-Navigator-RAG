"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Users, FileText, FolderCheck, Compass, MessageSquare } from "lucide-react";
import { StateCard } from "@/components/ui/StateCard";
import { LoadingState } from "@/components/ui/LoadingState";

interface Stats {
  overview: {
    total_users: number;
    total_articles: number;
    total_categories: number;
    total_resources: number;
    total_bookmarks: number;
  };
  recent_activity: Array<{
    id: string;
    description: string;
    created_at: string;
  }>;
}

interface SearchQueryLog {
  id: string;
  query: string;
  results_count: number;
  search_type: string;
  created_at: string;
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [searchLogs, setSearchLogs] = useState<SearchQueryLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAdminOverview() {
      try {
        const dashboardData = await api.get("/dashboard");
        setStats(dashboardData);

        // Fetch recent queries for analytics table
        const searchHistory = await api.get("/search/history?page_size=5");
        setSearchLogs(searchHistory.data || []);
      } catch (err) {
        console.error("Dashboard overview load failed:", err);
        setError("Unable to load dashboard data.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchAdminOverview();
  }, []);

  if (isLoading) {
    return <LoadingState type="card-skeleton" />;
  }

  if (error) {
    return (
      <StateCard 
        type="error" 
        title="Dashboard Error" 
        message={`${error} Please try again.`} 
        action={{ label: "Retry", onClick: () => window.location.reload() }} 
      />
    );
  }

  const kpis = [
    { label: "Total Users", value: stats?.overview.total_users || 0, icon: Users, color: "text-blue-500 bg-blue-500/10" },
    { label: "Articles", value: stats?.overview.total_articles || 0, icon: FileText, color: "text-purple-500 bg-purple-500/10" },
    { label: "Resources", value: stats?.overview.total_resources || 0, icon: FolderCheck, color: "text-emerald-500 bg-emerald-500/10" },
    { label: "Bookmarks", value: stats?.overview.total_bookmarks || 0, icon: Compass, color: "text-pink-500 bg-pink-500/10" },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Dashboard Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Platform-wide performance statistics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="border border-border bg-card rounded-xl p-5 shadow-sm flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${kpi.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{kpi.label}</span>
                <h3 className="text-2xl font-extrabold text-foreground mt-1">{kpi.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section (SVG custom rendering) */}
      <div className="border border-border bg-card rounded-xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-foreground mb-4">Daily Platform Traffic Trend</h3>
        <div className="h-48 w-full flex items-end justify-between px-4 pb-2 border-b border-l border-border relative">
          {/* Custom SVG Line Chart */}
          <svg className="absolute inset-0 h-full w-full px-4 pb-2" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path
              d="M 0 90 Q 20 60 40 40 T 80 20 T 100 10"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
            />
            <path
              d="M 0 90 Q 20 60 40 40 T 80 20 T 100 10 L 100 100 L 0 100 Z"
              fill="url(#grad)"
              opacity="0.15"
            />
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
          </svg>
          {/* Chart Y-axis guidelines */}
          <div className="absolute left-1 top-2 text-[9px] text-muted-foreground">High</div>
          <div className="absolute left-1 bottom-4 text-[9px] text-muted-foreground">Low</div>
          
          {/* X-axis labels */}
          <span className="text-[10px] text-muted-foreground z-10">Mon</span>
          <span className="text-[10px] text-muted-foreground z-10">Tue</span>
          <span className="text-[10px] text-muted-foreground z-10">Wed</span>
          <span className="text-[10px] text-muted-foreground z-10">Thu</span>
          <span className="text-[10px] text-muted-foreground z-10">Fri</span>
          <span className="text-[10px] text-muted-foreground z-10">Sat</span>
          <span className="text-[10px] text-muted-foreground z-10">Sun</span>
        </div>
      </div>

      {/* Grid: Search logs & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Search Analytics */}
        <div className="border border-border bg-card rounded-xl p-5 shadow-sm">
          <h3 className="text-base font-bold text-foreground mb-4">Search Analytics Log</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="pb-3 font-bold uppercase tracking-wider">Search Term</th>
                  <th className="pb-3 font-bold uppercase tracking-wider">Results</th>
                  <th className="pb-3 font-bold uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {searchLogs.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center">
                      <StateCard type="empty" title="No Search Logs" message="Search history is currently empty." />
                    </td>
                  </tr>
                ) : (
                  searchLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3 font-medium text-foreground">{log.query}</td>
                      <td className="py-3 text-muted-foreground">{log.results_count}</td>
                      <td className="py-3 text-muted-foreground">
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="border border-border bg-card rounded-xl p-5 shadow-sm">
          <h3 className="text-base font-bold text-foreground mb-4">Platform Event Feed</h3>
          <div className="space-y-4">
            {stats?.recent_activity.map((act) => (
              <div key={act.id} className="flex items-start space-x-3 text-xs">
                <div className="bg-primary/15 text-primary rounded p-1.5 mt-0.5">
                  <MessageSquare className="h-3.5 w-3.5" />
                </div>
                <div className="flex-grow">
                  <p className="font-semibold text-foreground">{act.description}</p>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(act.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
