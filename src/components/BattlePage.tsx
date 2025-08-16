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
import { useToast } from "../hooks/useToast";
import { ToastContainer } from "./Toast";

type MetricResult = {
  key: string;
  label: string;
  value1: number | string;
  value2: number | string;
  winner: "user1" | "user2" | null;
  description?: string;
};

type BattleResult = {
  user1: GitHubProfile;
  user2: GitHubProfile;
  results: MetricResult[];
  winner: "user1" | "user2" | null;
  metrics?: {
    user1Wins: number;
    user2Wins: number;
    totalMetrics: number;
    note?: string;
  };
};

export default function BattlePage() {
  const [user1, setUser1] = useState("");
  const [user2, setUser2] = useState("");
  const [result, setResult] = useState<BattleResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const battleRef = useRef<HTMLDivElement>(null);
  const { toasts, addToast, removeToast } = useToast();

  const handleBattle = async () => {
    if (!user1.trim() || !user2.trim()) {
      addToast("error", "Invalid Input", "Please enter both usernames");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(
        `/api/battle?user1=${user1.trim()}&user2=${user2.trim()}`
      );
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 404) {
          addToast(
            "error",
            "User Not Found",
            data.error || "One or both usernames do not exist on GitHub"
          );
        } else {
          addToast(
            "error",
            "Battle Failed",
            data.error || "Failed to compare profiles. Please try again."
          );
        }
        setLoading(false);
        return;
      }

      setResult(data);
      addToast(
        "success",
        "Battle Complete!",
        `Successfully compared ${user1} vs ${user2}`
      );
    } catch (error) {
      console.error("Battle error:", error);
      addToast(
        "error",
        "Battle Failed",
        "An unexpected error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleShareResult = async () => {
    if (!battleRef.current || !result) return;

    try {
      setIsGenerating(true);
      const dataUrl = await toPng(battleRef.current, {
        cacheBust: true,
        backgroundColor: "#000000",
        pixelRatio: 2,
        skipFonts: false,
      });
      const link = document.createElement("a");
      link.download = `github-battle-result.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to export battle image:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-[95vw] sm:max-w-[90vw] md:max-w-5xl lg:max-w-6xl mx-auto py-4 sm:py-6 md:py-8 px-2 sm:px-4 md:px-6">
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Page Header */}
      <div className="mb-8 sm:mb-12 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
          GitHub 1v1 Battle
        </h1>
        <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Enter two GitHub usernames and see a comprehensive head‑to‑head
          breakdown. We compare 8 metrics including contributions, stars,
          repositories, and more!
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
          className="w-64 md:w-72 bg-gray-900/60 border-gray-700 text-white placeholder:text-gray-500"
          disabled={loading}
        />
        <span className="font-bold text-xl md:text-2xl text-gray-400">VS</span>
        <Input
          placeholder="GitHub Username 2"
          value={user2}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setUser2(e.target.value.replace(/https?:\/\/github.com\//, ""))
          }
          className="w-64 md:w-72 bg-gray-900/60 border-gray-700 text-white placeholder:text-gray-500"
          disabled={loading}
        />
        <Button
          onClick={handleBattle}
          disabled={!user1.trim() || !user2.trim() || loading}
          className="md:ml-2 bg-blue-600 hover:bg-blue-700 text-white"
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
                title: "Enhanced Metrics",
                body: "8 metrics: Aura, Contributions, Repos, Stars, Gists, Followers & more!",
              },
              {
                title: "Smart Comparison",
                body: "We analyze contributions, repository quality, and community engagement for fair battles.",
              },
              {
                title: "Real-time Data",
                body: "Fresh data from GitHub API including recent contributions and repository statistics.",
              },
              {
                title: "Rate Limits",
                body: "Unauthenticated: 60/hour per IP. Add GITHUB_TOKEN for higher limits & detailed data.",
              },
              {
                title: "Fair Play",
                body: "We consider repository quality, contribution consistency, and community impact.",
              },
              {
                title: "Pro Tip",
                body: "Active contributions + quality repos often beats raw numbers. Consistency matters!",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-gray-800 bg-gray-900/40 p-4 md:p-5 hover:border-gray-700 transition-colors"
              >
                <h3 className="text-sm font-semibold text-white mb-1.5 tracking-wide">
                  {f.title}
                </h3>
                <p className="text-xs md:text-sm leading-relaxed text-gray-400">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-[11px] md:text-xs text-gray-500 text-center">
            Data is fetched live from GitHub REST & GraphQL APIs. Enhanced
            metrics require GitHub token.
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
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 backdrop-blur-sm p-4 md:p-6 mb-6 sm:mb-8">
              <BattleResultTable results={result.results || []} />
            </div>

            {/* Winner Explanation */}
            {result && (
              <div className="mt-6 max-w-3xl mx-auto text-sm md:text-base text-gray-300 leading-relaxed mb-8 sm:mb-10">
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
                        <p className="font-semibold text-white">
                          Overall Winner:{" "}
                          <span className="text-yellow-300">
                            {overall === "user1"
                              ? result.user1.login
                              : result.user2.login}
                          </span>{" "}
                          ({result.metrics?.user1Wins || 0} -{" "}
                          {result.metrics?.user2Wins || 0})
                        </p>
                      )}
                      {user1Wins.length > 0 && (
                        <p>
                          <span className="text-white font-medium">
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
                          <span className="text-white font-medium">
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
                        We compare {result.metrics?.totalMetrics || 0} metrics
                        including contributions, repository quality, and
                        community engagement. Aura is a composite score based on
                        activity patterns and consistency.
                      </p>
                      {result.metrics?.note && (
                        <div className="mt-3 p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                          <p className="text-xs text-blue-300">
                            ℹ️ {result.metrics.note}
                          </p>
                        </div>
                      )}
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
                className="border-gray-600 text-gray-300 hover:text-white hover:border-gray-500"
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
                className="bg-gray-700 hover:bg-gray-600 text-white"
              >
                Rematch
              </Button>
              <Link href="/leaderboard">
                <Button
                  variant="ghost"
                  className="text-gray-300 hover:text-white hover:bg-gray-800"
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
