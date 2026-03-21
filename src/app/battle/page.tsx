import { Suspense } from "react";
import { Header } from "@/components/home/header";
import BattlePage from "@/components/BattlePage";

export default function Battle() {
  return (
    <div className="min-h-screen bg-background">
      <div className="pt-20">
        <Suspense
          fallback={
            <div className="flex min-h-screen items-center justify-center bg-background px-4">
              <div className="rounded-[28px] border border-border bg-card px-8 py-10 text-center">
                <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border border-foreground/20 border-t-foreground" />
                <p className="text-sm text-muted-foreground">
                  Loading battle page...
                </p>
              </div>
            </div>
          }
        >
          <Header leaderboard={false} dashboard={true} />
          <BattlePage />
        </Suspense>
      </div>
    </div>
  );
}
