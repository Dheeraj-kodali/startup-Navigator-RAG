/**
 * Database and API communication client.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface FetchOptions extends RequestInit {
  token?: string;
}

export async function apiRequest<T = unknown>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  // Get token from localStorage if on client side
  let authHeader = {};
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      authHeader = { Authorization: `Bearer ${token}` };
    }
  }

  const headers = {
    "Content-Type": "application/json",
    ...authHeader,
    ...options.headers,
  };

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Something went wrong.");
    }

    return result.data;
  } catch (error: unknown) {
    console.error(`API Error [${endpoint}]:`, error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(String(error));
  }
}

export const api = {
  get: <T = unknown>(endpoint: string, options?: FetchOptions) =>
    apiRequest<T>(endpoint, { method: "GET", ...options }),
    
  post: <T = unknown>(endpoint: string, body?: unknown, options?: FetchOptions) =>
    apiRequest<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
      ...options,
    }),
    
  patch: <T = unknown>(endpoint: string, body?: unknown, options?: FetchOptions) =>
    apiRequest<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
      ...options,
    }),
    
  delete: <T = unknown>(endpoint: string, options?: FetchOptions) =>
    apiRequest<T>(endpoint, { method: "DELETE", ...options }),
};
