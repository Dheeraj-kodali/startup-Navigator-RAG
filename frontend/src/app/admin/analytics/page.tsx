"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { api } from "@/lib/api";
import { Clock, Search, FileText, Cpu, Database, Server, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";

const LineChart = dynamic(() => import("recharts").then(mod => mod.LineChart), { ssr: false });
const Line = dynamic(() => import("recharts").then(mod => mod.Line), { ssr: false });
const XAxis = dynamic(() => import("recharts").then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then(mod => mod.Tooltip), { ssr: false });
const Legend = dynamic(() => import("recharts").then(mod => mod.Legend), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then(mod => mod.ResponsiveContainer), { ssr: false });
const BarChart = dynamic(() => import("recharts").then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then(mod => mod.Bar), { ssr: false });
const PieChart = dynamic(() => import("recharts").then(mod => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then(mod => mod.Pie), { ssr: false });
const Cell = dynamic(() => import("recharts").then(mod => mod.Cell), { ssr: false });

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function AnalyticsDashboard() {
  const [data, setData] = useState<any>(null);
  const [timeRange, setTimeRange] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const response = await api.get(`/analytics/dashboard?time_range=${timeRange}`);
        setData(response);
      } catch (error) {
        console.error("Failed to load analytics dashboard:", error);
        toast.error("Unable to load analytics dashboard data.");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [timeRange]);

  if (isLoading && !data) {
    return (
      <div className="flex h-[400px] flex-col space-y-4 items-center justify-center text-muted-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm">Loading statistics and charts...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-[400px] flex-col space-y-4 items-center justify-center text-muted-foreground">
        <Server className="h-12 w-12 opacity-20 mb-2" />
        <h4 className="text-base font-semibold text-foreground">No analytics available yet</h4>
        <p className="text-sm">Usage statistics will appear here once users interact with the system.</p>
      </div>
    );
  }

  const { metrics, charts, top_documents, recent_activity } = data;

  // Pie chart data formatting
  const kbVsGenAI = [
    { name: "Knowledge Base", value: metrics.kb_searches },
    { name: "General AI", value: metrics.general_searches }
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-8">
      {/* Header and Filter */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">AI Search Analytics</h1>
          <p className="text-muted-foreground mt-1">Track usage, performance, and insights from your RAG pipeline.</p>
        </div>
        <div className="relative inline-block w-40">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="block w-full appearance-none rounded-lg border border-border bg-card px-4 py-2.5 pr-8 text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="today">Today</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Searches" value={metrics.total_searches} icon={Search} color="text-blue-500" />
        <StatCard title="Knowledge Base AI" value={metrics.kb_searches} icon={Database} color="text-green-500" />
        <StatCard title="General AI Fallback" value={metrics.general_searches} icon={Cpu} color="text-orange-500" />
        <StatCard title="Indexed Documents" value={metrics.indexed_documents} subtitle={`of ${metrics.uploaded_documents} uploaded`} icon={FileText} color="text-purple-500" />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Avg. Embedding Time</h3>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-foreground">{metrics.average_embedding_time}</span>
            <span className="text-sm text-muted-foreground">ms</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Vector generation latency</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Avg. Retrieval Time</h3>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-foreground">{metrics.average_retrieval_time}</span>
            <span className="text-sm text-muted-foreground">ms</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">ChromaDB semantic search</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Avg. LLM Generation</h3>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-foreground">{metrics.average_generation_time}</span>
            <span className="text-sm text-muted-foreground">ms</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Groq completion latency</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Searches Per Day Line Chart */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-bold text-foreground mb-4">Searches Over Time</h3>
          <div className="h-[300px] w-full">
            {charts.searches_per_day.length === 0 ? (
              <EmptyChartState />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.searches_per_day}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Search Source Donut Chart */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-bold text-foreground mb-4">Knowledge Source Distribution</h3>
          <div className="h-[300px] w-full">
            {kbVsGenAI.length === 0 ? (
              <EmptyChartState />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={kbVsGenAI}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {kbVsGenAI.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top 10 Topics Bar Chart */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-bold text-foreground mb-4">Top 10 Searched Queries</h3>
          <div className="h-[300px] w-full">
            {charts.top_topics.length === 0 ? (
              <EmptyChartState />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.top_topics} layout="vertical" margin={{ left: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#374151" />
                  <XAxis type="number" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="topic" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} width={120} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                  />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Document Types Pie Chart */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-bold text-foreground mb-4">Uploaded File Types</h3>
          <div className="h-[300px] w-full">
            {charts.doc_types.length === 0 ? (
              <EmptyChartState />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.doc_types}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="count"
                    nameKey="type"
                    labelLine={true}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {charts.doc_types.map((entry: unknown, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Used Documents Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm flex flex-col">
          <div className="p-5 border-b border-border bg-muted/20">
            <h3 className="text-sm font-bold text-foreground">Top Cited Documents</h3>
            <p className="text-xs text-muted-foreground mt-1">Files most frequently retrieved by RAG</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Document Title</th>
                  <th className="px-5 py-3 font-medium">Citations</th>
                  <th className="px-5 py-3 font-medium">Avg Similarity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {top_documents.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-5 py-8 text-center text-muted-foreground">No document citations yet</td>
                  </tr>
                ) : (
                  top_documents.map((doc: any, i: number) => (
                    <tr key={i} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3 font-medium text-foreground max-w-[200px] truncate" title={doc.name}>📄 {doc.name}</td>
                      <td className="px-5 py-3 text-foreground">{doc.times_retrieved}</td>
                      <td className="px-5 py-3 text-foreground">{doc.average_similarity}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Search Activity Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm flex flex-col">
          <div className="p-5 border-b border-border bg-muted/20">
            <h3 className="text-sm font-bold text-foreground">Live Search Feed</h3>
            <p className="text-xs text-muted-foreground mt-1">Real-time view of what users are asking</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">User</th>
                  <th className="px-5 py-3 font-medium">Query</th>
                  <th className="px-5 py-3 font-medium">Source</th>
                  <th className="px-5 py-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recent_activity.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">No recent search activity</td>
                  </tr>
                ) : (
                  recent_activity.map((act: any, i: number) => (
                    <tr key={i} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3 text-muted-foreground">{act.user}</td>
                      <td className="px-5 py-3 font-medium text-foreground max-w-[150px] truncate" title={act.question}>{act.question}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          act.knowledge_source === 'Knowledge Base' 
                            ? 'bg-green-500/10 text-green-500' 
                            : 'bg-orange-500/10 text-orange-500'
                        }`}>
                          {act.knowledge_source === 'Knowledge Base' ? 'KB' : 'AI'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground text-xs">{new Date(act.time).toLocaleTimeString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, color }: { title: string, value: number, subtitle?: string, icon: any, color: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <div className="mt-3">
        <span className="text-3xl font-bold tracking-tight text-foreground">{value}</span>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}

function EmptyChartState() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
      <Server className="h-8 w-8 mb-2 opacity-20" />
      <span className="text-sm">Not enough data to display</span>
    </div>
  );
}
