import { Suspense } from "react";
import { Header } from "@/components/home/header";
import BattlePage from "@/components/BattlePage";

export default function Battle() {
  return (
    <div className="min-h-screen bg-background">
      <div className="pt-20">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-screen bg-background">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading battle page...</p>
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
