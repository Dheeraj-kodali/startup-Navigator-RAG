"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { api } from "@/lib/api";

interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin" | "super_admin";
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, refreshToken: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Routes that require authentication
const PROTECTED_ROUTES = ["/bookmarks", "/profile"];
// Routes only admins can access
const ADMIN_ROUTES = ["/dashboard", "/admin"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setToken(null);
    setUser(null);
    router.push("/");
  }, [router]);

  useEffect(() => {
    async function loadUser() {
      const savedToken = localStorage.getItem("token");
      if (savedToken) {
        setToken(savedToken);
        try {
          // Fetch current user details
          const userData = await api.get("/auth/me");
          setUser(userData);
        } catch (err) {
          console.error("Token validation failed, logging out", err);
          logout();
        }
      }
      setIsLoading(false);
    }
    loadUser();
  }, [logout]);

  useEffect(() => {
    if (isLoading) return;

    // Check standard user protected routes
    if (!user && PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
      router.push(`/auth?redirect=${encodeURIComponent(pathname)}`);
    }

    // Check admin protected routes
    if (
      ADMIN_ROUTES.some((route) => pathname.startsWith(route)) &&
      (!user || (user.role !== "admin" && user.role !== "super_admin"))
    ) {
      router.push("/");
    }
  }, [user, pathname, isLoading, router]);

  const login = async (accessToken: string, refreshToken: string) => {
    localStorage.setItem("token", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    setToken(accessToken);
    try {
      const userData = await api.get("/auth/me");
      setUser(userData);
    } catch (err) {
      console.error("Load user profile failed", err);
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
