"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { toPng } from "html-to-image";
import {
  ArrowRight01Icon,
  FireIcon,
  GithubIcon,
  RankingIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import BattleResultTable from "./BattleResultTable";
import GitHubProfileCard from "./GitHubProfileCard";
import { ToastContainer } from "./Toast";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { HugeIcon } from "./ui/huge-icon";
import { Input } from "./ui/input";
import { useToast } from "../hooks/useToast";
import type { GitHubProfile } from "./types";

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

type SubmittedBattle = {
  first: string;
  second: string;
};

class BattleRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "BattleRequestError";
    this.status = status;
  }
}

const USERNAME_REGEX =
  /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;

const infoCards = [
  {
    title: "Balanced scoring",
    body: "Aura, contributions, repos, stars, issues, PRs, followers, and account age.",
    icon: RankingIcon,
  },
  {
    title: "Live fetch",
    body: "Pulls fresh GitHub data and gracefully handles timeouts or rate limits.",
    icon: GithubIcon,
  },
  {
    title: "Fairer battles",
    body: "Highlights consistency and output instead of rewarding noise alone.",
    icon: FireIcon,
  },
  {
    title: "Share-ready",
    body: "Export the result card once the comparison is complete.",
    icon: SparklesIcon,
  },
];

function sanitizeUsername(value: string) {
  return value.trim().replace(/^https?:\/\/github\.com\//i, "").replace(/\/$/, "");
}

function formatMetricLabel(result: MetricResult) {
  if (result.key === "created_at") {
    return `${result.label} (older account)`;
  }

  return result.label;
}

async function fetchBattleResult({
  first,
  second,
}: SubmittedBattle): Promise<BattleResult> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(
      `/api/battle?user1=${encodeURIComponent(first)}&user2=${encodeURIComponent(
        second
      )}`,
      { signal: controller.signal }
    );
    const data = await response.json();

    if (!response.ok) {
      throw new BattleRequestError(
        data.error || "Unable to compare these profiles right now.",
        response.status
      );
    }

    return data;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new BattleRequestError(
        "The comparison took too long. Please try again.",
        408
      );
    }

    if (error instanceof BattleRequestError) {
      throw error;
    }

    throw new BattleRequestError(
      "Please check your connection and try again.",
      500
    );
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export default function BattlePage() {
  const [user1, setUser1] = useState("");
  const [user2, setUser2] = useState("");
  const [submittedBattle, setSubmittedBattle] = useState<SubmittedBattle | null>(
    null
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const battleRef = useRef<HTMLDivElement>(null);
  const { toasts, addToast, removeToast } = useToast();
  const queryClient = useQueryClient();
  const handledSuccessKeyRef = useRef<string | null>(null);
  const handledErrorKeyRef = useRef<string | null>(null);

  const validationState = useMemo(() => {
    const first = sanitizeUsername(user1);
    const second = sanitizeUsername(user2);
    const sameUser = first.toLowerCase() === second.toLowerCase();
    const validUser1 = USERNAME_REGEX.test(first);
    const validUser2 = USERNAME_REGEX.test(second);

    return {
      first,
      second,
      sameUser,
      validUser1,
      validUser2,
      bothFilled: Boolean(first && second),
      canBattle:
        Boolean(first && second) &&
        !sameUser &&
        validUser1 &&
        validUser2,
    };
  }, [user1, user2]);

  const comparisonKey = submittedBattle
    ? `${submittedBattle.first}:${submittedBattle.second}`
    : null;

  const battleQuery = useQuery({
    queryKey: ["battle", submittedBattle?.first, submittedBattle?.second],
    queryFn: () => {
      if (!submittedBattle) {
        throw new Error("No battle submitted.");
      }

      return fetchBattleResult(submittedBattle);
    },
    enabled: Boolean(submittedBattle),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 0,
    placeholderData: keepPreviousData,
  });

  const result = battleQuery.data ?? null;
  const loading = battleQuery.isFetching && !battleQuery.data;
  const refreshing = battleQuery.isFetching && Boolean(battleQuery.data);

  const winnerBreakdown = useMemo(() => {
    if (!result) {
      return null;
    }

    const decisiveResults = (result.results || []).filter((item) => item.winner);
    const user1Wins = decisiveResults.filter((item) => item.winner === "user1");
    const user2Wins = decisiveResults.filter((item) => item.winner === "user2");

    return {
      user1Wins,
      user2Wins,
      decisiveResults,
    };
  }, [result]);

  useEffect(() => {
    if (!validationState.canBattle) {
      return;
    }

    const timer = window.setTimeout(() => {
      void queryClient.prefetchQuery({
        queryKey: ["battle", validationState.first, validationState.second],
        queryFn: () =>
          fetchBattleResult({
            first: validationState.first,
            second: validationState.second,
          }),
        staleTime: 5 * 60 * 1000,
      });
    }, 450);

    return () => window.clearTimeout(timer);
  }, [
    queryClient,
    validationState.canBattle,
    validationState.first,
    validationState.second,
  ]);

  useEffect(() => {
    if (!comparisonKey) {
      return;
    }

    if (battleQuery.data && handledSuccessKeyRef.current !== comparisonKey) {
      handledSuccessKeyRef.current = comparisonKey;
      handledErrorKeyRef.current = null;
      addToast(
        "success",
        "Comparison ready",
        `${submittedBattle?.first} vs ${submittedBattle?.second} is ready.`
      );
    }
  }, [addToast, battleQuery.data, comparisonKey, submittedBattle?.first, submittedBattle?.second]);

  useEffect(() => {
    if (!comparisonKey || !battleQuery.error) {
      return;
    }

    if (handledErrorKeyRef.current === comparisonKey) {
      return;
    }

    handledErrorKeyRef.current = comparisonKey;
    handledSuccessKeyRef.current = null;

    const error = battleQuery.error;
    if (error instanceof BattleRequestError) {
      if (error.status === 404) {
        addToast("error", "User not found", error.message);
      } else if (error.status === 429) {
        addToast(
          "error",
          "Rate limited",
          "GitHub is rate limiting requests right now. Try again shortly."
        );
      } else if (error.status === 408) {
        addToast("error", "Request timed out", error.message);
      } else {
        addToast("error", "Battle failed", error.message);
      }
      return;
    }

    addToast("error", "Battle failed", "Unable to compare these profiles.");
  }, [addToast, battleQuery.error, comparisonKey]);

  const handleBattle = useCallback(() => {
    if (!validationState.canBattle) {
      if (!validationState.bothFilled) {
        addToast("error", "Missing usernames", "Enter both GitHub usernames.");
      } else if (validationState.sameUser) {
        addToast("error", "Same account", "Choose two different developers.");
      } else if (!validationState.validUser1) {
        addToast(
          "error",
          "Invalid username",
          `"${validationState.first}" is not a valid GitHub username.`
        );
      } else if (!validationState.validUser2) {
        addToast(
          "error",
          "Invalid username",
          `"${validationState.second}" is not a valid GitHub username.`
        );
      }
      return;
    }

    setSubmittedBattle({
      first: validationState.first,
      second: validationState.second,
    });
  }, [addToast, validationState]);

  const handleShareResult = useCallback(async () => {
    if (!battleRef.current || !result) {
      return;
    }

    try {
      setIsGenerating(true);
      const dataUrl = await toPng(battleRef.current, {
        cacheBust: true,
        backgroundColor: "#0a0a0a",
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

      addToast("success", "Image downloaded", "Battle card saved as PNG.");
    } catch {
      addToast(
        "error",
        "Export failed",
        "Could not generate the battle image. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  }, [addToast, result]);

  const handleReset = useCallback(() => {
    setUser1("");
    setUser2("");
    setSubmittedBattle(null);
    handledSuccessKeyRef.current = null;
    handledErrorKeyRef.current = null;
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <section className="mb-8">
        <div className="mx-auto max-w-3xl text-center">
          <Badge
            variant="outline"
            className="rounded-full border-border bg-card px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground"
          >
            GitHub battle
          </Badge>
          <h1 className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">
            Compare two GitHub profiles without the noise.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-[15px]">
            Run a clean head-to-head on contribution quality, repo output,
            followership, and Aura signals in one place.
          </p>
        </div>
      </section>

      <Card className="rounded-[30px] border-border/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-4 shadow-[0_30px_90px_-65px_rgba(15,23,42,0.55)] sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_1.1fr_auto] lg:items-end">
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              First developer
            </label>
            <Input
              placeholder="octocat"
              value={user1}
              onChange={(event) => setUser1(sanitizeUsername(event.target.value))}
              onKeyDown={(event) => {
                if (event.key === "Enter" && validationState.canBattle && !loading) {
                  handleBattle();
                }
              }}
              className={
                user1.trim() && !validationState.validUser1
                  ? "border-red-500/40"
                  : validationState.sameUser && validationState.bothFilled
                    ? "border-amber-500/40"
                    : undefined
              }
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Second developer
            </label>
            <Input
              placeholder="torvalds"
              value={user2}
              onChange={(event) => setUser2(sanitizeUsername(event.target.value))}
              onKeyDown={(event) => {
                if (event.key === "Enter" && validationState.canBattle && !loading) {
                  handleBattle();
                }
              }}
              className={
                user2.trim() && !validationState.validUser2
                  ? "border-red-500/40"
                  : validationState.sameUser && validationState.bothFilled
                    ? "border-amber-500/40"
                    : undefined
              }
              disabled={loading}
            />
          </div>

          <Button
            onClick={handleBattle}
            disabled={!validationState.canBattle || loading}
            className="h-11 min-w-[148px]"
          >
            {loading ? "Comparing..." : "Compare"}
            {!loading && <HugeIcon icon={ArrowRight01Icon} size={16} />}
          </Button>
        </div>

        {refreshing && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            <div className="h-2 w-2 animate-pulse rounded-full bg-foreground/60" />
            Refreshing comparison
          </div>
        )}

        {(user1.trim() || user2.trim()) && !validationState.canBattle && (
          <div className="mt-4 rounded-2xl border border-border bg-background px-4 py-3 text-xs text-muted-foreground">
            {validationState.sameUser && validationState.bothFilled && (
              <p>Choose two different usernames for a real comparison.</p>
            )}
            {user1.trim() && !validationState.validUser1 && (
              <p>`{validationState.first}` is not a valid GitHub username.</p>
            )}
            {user2.trim() && !validationState.validUser2 && (
              <p>`{validationState.second}` is not a valid GitHub username.</p>
            )}
          </div>
        )}
      </Card>

      {!result && (
        <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {infoCards.map((card) => (
            <Card
              key={card.title}
              className="rounded-[24px] border-border/80 bg-card/70 p-5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-background">
                <HugeIcon icon={card.icon} size={17} className="text-primary" />
              </div>
              <h2 className="mt-4 text-sm font-semibold text-foreground">
                {card.title}
              </h2>
              <p className="mt-2 text-xs leading-5 text-muted-foreground sm:text-[13px]">
                {card.body}
              </p>
            </Card>
          ))}
        </section>
      )}

      <AnimatePresence>
        {result && (
          <motion.section
            ref={battleRef}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.28 }}
            className="mt-8 space-y-6"
          >
            <div className="grid gap-5 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
              <GitHubProfileCard
                profile={result.user1}
                highlight={result.winner === "user1"}
              />
              <div className="flex items-center justify-center">
                <span className="rounded-full border border-border bg-card px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                  Versus
                </span>
              </div>
              <GitHubProfileCard
                profile={result.user2}
                highlight={result.winner === "user2"}
              />
            </div>

            <BattleResultTable results={result.results || []} />

            <Card className="rounded-[26px] border-border/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-5 sm:p-6">
              {!winnerBreakdown?.decisiveResults.length ? (
                <div className="text-center">
                  <h2 className="text-lg font-semibold">It&apos;s a tie.</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Both developers landed with the same outcome across the
                    evaluated metrics.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className="rounded-full border-border bg-background px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
                    >
                      Summary
                    </Badge>
                    <p className="text-sm font-medium text-foreground">
                      Winner:{" "}
                      {result.winner === "user1"
                        ? result.user1.login
                        : result.user2.login}
                    </p>
                  </div>

                  {winnerBreakdown.user1Wins.length > 0 && (
                    <p className="text-sm leading-6 text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {result.user1.login}
                      </span>{" "}
                      led in{" "}
                      {winnerBreakdown.user1Wins
                        .map((item) => formatMetricLabel(item))
                        .join(", ")}
                      .
                    </p>
                  )}

                  {winnerBreakdown.user2Wins.length > 0 && (
                    <p className="text-sm leading-6 text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {result.user2.login}
                      </span>{" "}
                      led in{" "}
                      {winnerBreakdown.user2Wins
                        .map((item) => formatMetricLabel(item))
                        .join(", ")}
                      .
                    </p>
                  )}

                  <p className="text-xs leading-5 text-muted-foreground">
                    Compared across {result.metrics?.totalMetrics || 0} metrics
                    including Aura, activity, repository output, and community
                    reach.
                  </p>

                  {result.metrics?.note && (
                    <div className="rounded-2xl border border-border bg-background px-4 py-3 text-xs leading-5 text-muted-foreground">
                      {result.metrics.note}
                    </div>
                  )}
                </div>
              )}
            </Card>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                variant="secondary"
                onClick={() => void handleShareResult()}
                disabled={isGenerating}
              >
                {isGenerating ? "Generating image..." : "Download result"}
              </Button>
              <Button variant="outline" onClick={handleReset}>
                New battle
              </Button>
              <Link href={`/${result.user1.login}/leaderboard`}>
                <Button variant="ghost" className="w-full sm:w-auto">
                  View leaderboard
                </Button>
              </Link>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
