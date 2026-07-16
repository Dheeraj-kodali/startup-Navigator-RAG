import { AlertCircle, FileQuestion, RefreshCw } from "lucide-react";

interface StateCardProps {
  type: "error" | "empty";
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function StateCard({ type, title, message, action }: StateCardProps) {
  const Icon = type === "error" ? AlertCircle : FileQuestion;
  const isError = type === "error";

  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 rounded-xl border ${isError ? 'border-destructive/20 bg-destructive/5' : 'border-border bg-card'}`}>
      <div className={`inline-flex rounded-full p-4 mb-4 ${isError ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}>
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-6">{message}</p>
      
      {action && (
        <button
          onClick={action.onClick}
          className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            isError 
              ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' 
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          }`}
        >
          {isError && (action.label.toLowerCase().includes('retry') || action.label.toLowerCase().includes('try again')) && <RefreshCw className="mr-2 h-4 w-4" />}
          {action.label}
        </button>
      )}
    </div>
  );
}
