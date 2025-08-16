"use client";
import React, { useState, useRef, useCallback, useMemo } from "react";
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

  // Memoized validation state
  const validationState = useMemo(() => {
    const trimmedUser1 = user1.trim();
    const trimmedUser2 = user2.trim();
    const usernameRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;

    return {
      bothFilled: trimmedUser1 && trimmedUser2,
      sameUser: trimmedUser1.toLowerCase() === trimmedUser2.toLowerCase(),
      validUser1: usernameRegex.test(trimmedUser1),
      validUser2: usernameRegex.test(trimmedUser2),
      canBattle:
        trimmedUser1 &&
        trimmedUser2 &&
        trimmedUser1.toLowerCase() !== trimmedUser2.toLowerCase() &&
        usernameRegex.test(trimmedUser1) &&
        usernameRegex.test(trimmedUser2),
    };
  }, [user1, user2]);

  const handleBattle = useCallback(async () => {
    const trimmedUser1 = user1.trim();
    const trimmedUser2 = user2.trim();

    // Use pre-computed validation state
    if (!validationState.canBattle) {
      if (!validationState.bothFilled) {
        addToast("error", "Invalid Input", "Please enter both usernames");
      } else if (validationState.sameUser) {
        addToast(
          "error",
          "Same User",
          "Please enter different usernames for comparison"
        );
      } else if (!validationState.validUser1) {
        addToast(
          "error",
          "Invalid Username",
          `"${trimmedUser1}" is not a valid GitHub username`
        );
      } else if (!validationState.validUser2) {
        addToast(
          "error",
          "Invalid Username",
          `"${trimmedUser2}" is not a valid GitHub username`
        );
      }
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const res = await fetch(
        `/api/battle?user1=${encodeURIComponent(
          trimmedUser1
        )}&user2=${encodeURIComponent(trimmedUser2)}`,
        { signal: controller.signal }
      );

      clearTimeout(timeoutId);
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 404) {
          addToast(
            "error",
            "User Not Found",
            data.error || "One or both usernames do not exist on GitHub"
          );
        } else if (res.status === 429) {
          addToast(
            "error",
            "Rate Limited",
            "GitHub API rate limit exceeded. Please try again in a few minutes."
          );
        } else {
          addToast(
            "error",
            "Battle Failed",
            data.error || "Failed to compare profiles. Please try again."
          );
        }
        return;
      }

      setResult(data);
      addToast(
        "success",
        "Battle Complete!",
        `Successfully compared ${trimmedUser1} vs ${trimmedUser2}`
      );
    } catch (error) {
      console.error("Battle error:", error);
      if (error instanceof Error && error.name === "AbortError") {
        addToast(
          "error",
          "Request Timeout",
          "The battle took too long to complete. Please try again."
        );
      } else {
        addToast(
          "error",
          "Battle Failed",
          "An unexpected error occurred. Please check your internet connection and try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }, [user1, user2, addToast, validationState.canBattle]);

  const handleShareResult = useCallback(async () => {
    if (!battleRef.current || !result) return;

    try {
      setIsGenerating(true);
      const dataUrl = await toPng(battleRef.current, {
        cacheBust: true,
        backgroundColor: "#000000",
        pixelRatio: 2,
        skipFonts: false,
        width: battleRef.current.offsetWidth,
        height: battleRef.current.offsetHeight,
      });
      const link = document.createElement("a");
      link.download = `github-battle-${result.user1.login}-vs-${result.user2.login}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      addToast(
        "success",
        "Image Downloaded",
        "Battle result image saved successfully!"
      );
    } catch (err) {
      console.error("Failed to export battle image:", err);
      addToast(
        "error",
        "Export Failed",
        "Failed to generate image. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  }, [result, addToast]);

  const handleReset = useCallback(() => {
    setUser1("");
    setUser2("");
    setResult(null);
  }, []);

  // Memoized info cards to prevent re-rendering
  const infoCards = useMemo(
    () => [
      {
        title: "🎯 5 Core Metrics",
        body: "Aura • Contributions • Stars • Issues • PRs • Followers",
      },
      {
        title: "⚡ Live Data",
        body: "Real-time GitHub stats with smart quality analysis",
      },
      {
        title: "🏆 Fair Battles",
        body: "Quality over quantity - consistency beats raw numbers",
      },
      {
        title: "🚀 Pro Tips",
        body: "Active daily commits + quality repos = higher Aura score",
      },
    ],
    []
  );

  return (
    <div className="max-w-[95vw] sm:max-w-[90vw] md:max-w-5xl lg:max-w-6xl mx-auto py-4 sm:py-6 md:py-8 px-2 sm:px-4 md:px-6">
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Page Header */}
      <div className="mb-8 sm:mb-12 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 sm:mb-6">
          GitHub 1v1 Battle
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
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
          onKeyDown={(e) => {
            if (e.key === "Enter" && validationState.canBattle && !loading) {
              handleBattle();
            }
          }}
          className={`w-64 md:w-72 bg-card/60 text-foreground placeholder:text-muted-foreground transition-colors ${
            user1.trim() && !validationState.validUser1
              ? "border-red-500"
              : validationState.sameUser && user1.trim() && user2.trim()
              ? "border-yellow-500"
              : "border-border focus:border-blue-500"
          }`}
          disabled={loading}
        />
        <span className="font-bold text-xl md:text-2xl text-muted-foreground">
          VS
        </span>
        <Input
          placeholder="GitHub Username 2"
          value={user2}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setUser2(e.target.value.replace(/https?:\/\/github.com\//, ""))
          }
          onKeyDown={(e) => {
            if (e.key === "Enter" && validationState.canBattle && !loading) {
              handleBattle();
            }
          }}
          className={`w-64 md:w-72 bg-card/60 text-foreground placeholder:text-muted-foreground transition-colors ${
            user2.trim() && !validationState.validUser2
              ? "border-red-500"
              : validationState.sameUser && user1.trim() && user2.trim()
              ? "border-yellow-500"
              : "border-border focus:border-blue-500"
          }`}
          disabled={loading}
        />
        <Button
          onClick={handleBattle}
          disabled={!validationState.canBattle || loading}
          className="md:ml-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Comparing...
            </>
          ) : (
            "Compare"
          )}
        </Button>
      </motion.div>

      {/* Validation Feedback */}
      {(user1.trim() || user2.trim()) && !validationState.canBattle && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          {validationState.sameUser && user1.trim() && user2.trim() && (
            <p className="text-yellow-600 dark:text-yellow-400 text-sm">
              ⚠️ Please enter different usernames for comparison
            </p>
          )}
          {user1.trim() && !validationState.validUser1 && (
            <p className="text-red-600 dark:text-red-400 text-sm">
              ❌ "{user1.trim()}" is not a valid GitHub username
            </p>
          )}
          {user2.trim() && !validationState.validUser2 && (
            <p className="text-red-600 dark:text-red-400 text-sm">
              ❌ "{user2.trim()}" is not a valid GitHub username
            </p>
          )}
        </motion.div>
      )}

      {/* Info Cards - Only show when no result */}
      {!result && (
        <div className="mx-auto max-w-4xl mb-8 sm:mb-12">
          <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
            {infoCards.map((f) => (
              <div
                key={f.title}
                className="rounded-lg border border-border bg-card/30 p-3 hover:border-border/80 hover:bg-card/50 transition-all duration-200"
              >
                <h3 className="text-xs font-medium text-foreground mb-1 tracking-wide">
                  {f.title}
                </h3>
                <p className="text-xs leading-snug text-muted-foreground">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[10px] text-muted-foreground text-center">
            Star our repo on GitHub to support us!
            <a
              href="https://github.com/anshkaran7/git-aura"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-foreground text-xs hover:bg-muted"
              >
                Star on GitHub
              </Button>
            </a>
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
              <span className="font-bold text-3xl md:text-4xl text-muted-foreground">
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

                  // Handle tie case
                  if (!winners.length) {
                    return (
                      <div className="text-center space-y-4">
                        <div className="text-6xl mb-4">🤝</div>
                        <p className="text-xl font-semibold text-yellow-600 dark:text-yellow-300">
                          It's a Perfect Tie!
                        </p>
                        <p className="text-muted-foreground">
                          Both developers are equally matched across all
                          metrics. This is rare and shows both have similar
                          skill levels and activity patterns.
                        </p>
                        <div className="mt-4 p-4 bg-yellow-500/10 dark:bg-yellow-900/20 border border-yellow-500/30 dark:border-yellow-700/30 rounded-lg">
                          <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            🏆 When there's a tie, both developers win! Great
                            work to both {result.user1.login} and{" "}
                            {result.user2.login}!
                          </p>
                        </div>
                      </div>
                    );
                  }

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
                      {overall ? (
                        <p className="font-semibold text-foreground text-center">
                          🏆 Overall Winner:{" "}
                          <span className="text-yellow-600 dark:text-yellow-300 text-lg">
                            {overall === "user1"
                              ? result.user1.login
                              : result.user2.login}
                          </span>{" "}
                          <span className="text-muted-foreground">
                            ({result.metrics?.user1Wins || 0} -{" "}
                            {result.metrics?.user2Wins || 0})
                          </span>
                        </p>
                      ) : (
                        <div className="text-center space-y-2">
                          <p className="text-xl font-semibold text-yellow-600 dark:text-yellow-300">
                            🤝 It's a Tie!
                          </p>
                          <p className="text-muted-foreground">
                            Both developers scored equally (
                            {result.metrics?.user1Wins || 0} -{" "}
                            {result.metrics?.user2Wins || 0})
                          </p>
                        </div>
                      )}
                      {user1Wins.length > 0 && (
                        <p>
                          <span className="text-foreground font-medium">
                            {result.user1.login}
                          </span>{" "}
                          led in:
                          <span className="text-foreground">
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
                          <span className="text-muted-foreground">
                            {" "}
                            {list(user2Wins)}
                          </span>
                          .
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        We compare {result.metrics?.totalMetrics || 0} metrics
                        including contributions, repository quality, and
                        community engagement. Aura is a composite score based on
                        activity patterns and consistency.
                      </p>
                      {result.metrics?.note && (
                        <div className="mt-3 p-3 bg-blue-500/10 dark:bg-blue-900/20 border border-blue-500/30 dark:border-blue-700/30 rounded-lg">
                          <p className="text-xs text-blue-700 dark:text-blue-300">
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
              >
                {isGenerating ? "Generating..." : "Share Result"}
              </Button>
              <Button
                variant="secondary"
                onClick={handleReset}
                className="bg-secondary hover:bg-secondary/80 text-secondary-foreground"
              >
                Rematch
              </Button>
              <Link href={`${user1.trim()}/leaderboard`}>
                <Button variant="ghost">Leaderboard</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
