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
import { toPng } from "html-to-image";
import {
  Download01Icon,
  FireIcon,
  GithubIcon,
  RankingIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import BattleResultTable from "./BattleResultTable";
import { ToastContainer } from "./Toast";
import { Button } from "./ui/button";
import { HugeIcon } from "./ui/huge-icon";
import { Input } from "./ui/input";
import { UserAvatar } from "./ui/user-avatar";
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
    body: "Aura, contributions, stars, issues, merged PRs, and followers.",
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
    body: "Download the comparison as an image once it is complete.",
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

    // Re-submitting the same pair after a failure should retry the request
    // (the query key would otherwise be unchanged and never refetch).
    if (
      submittedBattle &&
      submittedBattle.first === validationState.first &&
      submittedBattle.second === validationState.second
    ) {
      handledErrorKeyRef.current = null;
      void battleQuery.refetch();
      return;
    }

    setSubmittedBattle({
      first: validationState.first,
      second: validationState.second,
    });
  }, [addToast, battleQuery, submittedBattle, validationState]);

  const handleShareResult = useCallback(async () => {
    if (!battleRef.current || !result) {
      return;
    }

    try {
      setIsGenerating(true);
      const dataUrl = await toPng(battleRef.current, {
        cacheBust: true,
        backgroundColor:
          getComputedStyle(document.body).backgroundColor || "#0d1117",
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

  const renderUsernameInput = (
    id: string,
    label: string,
    value: string,
    setValue: (value: string) => void,
    isValid: boolean,
    placeholder: string
  ) => {
    const hasValue = Boolean(value.trim());
    const invalid = hasValue && !isValid;
    const duplicate = validationState.sameUser && validationState.bothFilled;

    return (
      <div className="min-w-0 space-y-1.5">
        <label htmlFor={id} className="text-xs font-semibold text-foreground">
          {label}
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-2 flex items-center">
            {hasValue && isValid ? (
              <UserAvatar
                githubUsername={value}
                className="h-5 w-5"
                initialsClassName="text-[9px] tracking-normal"
                size={40}
              />
            ) : (
              <span className="w-5 text-center text-sm text-muted-foreground">
                @
              </span>
            )}
          </span>
          <Input
            id={id}
            placeholder={placeholder}
            value={value}
            autoComplete="off"
            spellCheck={false}
            onChange={(event) => setValue(sanitizeUsername(event.target.value))}
            onKeyDown={(event) => {
              if (event.key === "Enter" && validationState.canBattle && !loading) {
                handleBattle();
              }
            }}
            aria-invalid={invalid || undefined}
            className={`pl-9 ${
              invalid
                ? "border-danger focus-visible:border-danger"
                : duplicate
                  ? "border-attention"
                  : ""
            }`}
            disabled={loading}
          />
        </div>
      </div>
    );
  };

  const winnerProfile =
    result?.winner === "user1"
      ? result.user1
      : result?.winner === "user2"
        ? result.user2
        : null;
  const user1WinCount =
    result?.metrics?.user1Wins ?? winnerBreakdown?.user1Wins.length ?? 0;
  const user2WinCount =
    result?.metrics?.user2Wins ?? winnerBreakdown?.user2Wins.length ?? 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <section className="border-b border-border pb-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Compare developers
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Run a head-to-head on Aura, contributions, pull requests, issues,
          stars and followers.
        </p>
      </section>

      <div className="gh-box mt-6">
        <div className="gh-box-header">
          <h2 className="text-sm font-semibold text-foreground">
            Choose two GitHub usernames
          </h2>
          {refreshing && (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-3 w-3 animate-spin rounded-full border border-muted-foreground/30 border-t-muted-foreground" />
              Refreshing
            </span>
          )}
        </div>
        <div className="p-4">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto] sm:items-end">
            {renderUsernameInput(
              "battle-user-1",
              "Developer A",
              user1,
              setUser1,
              validationState.validUser1,
              "octocat"
            )}
            <span className="hidden h-8 items-center text-sm font-medium text-muted-foreground sm:flex">
              vs
            </span>
            {renderUsernameInput(
              "battle-user-2",
              "Developer B",
              user2,
              setUser2,
              validationState.validUser2,
              "torvalds"
            )}
            <Button
              onClick={handleBattle}
              disabled={!validationState.canBattle || loading}
              className="w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border border-current/40 border-t-current" />
                  Comparing...
                </>
              ) : (
                "Compare"
              )}
            </Button>
          </div>

          {(user1.trim() || user2.trim()) && !validationState.canBattle && (
            <div className="mt-3 space-y-0.5 text-xs">
              {validationState.sameUser && validationState.bothFilled && (
                <p className="text-attention">
                  Choose two different usernames for a real comparison.
                </p>
              )}
              {user1.trim() && !validationState.validUser1 && (
                <p className="text-danger">
                  <span className="font-mono">{validationState.first}</span> is
                  not a valid GitHub username.
                </p>
              )}
              {user2.trim() && !validationState.validUser2 && (
                <p className="text-danger">
                  <span className="font-mono">{validationState.second}</span> is
                  not a valid GitHub username.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="gh-box mt-6 overflow-hidden" aria-busy="true">
          <div className="gh-box-header">
            <div className="h-4 w-40 animate-pulse rounded bg-accent" />
          </div>
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-4 border-t border-border-muted px-4 py-3 first:border-t-0"
            >
              <div className="h-3.5 w-32 animate-pulse rounded bg-accent" />
              <div className="flex gap-6">
                <div className="h-3.5 w-14 animate-pulse rounded bg-accent" />
                <div className="h-3.5 w-14 animate-pulse rounded bg-accent" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!result && !loading && (
        <div className="gh-box mt-6">
          <div className="gh-box-header">
            <h2 className="text-sm font-semibold text-foreground">
              How the comparison works
            </h2>
          </div>
          <ul className="grid sm:grid-cols-2">
            {infoCards.map((card, index) => (
              <li
                key={card.title}
                className={`flex gap-3 px-4 py-3 ${
                  index > 0 ? "border-t border-border-muted" : ""
                } ${index === 1 ? "sm:border-t-0" : ""} ${
                  index % 2 === 1 ? "sm:border-l" : ""
                }`}
              >
                <HugeIcon
                  icon={card.icon}
                  size={16}
                  className="mt-0.5 shrink-0 text-muted-foreground"
                />
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {card.title}
                  </h3>
                  <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                    {card.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result && (
        <>
          <div className="mt-6">
          {/* No margin on the captured node: html-to-image keeps it and clips the export */}
          <section ref={battleRef} className="space-y-4 bg-background">
            <div className="gh-box flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                {winnerProfile ? (
                  <UserAvatar
                    src={winnerProfile.avatar_url}
                    githubUsername={winnerProfile.login}
                    displayName={winnerProfile.name}
                    className="h-10 w-10"
                    size={80}
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-canvas-subtle">
                    <HugeIcon
                      icon={RankingIcon}
                      size={16}
                      className="text-muted-foreground"
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">
                    {winnerProfile ? "Winner" : "Result"}
                  </p>
                  <p className="truncate text-base font-semibold text-foreground">
                    {winnerProfile ? (
                      <>
                        <a
                          href={`https://github.com/${winnerProfile.login}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-link"
                        >
                          {winnerProfile.name || winnerProfile.login}
                        </a>{" "}
                        <span className="font-normal text-muted-foreground">
                          @{winnerProfile.login}
                        </span>
                      </>
                    ) : (
                      "It's a tie"
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-foreground">
                  {result.user1.login}
                </span>
                <span
                  className={`font-semibold tabular-nums ${
                    result.winner === "user1"
                      ? "text-success"
                      : "text-foreground"
                  }`}
                >
                  {user1WinCount}
                </span>
                <span className="text-muted-foreground">–</span>
                <span
                  className={`font-semibold tabular-nums ${
                    result.winner === "user2"
                      ? "text-success"
                      : "text-foreground"
                  }`}
                >
                  {user2WinCount}
                </span>
                <span className="font-medium text-foreground">
                  {result.user2.login}
                </span>
              </div>
            </div>

            <BattleResultTable
              results={result.results || []}
              user1={result.user1}
              user2={result.user2}
            />

            <div className="gh-box p-4 text-sm">
              {!winnerBreakdown?.decisiveResults.length ? (
                <p className="text-muted-foreground">
                  Both developers landed with the same outcome across the
                  evaluated metrics.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {winnerBreakdown.user1Wins.length > 0 && (
                    <p className="text-muted-foreground">
                      <span className="font-semibold text-foreground">
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
                    <p className="text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        {result.user2.login}
                      </span>{" "}
                      led in{" "}
                      {winnerBreakdown.user2Wins
                        .map((item) => formatMetricLabel(item))
                        .join(", ")}
                      .
                    </p>
                  )}
                </div>
              )}
              <p className="mt-3 border-t border-border-muted pt-3 text-xs text-muted-foreground">
                Compared across {result.metrics?.totalMetrics || 0} metrics.
                {result.metrics?.note ? ` ${result.metrics.note}.` : ""}
              </p>
            </div>
          </section>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => void handleShareResult()}
              disabled={isGenerating}
            >
              <HugeIcon icon={Download01Icon} size={16} />
              {isGenerating ? "Generating image..." : "Download result"}
            </Button>
            <Button variant="outline" onClick={handleReset}>
              New battle
            </Button>
            <Button variant="ghost" asChild>
              <Link href={`/${result.user1.login}/leaderboard`}>
                View leaderboard
              </Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
