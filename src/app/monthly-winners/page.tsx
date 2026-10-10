"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toPng } from "html-to-image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Share2, Trophy } from "lucide-react";
import { Header, Footer } from "@/components/home";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";

interface BadgeType {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  rarity: string;
  rank: number;
}

interface User {
  id: string;
  displayName: string;
  githubUsername: string;
  avatarUrl: string;
  badges: BadgeType[];
}

interface MonthlyWinner {
  id: string;
  rank: 1 | 2 | 3;
  totalAura: number;
  contributionsCount: number;
  badgeAwarded: boolean;
  capturedAt: string;
  user: User;
}

interface MonthlyWinnersData {
  monthYear: string;
  winners: MonthlyWinner[];
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalMonths: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface MonthlyWinnersResponse {
  data: MonthlyWinnersData[];
  pagination: PaginationInfo;
}

const rankStyles = {
  1: {
    label: "1st place",
    text: "text-gold",
    mark: "bg-gold/15 text-gold border-gold/40",
  },
  2: {
    label: "2nd place",
    text: "text-silver",
    mark: "bg-silver/15 text-silver border-silver/40",
  },
  3: {
    label: "3rd place",
    text: "text-bronze",
    mark: "bg-bronze/15 text-bronze border-bronze/40",
  },
} as const;

async function fetchMonthlyWinners(page: number): Promise<MonthlyWinnersResponse> {
  const response = await fetch(`/api/monthly-winners?page=${page}&limit=6`);

  if (!response.ok) {
    throw new Error("Failed to fetch monthly winners.");
  }

  return response.json();
}

function formatMonthYear(monthYear: string) {
  const [year, month] = monthYear.split("-").map(Number);
  return new Date(year, month - 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function sortByRank(winners: MonthlyWinner[]) {
  return [...winners].sort((a, b) => a.rank - b.rank);
}

/** Generates a PNG of the given node, uploads it and opens a tweet intent. */
function useWinnerShare(winner: MonthlyWinner, monthYear: string) {
  const ref = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const share = useCallback(async () => {
    if (!ref.current) {
      return;
    }

    try {
      setIsGenerating(true);
      const dataUrl = await toPng(ref.current, {
        cacheBust: true,
        backgroundColor:
          getComputedStyle(document.body).backgroundColor || "#0d1117",
        pixelRatio: 2,
        skipFonts: false,
      });

      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append("image", blob);
      formData.append("name", `${winner.user.githubUsername}-winner-${monthYear}`);

      const uploadResponse = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image");
      }

      const { url: imageUrl } = await uploadResponse.json();
      const shareText = `Ranked #${winner.rank} on GitAura in ${formatMonthYear(
        monthYear
      )} with ${winner.totalAura.toLocaleString()} Aura.`;
      const shareUrl = `${window.location.origin}/monthly-winners`;

      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          shareText
        )}&url=${encodeURIComponent(shareUrl)}&image=${encodeURIComponent(
          imageUrl
        )}`,
        "_blank",
        "width=600,height=400"
      );
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  }, [monthYear, winner.rank, winner.totalAura, winner.user.githubUsername]);

  return { ref, share, isGenerating };
}

function RankMark({
  rank,
  size = "sm",
}: {
  rank: 1 | 2 | 3;
  size?: "sm" | "lg";
}) {
  return (
    <span
      aria-label={rankStyles[rank].label}
      title={rankStyles[rank].label}
      className={`inline-flex shrink-0 items-center justify-center rounded-full border font-semibold tabular-nums ${
        rankStyles[rank].mark
      } ${size === "lg" ? "h-7 w-7 text-sm" : "h-5 w-5 text-[11px]"}`}
    >
      {rank}
    </span>
  );
}

function ShareButton({
  onClick,
  isGenerating,
  className = "",
}: {
  onClick: () => void;
  isGenerating: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isGenerating}
      aria-label="Share winner"
      title="Share"
      className={`inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {isGenerating ? (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border border-muted-foreground/30 border-t-muted-foreground" />
      ) : (
        <Share2 className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

/* ----------------------------- Featured podium ---------------------------- */

const podiumOrder = {
  1: "order-1 col-span-2 sm:order-2 sm:col-span-1",
  2: "order-2 sm:order-1",
  3: "order-3 sm:order-3",
} as const;

function PodiumCard({
  winner,
  monthYear,
}: {
  winner: MonthlyWinner;
  monthYear: string;
}) {
  const { ref, share, isGenerating } = useWinnerShare(winner, monthYear);
  const isFirst = winner.rank === 1;

  return (
    <div
      ref={ref}
      className={`gh-box relative flex flex-col items-center px-4 text-center ${
        podiumOrder[winner.rank]
      } ${
        isFirst
          ? "border-gold/50 pb-5 pt-6 sm:pb-6 sm:pt-8"
          : "min-w-0 px-3 pb-4 pt-5 sm:mt-6 sm:px-4 sm:pb-5 sm:pt-6"
      }`}
    >
      <ShareButton
        onClick={() => void share()}
        isGenerating={isGenerating}
        className="absolute right-2 top-2"
      />

      <div className="relative">
        <UserAvatar
          src={winner.user.avatarUrl}
          githubUsername={winner.user.githubUsername}
          displayName={winner.user.displayName}
          alt={winner.user.displayName || winner.user.githubUsername}
          className={isFirst ? "h-20 w-20 sm:h-24 sm:w-24" : "h-14 w-14 sm:h-16 sm:w-16"}
          initialsClassName="text-base tracking-normal"
          size={192}
        />
        <span className="absolute -bottom-1 -right-1 rounded-full bg-background p-0.5">
          <RankMark rank={winner.rank} size="lg" />
        </span>
      </div>

      <p className={`mt-3 text-xs font-medium ${rankStyles[winner.rank].text}`}>
        {rankStyles[winner.rank].label}
      </p>
      <h3
        className={`mt-0.5 max-w-full truncate font-semibold text-foreground ${
          isFirst ? "text-lg sm:text-xl" : "text-base"
        }`}
      >
        {winner.user.displayName || winner.user.githubUsername}
      </h3>
      <p className="max-w-full truncate text-sm text-muted-foreground">
        @{winner.user.githubUsername}
      </p>

      <dl className="mt-4 grid w-full grid-cols-2 divide-x divide-border-muted rounded-md border border-border-muted bg-canvas-subtle py-2">
        <div>
          <dt className="text-xs text-muted-foreground">Aura</dt>
          <dd
            className={`font-semibold tabular-nums text-foreground ${
              isFirst ? "text-lg" : "text-sm sm:text-base"
            }`}
          >
            {winner.totalAura.toLocaleString()}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">
            <span className={isFirst ? "" : "sm:hidden"}>
              {isFirst ? "Contributions" : "Contrib."}
            </span>
            {!isFirst && <span className="hidden sm:inline">Contributions</span>}
          </dt>
          <dd
            className={`font-semibold tabular-nums text-foreground ${
              isFirst ? "text-lg" : "text-sm sm:text-base"
            }`}
          >
            {winner.contributionsCount.toLocaleString()}
          </dd>
        </div>
      </dl>

      <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
        <Link href={`/user/${winner.user.githubUsername}`}>View profile</Link>
      </Button>
    </div>
  );
}

function FeaturedMonth({ monthData }: { monthData: MonthlyWinnersData }) {
  const ordered = sortByRank(monthData.winners);

  return (
    <section aria-labelledby="featured-month">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2
          id="featured-month"
          className="text-base font-semibold text-foreground"
        >
          {formatMonthYear(monthData.monthYear)}
        </h2>
        <span className="gh-label">Latest podium</span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:items-start">
        {ordered.map((winner) => (
          <PodiumCard
            key={winner.id}
            winner={winner}
            monthYear={monthData.monthYear}
          />
        ))}
      </div>
    </section>
  );
}

/* --------------------------------- Archive -------------------------------- */

function ArchiveWinnerCell({
  winner,
  monthYear,
}: {
  winner: MonthlyWinner;
  monthYear: string;
}) {
  const { ref, share, isGenerating } = useWinnerShare(winner, monthYear);

  return (
    <div
      ref={ref}
      className="flex min-w-0 items-center gap-3 bg-background px-4 py-3"
    >
      <RankMark rank={winner.rank} />
      <UserAvatar
        src={winner.user.avatarUrl}
        githubUsername={winner.user.githubUsername}
        displayName={winner.user.displayName}
        alt={winner.user.displayName || winner.user.githubUsername}
        className="h-9 w-9"
        initialsClassName="text-[11px] tracking-normal"
        size={72}
      />
      <div className="min-w-0 flex-1">
        <Link
          href={`/user/${winner.user.githubUsername}`}
          className="block truncate text-sm font-semibold text-foreground hover:text-link"
        >
          {winner.user.displayName || winner.user.githubUsername}
        </Link>
        <p className="truncate text-xs text-muted-foreground">
          @{winner.user.githubUsername}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          <span className="font-semibold tabular-nums text-foreground">
            {winner.totalAura.toLocaleString()}
          </span>{" "}
          aura ·{" "}
          <span className="font-semibold tabular-nums text-foreground">
            {winner.contributionsCount.toLocaleString()}
          </span>{" "}
          contributions
        </p>
      </div>
      <ShareButton onClick={() => void share()} isGenerating={isGenerating} />
    </div>
  );
}

function ArchiveMonth({ monthData }: { monthData: MonthlyWinnersData }) {
  const ordered = sortByRank(monthData.winners);

  return (
    <section className="gh-box overflow-hidden">
      <div className="gh-box-header py-2.5">
        <h3 className="text-sm font-semibold text-foreground">
          {formatMonthYear(monthData.monthYear)}
        </h3>
        <span className="gh-label">Top 3</span>
      </div>
      <div className="grid gap-px bg-border-muted md:grid-cols-3">
        {ordered.map((winner) => (
          <ArchiveWinnerCell
            key={winner.id}
            winner={winner}
            monthYear={monthData.monthYear}
          />
        ))}
      </div>
    </section>
  );
}

/* ------------------------------- Pagination ------------------------------- */

function getPageItems(current: number, total: number): (number | "gap")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b);

  const items: (number | "gap")[] = [];
  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) {
      items.push("gap");
    }
    items.push(page);
  });
  return items;
}

function Pagination({
  pagination,
  onPageChange,
}: {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
}) {
  if (pagination.totalPages <= 1) {
    return null;
  }

  const items = getPageItems(pagination.currentPage, pagination.totalPages);
  const navButton =
    "inline-flex h-8 items-center gap-1 rounded-md px-2.5 text-sm font-medium text-link transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:text-muted-foreground disabled:hover:bg-transparent";

  return (
    <nav
      aria-label="Pagination"
      className="mt-6 flex items-center justify-center gap-1"
    >
      <button
        type="button"
        className={navButton}
        disabled={!pagination.hasPrevPage}
        onClick={() => onPageChange(pagination.currentPage - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </button>

      {items.map((item, index) =>
        item === "gap" ? (
          <span
            key={`gap-${index}`}
            className="px-1 text-sm text-muted-foreground"
          >
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            aria-current={item === pagination.currentPage ? "page" : undefined}
            onClick={() => onPageChange(item)}
            className={`inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm tabular-nums transition-colors ${
              item === pagination.currentPage
                ? "bg-link font-semibold text-background"
                : "text-foreground hover:bg-accent"
            }`}
          >
            {item}
          </button>
        )
      )}

      <button
        type="button"
        className={navButton}
        disabled={!pagination.hasNextPage}
        onClick={() => onPageChange(pagination.currentPage + 1)}
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}

/* ---------------------------------- Page ---------------------------------- */

function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header leaderboard={false} dashboard={false} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <section className="border-b border-border pb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Monthly winners
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            The top three developers by Aura and contributions, archived each
            month.
          </p>
        </section>
        <div className="mt-6">{children}</div>
      </main>
      <Footer />
    </div>
  );
}

export default function MonthlyWinnersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();

  const currentMonthYear = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  }, []);

  const winnersQuery = useQuery({
    queryKey: ["monthly-winners", currentPage],
    queryFn: () => fetchMonthlyWinners(currentPage),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

  const visibleWinnersData = useMemo(
    () =>
      (winnersQuery.data?.data || []).filter(
        (month) =>
          month.monthYear !== currentMonthYear && month.winners.length > 0
      ),
    [currentMonthYear, winnersQuery.data?.data]
  );

  const pagination = winnersQuery.data?.pagination ?? {
    currentPage,
    totalPages: 1,
    totalMonths: 0,
    hasNextPage: false,
    hasPrevPage: false,
  };

  useEffect(() => {
    if (!pagination.hasNextPage) {
      return;
    }

    void queryClient.prefetchQuery({
      queryKey: ["monthly-winners", currentPage + 1],
      queryFn: () => fetchMonthlyWinners(currentPage + 1),
      staleTime: 5 * 60 * 1000,
    });
  }, [currentPage, pagination.hasNextPage, queryClient]);

  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= pagination.totalPages) {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [pagination.totalPages]
  );

  if (winnersQuery.isLoading && !winnersQuery.data) {
    return (
      <PageShell>
        <div className="grid gap-3 sm:grid-cols-3" aria-busy="true">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="gh-box flex flex-col items-center gap-3 px-4 py-6"
            >
              <div className="h-16 w-16 animate-pulse rounded-full bg-accent" />
              <div className="h-4 w-28 animate-pulse rounded bg-accent" />
              <div className="h-3 w-20 animate-pulse rounded bg-accent" />
              <div className="h-12 w-full animate-pulse rounded bg-accent" />
            </div>
          ))}
        </div>
        <div className="gh-box mt-8">
          <div className="gh-box-header">
            <div className="h-4 w-32 animate-pulse rounded bg-accent" />
          </div>
          <div className="h-16" />
        </div>
      </PageShell>
    );
  }

  if (winnersQuery.isError) {
    return (
      <PageShell>
        <div className="gh-box px-4 py-10 text-center">
          <Trophy className="mx-auto h-6 w-6 text-muted-foreground" />
          <h2 className="mt-3 text-base font-semibold text-foreground">
            Unable to load monthly winners
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {winnersQuery.error instanceof Error
              ? winnersQuery.error.message
              : "Unknown error."}
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => void winnersQuery.refetch()}
          >
            Retry
          </Button>
        </div>
      </PageShell>
    );
  }

  const showFeatured = currentPage === 1 && visibleWinnersData.length > 0;
  const featured = showFeatured ? visibleWinnersData[0] : null;
  const archive = showFeatured ? visibleWinnersData.slice(1) : visibleWinnersData;

  return (
    <PageShell>
      {visibleWinnersData.length === 0 ? (
        <div className="gh-box px-4 py-12 text-center">
          <Trophy className="mx-auto h-6 w-6 text-muted-foreground" />
          <h2 className="mt-3 text-base font-semibold text-foreground">
            No winners archived yet
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Monthly winners appear here once the first leaderboard snapshot
            is saved.
          </p>
        </div>
      ) : (
        <div
          className={`transition-opacity ${
            winnersQuery.isFetching && winnersQuery.data ? "opacity-60" : ""
          }`}
        >
          {featured && <FeaturedMonth monthData={featured} />}

          {archive.length > 0 && (
            <section className={featured ? "mt-10" : ""}>
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-base font-semibold text-foreground">
                  {featured ? "Previous months" : "Archive"}
                </h2>
                {pagination.totalMonths > 0 && (
                  <span className="gh-counter">{pagination.totalMonths}</span>
                )}
              </div>
              <div className="space-y-3">
                {archive.map((monthData) => (
                  <ArchiveMonth key={monthData.monthYear} monthData={monthData} />
                ))}
              </div>
            </section>
          )}

          <Pagination pagination={pagination} onPageChange={handlePageChange} />
        </div>
      )}
    </PageShell>
  );
}
