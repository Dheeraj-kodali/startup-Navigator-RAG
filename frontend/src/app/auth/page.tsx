"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { api } from "@/lib/api";
import { Mail, Lock, User as UserIcon, ArrowRight, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { LoadingState } from "@/components/ui/LoadingState";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const { login } = useAuth();

  // Mode state: 'signin' | 'signup' | 'forgot'
  const modeParam = searchParams.get("mode");
  const initialMode = modeParam === "signup" || modeParam === "forgot" ? modeParam : "signin";
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">(initialMode);
  
  // Form input states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
  // Feedback states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (mode === "signin") {
        const data = await api.post("/auth/login", { email, password });
        await login(data.access_token, data.refresh_token);
        router.push(redirect);
      } else if (mode === "signup") {
        await api.post("/auth/register", { email, password, name });
        setSuccessMsg("Account created! You can now sign in.");
        setMode("signin");
        setPassword("");
      } else if (mode === "forgot") {
        const response = await api.post("/auth/forgot-password", { email });
        setSuccessMsg("If this account exists, a password reset link has been generated.");
        console.log("Reset token:", response.message); // Log reset token for local test/dev
      }
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
      } else {
        setErrorMsg("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-8 flex flex-col justify-center min-h-[calc(100vh-250px)]">
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-2">
          {mode === "signin" && "Welcome Back"}
          {mode === "signup" && "Create Founder Account"}
          {mode === "forgot" && "Reset Password"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {mode === "signin" && "Sign in to access your dashboard, bookmarks, and search history."}
          {mode === "signup" && "Get started today with guides, calculators, and AI assistance."}
          {mode === "forgot" && "Enter your registered email and we'll send a password recovery token."}
        </p>
      </div>

      <div className="border border-border bg-card rounded-xl p-6 shadow-md">
        {/* Error/Success Feedbacks */}
        {errorMsg && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 mb-4 text-xs text-destructive flex items-center font-medium">
            <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="rounded-lg border border-secondary/20 bg-secondary/10 p-3 mb-4 text-xs text-secondary flex items-center font-medium">
            <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field (Sign Up only) */}
          {mode === "signup" && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Full Name
              </label>
              <div className="relative flex items-center">
                <UserIcon className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  required
                  placeholder="Steve Jobs"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-transparent py-2.5 pl-10 pr-4 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                required
                placeholder="founder@apple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-border bg-transparent py-2.5 pl-10 pr-4 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Password Field (Sign In & Sign Up only) */}
          {mode !== "forgot" && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Password
                </label>
                {mode === "signin" && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot");
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-border bg-transparent py-2.5 pl-10 pr-4 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground shadow hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>
                  {mode === "signin"
                    ? "Sign In"
                    : mode === "signup"
                    ? "Create Account"
                    : "Reset Password"}
                </span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Mode Toggles */}
        <div className="border-t border-border mt-6 pt-4 text-center text-xs text-muted-foreground">
          {mode === "signin" && (
            <p>
              Don&apos;t have an account?{" "}
              <button
                onClick={() => {
                  setMode("signup");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="font-bold text-primary hover:underline"
              >
                Sign Up
              </button>
            </p>
          )}
          {mode === "signup" && (
            <p>
              Already have an account?{" "}
              <button
                onClick={() => {
                  setMode("signin");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="font-bold text-primary hover:underline"
              >
                Sign In
              </button>
            </p>
          )}
          {mode === "forgot" && (
            <button
              onClick={() => {
                setMode("signin");
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="font-bold text-primary hover:underline"
            >
              Back to Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<LoadingState type="spinner" />}>
      <AuthForm />
    </Suspense>
  );
}
