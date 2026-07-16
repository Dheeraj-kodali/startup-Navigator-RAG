"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { BarChart3, FileText, FolderClosed, ShieldAlert, ArrowLeft, Database, Activity } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
      </div>
    );
  }

  // Block unauthorized users immediately
  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return (
      <div className="mx-auto max-w-md text-center py-24 px-4">
        <ShieldAlert className="mx-auto h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground mt-2">Only system administrators can access this section.</p>
        <Link href="/" className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          Go Back Home
        </Link>
      </div>
    );
  }

  const sidebarLinks = [
    { name: "Overview", href: "/admin", icon: BarChart3 },
    { name: "Articles CRUD", href: "/admin/articles", icon: FileText },
    { name: "Resources CRUD", href: "/admin/resources", icon: FolderClosed },
    { name: "AI Analytics", href: "/admin/analytics", icon: Activity },
  ];


  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 md:grid-cols-4 gap-8">
      {/* Sidebar Navigation */}
      <aside className="md:col-span-1 border border-border bg-card rounded-xl p-5 h-fit space-y-6">
        <div>
          <h2 className="text-lg font-bold text-foreground">Admin Portal</h2>
          <p className="text-xs text-muted-foreground mt-1">Manage navigator database</p>
        </div>
        <div className="space-y-2">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted ${
                  isActive ? "bg-muted text-primary font-semibold" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>
        <div className="border-t border-border pt-4">
          <Link href="/" className="flex items-center space-x-2 text-xs text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Exit Admin Panel</span>
          </Link>
        </div>
      </aside>

      {/* Main Admin Content Area */}
      <main className="md:col-span-3">
        {children}
      </main>
    </div>
  );
}
