import { AlertCircleIcon } from "@hugeicons/core-free-icons";
import { HugeIcon } from "@/components/ui/huge-icon";
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
    <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5 text-center sm:p-6">
      <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-rose-500/20 bg-rose-500/10 text-rose-300">
        <HugeIcon icon={AlertCircleIcon} size={20} />
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-muted-foreground">
        {message}
      </p>
      {onRetry ? (
        <Button
          onClick={onRetry}
          variant="outline"
          size="sm"
          className="mt-4 h-8 rounded-full px-3 text-xs"
        >
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
