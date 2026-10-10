import { Suspense } from "react";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import BattlePage from "@/components/BattlePage";

export default function Battle() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Suspense
        fallback={
          <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
            <div className="gh-box flex items-center justify-center gap-2 px-4 py-10 text-sm text-muted-foreground">
              <span className="h-4 w-4 animate-spin rounded-full border border-muted-foreground/30 border-t-muted-foreground" />
              Loading battle page...
            </div>
          </div>
        }
      >
        <Header leaderboard={false} dashboard={true} />
        <main className="flex-1">
          <BattlePage />
        </main>
      </Suspense>
      <Footer />
    </div>
  );
}
