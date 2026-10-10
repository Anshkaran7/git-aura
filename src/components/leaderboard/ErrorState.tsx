import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message: string;
  actionLabel?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Leaderboard unavailable",
  message,
  actionLabel = "Try again",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="gh-box px-4 py-12 text-center">
      <AlertCircle className="mx-auto mb-3 h-6 w-6 text-danger" />
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
        {message}
      </p>
      {onRetry ? (
        <Button onClick={onRetry} variant="outline" size="sm" className="mt-4">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
