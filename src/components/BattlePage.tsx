"use client";
import React, { useState, useRef } from "react";
import Link from "next/link";
import GitHubProfileCard from "./GitHubProfileCard";
import BattleResultTable from "./BattleResultTable";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import type { GitHubProfile } from "./types";
import { motion, AnimatePresence } from "framer-motion";
import { toPng } from "html-to-image";

type MetricResult = {
  key: string;
  label: string;
  value1: number | string;
  value2: number | string;
  winner: "user1" | "user2" | null;
};

type BattleResult = {
  user1: GitHubProfile;
  user2: GitHubProfile;
  results: MetricResult[];
  winner: "user1" | "user2" | null;
};

export default function BattlePage() {
  const [user1, setUser1] = useState("");
  const [user2, setUser2] = useState("");
  const [result, setResult] = useState<BattleResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const battleRef = useRef<HTMLDivElement>(null);

  const handleBattle = async () => {
    setLoading(true);
    setResult(null);
    const res = await fetch(`/api/battle?user1=${user1}&user2=${user2}`);
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  const handleShareResult = async () => {
    if (!battleRef.current || !result) return;

    try {
      setIsGenerating(true);

      // Generate image from the battle result
      const dataUrl = await toPng(battleRef.current, {
        cacheBust: true,
        backgroundColor: "#000000",
        pixelRatio: 2,
        skipFonts: false,
      });

      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      // Upload image
      const formData = new FormData();
      formData.append("image", blob);
      formData.append(
        "name",
        `battle-${result.user1.login}-vs-${result.user2.login}`
      );

      const uploadResponse = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      if (uploadResponse.ok) {
        const uploadData = await uploadResponse.json();
        const imageUrl = uploadData.url;

        // Create share URL with image
        const shareUrl = `${window.location.origin}/battle?user1=${
          result.user1.login
        }&user2=${result.user2.login}&og_image=${encodeURIComponent(imageUrl)}`;

        // Copy to clipboard
        await navigator.clipboard.writeText(shareUrl);

        // Show success message (you can use toast here)
        alert("Battle result link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing result:", error);
      alert("Failed to share result. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-[95vw] sm:max-w-[90vw] md:max-w-5xl lg:max-w-6xl mx-auto py-4 sm:py-6 md:py-8 px-2 sm:px-4 md:px-6">
      {/* Page Header */}
      <div className="mb-8 sm:mb-12 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 sm:mb-6">
          GitHub 1v1 Battle
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Enter two GitHub usernames and see a head‑to‑head breakdown. We
          highlight the winner per metric and overall — no login required.
        </p>
      </div>

      {/* Battle Input Form */}
      <motion.div
        className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 mb-8 sm:mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Input
          placeholder="GitHub Username 1"
          value={user1}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setUser1(e.target.value.replace(/https?:\/\/github.com\//, ""))
          }
          className="w-64 md:w-72 bg-card border-border text-foreground placeholder:text-muted-foreground"
          disabled={loading}
        />
        <span className="font-bold text-xl md:text-2xl text-muted-foreground">VS</span>
        <Input
          placeholder="GitHub Username 2"
          value={user2}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setUser2(e.target.value.replace(/https?:\/\/github.com\//, ""))
          }
          className="w-64 md:w-72 bg-card border-border text-foreground placeholder:text-muted-foreground"
          disabled={loading}
        />
        <Button
          onClick={handleBattle}
          disabled={!user1 || !user2 || loading}
          className="md:ml-2"
        >
          {loading ? "Comparing..." : "Compare"}
        </Button>
      </motion.div>

      {/* Info Cards - Only show when no result */}
      {!result && (
        <div className="mx-auto max-w-5xl mb-8 sm:mb-14">
          <div className="grid gap-4 md:gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Metrics Compared",
                body: "Repos, followers, following, gists, total stars*, account age & aura (if present).",
              },
              {
                title: "Tie Handling",
                body: "Equal values count as a draw for that metric — no points awarded.",
              },
              {
                title: "Stars Note *",
                body: "Stars are summed from public non‑fork repos (approximate on first load).",
              },
              {
                title: "Rate Limits",
                body: "Unauthenticated requests: 60/hour per IP. Add a GITHUB_TOKEN for higher limits.",
              },
              {
                title: "Fair Play",
                body: "Recently renamed or empty accounts may appear weaker — activity history matters.",
              },
              {
                title: "Pro Tip",
                body: "Consistent contributions + diverse repos often beats raw repo count.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-border bg-card p-4 md:p-5 hover:border-primary/50 transition-colors"
              >
                <h3 className="text-sm font-semibold text-foreground mb-1.5 tracking-wide">
                  {f.title}
                </h3>
                <p className="text-xs md:text-sm leading-relaxed text-muted-foreground">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-[11px] md:text-xs text-muted-foreground text-center">
            Data is fetched live from the GitHub REST API. Cached briefly in
            memory for performance.
          </p>
        </div>
      )}

      {/* Battle Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            ref={battleRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.35 }}
            className="w-full"
          >
            {/* Profile Cards */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-10 mb-8 sm:mb-10">
              <motion.div
                animate={result.winner === "user1" ? { scale: 1.03 } : {}}
                transition={{ duration: 0.3 }}
              >
                <GitHubProfileCard
                  profile={result.user1}
                  highlight={result.winner === "user1"}
                />
              </motion.div>
              <span className="font-bold text-3xl md:text-4xl text-gray-500">
                VS
              </span>
              <motion.div
                animate={result.winner === "user2" ? { scale: 1.03 } : {}}
                transition={{ duration: 0.3 }}
              >
                <GitHubProfileCard
                  profile={result.user2}
                  highlight={result.winner === "user2"}
                />
              </motion.div>
            </div>

            {/* Battle Results Table */}
            <div className="rounded-xl border border-border bg-card backdrop-blur-sm p-4 md:p-6 mb-6 sm:mb-8">
              <BattleResultTable results={result.results || []} />
            </div>

            {/* Winner Explanation */}
            {result && (
              <div className="mt-6 max-w-3xl mx-auto text-sm md:text-base text-muted-foreground leading-relaxed mb-8 sm:mb-10">
                {(() => {
                  const winners = (result.results || []).filter(
                    (r) => r.winner
                  );
                  if (!winners.length)
                    return (
                      <p>
                        No decisive metrics — it's a draw. Try users with more
                        activity.
                      </p>
                    );
                  const user1Wins = winners.filter((r) => r.winner === "user1");
                  const user2Wins = winners.filter((r) => r.winner === "user2");
                  const overall = result.winner;
                  const explainMetric = (r: any) => {
                    if (r.key === "created_at")
                      return `${r.label}: older account advantage`;
                    return `${r.label}`;
                  };
                  const list = (arr: any[]) =>
                    arr.map((r) => explainMetric(r)).join(", ");
                  return (
                    <div className="space-y-3">
                      {overall && (
                        <p className="font-semibold text-foreground">
                          Overall Winner:{" "}
                          <span className="text-yellow-300">
                            {overall === "user1"
                              ? result.user1.login
                              : result.user2.login}
                          </span>
                        </p>
                      )}
                      {user1Wins.length > 0 && (
                        <p>
                          <span className="text-foreground font-medium">
                            {result.user1.login}
                          </span>{" "}
                          led in:
                          <span className="text-gray-200">
                            {" "}
                            {list(user1Wins)}
                          </span>
                          .
                        </p>
                      )}
                      {user2Wins.length > 0 && (
                        <p>
                          <span className="text-foreground font-medium">
                            {result.user2.login}
                          </span>{" "}
                          led in:
                          <span className="text-gray-200">
                            {" "}
                            {list(user2Wins)}
                          </span>
                          .
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Older account age wins that metric; aura is a composite
                        bonus from repos, followers & bio.
                      </p>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <Button
                variant="outline"
                onClick={handleShareResult}
                disabled={isGenerating}
                
              >
                {isGenerating ? "Generating..." : "Share Result"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setUser1("");
                  setUser2("");
                  setResult(null);
                }}
              >
                Rematch
              </Button>
              <Link href="/leaderboard">
                <Button
                  variant="ghost"
                >
                  Leaderboard
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
