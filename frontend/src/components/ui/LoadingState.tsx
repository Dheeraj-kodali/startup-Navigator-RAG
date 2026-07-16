import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  type?: "spinner" | "card-skeleton" | "table-skeleton";
  text?: string;
}

export function LoadingState({ type = "spinner", text = "Loading..." }: LoadingStateProps) {
  if (type === "spinner") {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
        <p className="text-sm font-medium">{text}</p>
      </div>
    );
  }

  if (type === "card-skeleton") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-6 space-y-4 animate-pulse">
            <div className="h-12 w-12 rounded-lg bg-muted" />
            <div className="h-6 w-3/4 rounded bg-muted" />
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-muted" />
              <div className="h-4 w-5/6 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "table-skeleton") {
    return (
      <div className="w-full space-y-4 animate-pulse">
        <div className="h-12 bg-muted rounded-xl w-full" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 bg-card border border-border rounded-xl w-full" />
        ))}
      </div>
    );
  }

  return null;
}
