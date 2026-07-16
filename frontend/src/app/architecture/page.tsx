import { 
  Network, 
  Cpu, 
  Database, 
  Sparkles, 
  Layout, 
  Lock, 
  BookOpen, 
  Compass, 
  BarChart, 
  History, 
  Server, 
  ArrowDown, 
  MonitorSmartphone,
  Cloud,
  FileText,
  Search,
  Code2,
  Box
} from "lucide-react";

export default function ArchitecturePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Page Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
          System Architecture
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          A high-level overview of the Startup Navigator technology stack, workflows, and component interactions.
        </p>
      </div>

      {/* SYSTEM OVERVIEW */}
      <section className="space-y-8">
        <div className="flex items-center space-x-3 border-b border-border pb-4">
          <Network className="h-8 w-8 text-primary" />
          <h2 className="text-3xl font-bold tracking-tight text-foreground">System Overview</h2>
        </div>
        
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm flex flex-col items-center">
          <div className="flex flex-col items-center w-full max-w-2xl">
            {/* User */}
            <div className="bg-primary/10 border border-primary/20 text-primary font-bold px-8 py-4 rounded-xl flex items-center space-x-2">
              <MonitorSmartphone className="h-5 w-5" />
              <span>User</span>
            </div>
            
            <ArrowDown className="h-8 w-8 text-muted-foreground my-2" />
            
            {/* Next.js Frontend */}
            <div className="bg-card border-2 border-border shadow-sm text-foreground font-bold px-12 py-5 rounded-xl flex items-center space-x-2 w-full justify-center">
              <Layout className="h-6 w-6 text-blue-500" />
              <span className="text-lg">Next.js Frontend</span>
            </div>
            
            <ArrowDown className="h-8 w-8 text-muted-foreground my-2" />
            
            {/* FastAPI Backend */}
            <div className="bg-card border-2 border-border shadow-sm text-foreground font-bold px-12 py-5 rounded-xl flex items-center space-x-2 w-full justify-center mb-6">
              <Server className="h-6 w-6 text-emerald-500" />
              <span className="text-lg">FastAPI Backend</span>
            </div>
            
            {/* Backend Services Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              {[
                { name: "Authentication (JWT)", icon: Lock, color: "text-amber-500" },
                { name: "Articles CRUD", icon: FileText, color: "text-blue-500" },
                { name: "Resources CRUD", icon: BookOpen, color: "text-indigo-500" },
                { name: "Knowledge Base Upload", icon: Database, color: "text-emerald-500" },
                { name: "Document Parsing", icon: Code2, color: "text-orange-500" },
                { name: "Text Chunking", icon: Box, color: "text-purple-500" },
                { name: "Embedding Generation", icon: Network, color: "text-pink-500" },
                { name: "ChromaDB Vector Store", icon: Database, color: "text-cyan-500" },
                { name: "Similarity Search", icon: Search, color: "text-rose-500" },
                { name: "AI Fallback (Groq)", icon: Sparkles, color: "text-yellow-500" }
              ].map((service, idx) => (
                <div key={idx} className="bg-muted/50 border border-border/50 rounded-lg p-3 flex items-center space-x-3">
                  <service.icon className={`h-5 w-5 ${service.color}`} />
                  <span className="text-sm font-medium text-foreground">{service.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AI SEARCH WORKFLOW */}
      <section className="space-y-8">
        <div className="flex items-center space-x-3 border-b border-border pb-4">
          <Sparkles className="h-8 w-8 text-primary" />
          <h2 className="text-3xl font-bold tracking-tight text-foreground">AI Search Workflow</h2>
        </div>
        
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm overflow-x-auto">
          <div className="min-w-[600px] flex flex-col items-center">
            {/* Step 1 */}
            <div className="bg-primary text-primary-foreground font-bold px-6 py-3 rounded-lg shadow-sm flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>User Question</span>
            </div>
            
            <ArrowDown className="h-6 w-6 text-muted-foreground my-3" />
            
            {/* Step 2 */}
            <div className="bg-card border border-border font-bold px-6 py-3 rounded-lg shadow-sm flex items-center space-x-2">
              <Database className="h-5 w-5 text-emerald-500" />
              <span>Search ChromaDB</span>
            </div>
            
            <ArrowDown className="h-6 w-6 text-muted-foreground my-3" />
            
            {/* Decision */}
            <div className="bg-muted border border-border font-bold px-8 py-4 rounded-full shadow-sm">
              Relevant Documents?
            </div>
            
            {/* Branches */}
            <div className="flex w-full max-w-md justify-between relative mt-4">
              {/* Left Branch (Yes) */}
              <div className="flex flex-col items-center w-1/2 relative">
                <div className="absolute top-[-16px] left-1/2 w-full h-px bg-border -translate-x-1/2"></div>
                <div className="bg-background border border-border px-3 py-1 rounded text-xs font-bold mb-3 z-10 -mt-2">
                  Yes
                </div>
                <ArrowDown className="h-6 w-6 text-muted-foreground mb-3" />
                <div className="bg-card border-l-4 border-l-emerald-500 border-border p-4 rounded-lg shadow-sm text-center w-4/5">
                  <span className="font-bold text-foreground">Answer</span>
                  <p className="text-xs text-muted-foreground">from KB</p>
                </div>
              </div>

              {/* Right Branch (No) */}
              <div className="flex flex-col items-center w-1/2 relative">
                <div className="absolute top-[-16px] right-1/2 w-full h-px bg-border translate-x-1/2"></div>
                <div className="bg-background border border-border px-3 py-1 rounded text-xs font-bold mb-3 z-10 -mt-2">
                  No
                </div>
                <ArrowDown className="h-6 w-6 text-muted-foreground mb-3" />
                <div className="bg-card border-l-4 border-l-yellow-500 border-border p-4 rounded-lg shadow-sm text-center w-4/5 flex flex-col items-center">
                  <span className="font-bold text-foreground">Show</span>
                  <p className="text-xs text-muted-foreground mb-2">Generate with AI button</p>
                  <ArrowDown className="h-4 w-4 text-muted-foreground my-1" />
                  <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-md text-xs font-bold mt-1">
                    Groq Response
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TECH STACK */}
      <section className="space-y-8">
        <div className="flex items-center space-x-3 border-b border-border pb-4">
          <Cpu className="h-8 w-8 text-primary" />
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Tech Stack</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Frontend */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-bold text-foreground flex items-center mb-4">
              <Layout className="mr-2 h-5 w-5 text-blue-500" /> Frontend
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground font-medium">
              <li className="flex items-center"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2" />Next.js</li>
              <li className="flex items-center"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2" />React</li>
              <li className="flex items-center"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2" />Tailwind CSS</li>
            </ul>
          </div>
          
          {/* Backend */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-bold text-foreground flex items-center mb-4">
              <Server className="mr-2 h-5 w-5 text-emerald-500" /> Backend
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground font-medium">
              <li className="flex items-center"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" />FastAPI</li>
              <li className="flex items-center"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" />Python</li>
            </ul>
          </div>

          {/* Database */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-bold text-foreground flex items-center mb-4">
              <Database className="mr-2 h-5 w-5 text-purple-500" /> Database
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground font-medium">
              <li className="flex items-center"><div className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-2" />SQLite</li>
              <li className="flex items-center"><div className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-2" />ChromaDB</li>
            </ul>
          </div>

          {/* AI & Embeddings */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-bold text-foreground flex items-center mb-4">
              <Sparkles className="mr-2 h-5 w-5 text-yellow-500" /> AI & Embeddings
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground font-medium">
              <li className="flex items-center"><div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mr-2" />Groq API</li>
              <li className="flex items-center"><div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mr-2" />Sentence Transformers</li>
            </ul>
          </div>

          {/* Authentication */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-bold text-foreground flex items-center mb-4">
              <Lock className="mr-2 h-5 w-5 text-amber-500" /> Authentication
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground font-medium">
              <li className="flex items-center"><div className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2" />JWT</li>
            </ul>
          </div>

          {/* Deployment */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-bold text-foreground flex items-center mb-4">
              <Cloud className="mr-2 h-5 w-5 text-cyan-500" /> Deployment
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground font-medium">
              <li className="flex items-center"><div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mr-2" />Vercel</li>
              <li className="flex items-center"><div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mr-2" />Render</li>
            </ul>
          </div>
        </div>
      </section>

      {/* FEATURE FLOW */}
      <section className="space-y-8">
        <div className="flex items-center space-x-3 border-b border-border pb-4">
          <Compass className="h-8 w-8 text-primary" />
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Feature Flow</h2>
        </div>
        
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            {/* Authentication -> Everything */}
            <div className="bg-muted/30 border border-border rounded-xl p-5 relative z-10 flex flex-col justify-center items-center text-center">
              <Lock className="h-8 w-8 text-amber-500 mb-2" />
              <h3 className="font-bold text-foreground text-lg">Authentication</h3>
              <p className="text-xs text-muted-foreground mt-1">Controls access to features based on role</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Dashboard */}
              <div className="bg-background border border-border rounded-lg p-4 flex flex-col items-center text-center hover:border-primary transition-colors cursor-default">
                <BarChart className="h-6 w-6 text-indigo-500 mb-2" />
                <span className="font-semibold text-sm">Dashboard</span>
              </div>
              
              {/* AI Search & History */}
              <div className="bg-background border border-border rounded-lg p-4 flex flex-col items-center text-center hover:border-primary transition-colors cursor-default">
                <Sparkles className="h-6 w-6 text-yellow-500 mb-2" />
                <span className="font-semibold text-sm mb-1">AI Search</span>
                <div className="flex items-center text-[10px] text-muted-foreground border-t border-border w-full justify-center pt-1 mt-1">
                  <History className="h-3 w-3 mr-1" /> Search History
                </div>
              </div>
              
              {/* Knowledge Base */}
              <div className="bg-background border border-border rounded-lg p-4 flex flex-col items-center text-center hover:border-primary transition-colors cursor-default">
                <Database className="h-6 w-6 text-emerald-500 mb-2" />
                <span className="font-semibold text-sm">Knowledge Base</span>
              </div>
              
              {/* Articles & Resources */}
              <div className="bg-background border border-border rounded-lg p-4 flex flex-col items-center text-center hover:border-primary transition-colors cursor-default">
                <div className="flex space-x-2 mb-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <BookOpen className="h-5 w-5 text-purple-500" />
                </div>
                <span className="font-semibold text-sm">Articles & Resources</span>
              </div>
            </div>

            {/* Connecting lines for desktop view - visual only */}
            <div className="hidden md:block absolute top-1/2 left-[calc(50%-1.5rem)] w-6 h-px bg-border -translate-y-1/2 z-0"></div>
          </div>
        </div>
      </section>

    </div>
  );
}
