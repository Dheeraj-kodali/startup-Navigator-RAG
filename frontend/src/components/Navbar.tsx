"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { Menu, X, Sun, Moon, Sparkles, BookOpen, Compass, Info, Mail, LogOut, User as UserIcon, Shield, Database, Network } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

  const navLinks = [
    { name: "Explore", href: "/", icon: Compass },
    { name: "Architecture", href: "/architecture", icon: Network },
    { name: "AI Search", href: "/ai-search", icon: Sparkles },
    { name: "Knowledge Base", href: "/knowledge", icon: Database },
    { name: "Resources", href: "/resources", icon: BookOpen },
    { name: "About", href: "/about", icon: Info },
    { name: "Contact", href: "/contact", icon: Mail },
  ];

  const visibleLinks = [...navLinks];
  if (user && (user.role === "admin" || user.role === "super_admin")) {
    visibleLinks.push({ name: "Admin Portal", href: "/admin", icon: Shield });
  }


  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "border-b border-border bg-background/80 backdrop-blur-md py-4"
          : "bg-transparent py-6"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-xl font-bold tracking-tight text-transparent">
              Startup Navigator
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-6">
            {visibleLinks.map((link) => {
              const Icon = link.icon;
              const isActive = link.href === "/" 
                ? pathname === "/" 
                : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center space-x-1.5 text-sm font-medium transition-colors hover:text-primary ${
                    isActive ? "text-primary font-semibold" : "text-muted-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}

            <span className="h-5 w-px bg-border" />

            {/* Session Actions */}
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-xs text-muted-foreground flex items-center space-x-1.5 bg-muted px-2.5 py-1.5 rounded-lg border border-border">
                  <UserIcon className="h-3.5 w-3.5" />
                  <span>{user.name}</span>
                </span>
                <button
                  onClick={logout}
                  className="text-xs font-semibold text-muted-foreground hover:text-destructive transition-colors flex items-center space-x-1"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth?redirect=/"
                  className="rounded-lg border border-border px-3.5 py-1.5 text-xs font-semibold hover:bg-muted transition-colors text-foreground"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth?redirect=/"
                  className="rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile Hamburger Menu Toggle */}
          <div className="flex md:hidden items-center space-x-4">
            <button
              onClick={() => setIsDark(!isDark)}
              className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground focus:outline-none p-1"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden border-b border-border bg-background px-4 pt-2 pb-4 space-y-2">
          {visibleLinks.map((link) => {
            const Icon = link.icon;
            const isActive = link.href === "/" 
              ? pathname === "/" 
              : pathname.startsWith(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-base font-medium transition-colors hover:bg-muted ${
                  isActive ? "bg-muted text-primary font-semibold" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{link.name}</span>
              </Link>
            );
          })}

          <div className="border-t border-border pt-4 mt-2">
            {user ? (
              <div className="flex flex-col space-y-3 px-3">
                <span className="text-xs text-muted-foreground">Logged in as {user.name}</span>
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="flex items-center space-x-2 text-sm text-destructive font-semibold"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3 px-3">
                <Link
                  href="/auth?redirect=/"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center rounded-lg border border-border py-2 text-sm font-semibold hover:bg-muted text-foreground"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth?redirect=/"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

