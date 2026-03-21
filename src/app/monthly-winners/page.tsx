"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toPng } from "html-to-image";
import Image from "next/image";
import {
  Award,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Crown,
  Medal,
  Share2,
  Trophy,
  Zap,
} from "lucide-react";
import { Header } from "@/components/home";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    badge: "/badge/1st.png",
    label: "First place",
    icon: Crown,
    border: "border-foreground/15",
    surface: "bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))]",
  },
  2: {
    badge: "/badge/2nd.png",
    label: "Second place",
    icon: Medal,
    border: "border-border",
    surface: "bg-background",
  },
  3: {
    badge: "/badge/3rd.png",
    label: "Third place",
    icon: Award,
    border: "border-border",
    surface: "bg-background",
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

function RankIcon({ rank }: { rank: 1 | 2 | 3 }) {
  const Icon = rankStyles[rank].icon;
  return <Icon className="h-4 w-4 text-foreground" />;
}

function WinnerCard({
  winner,
  monthYear,
}: {
  winner: MonthlyWinner;
  monthYear: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const styles = rankStyles[winner.rank];

  const handleShare = useCallback(async () => {
    if (!cardRef.current) {
      return;
    }

    try {
      setIsGenerating(true);
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        backgroundColor: "#0a0a0a",
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

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className={`group relative overflow-hidden rounded-[30px] border ${styles.border} ${styles.surface} p-5 shadow-[0_30px_80px_-55px_rgba(15,23,42,0.45)] transition-transform duration-300 hover:-translate-y-1`}
    >
      <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_70%)]" />

      <div className="absolute right-4 top-4">
        <Image
          src={styles.badge}
          alt={styles.label}
          width={54}
          height={54}
          className="h-12 w-12 object-contain"
          unoptimized
        />
      </div>

      <button
        onClick={() => void handleShare()}
        disabled={isGenerating}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/90 text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Share winner"
      >
        {isGenerating ? (
          <div className="h-4 w-4 animate-spin rounded-full border border-foreground/20 border-t-foreground" />
        ) : (
          <Share2 className="h-4 w-4" />
        )}
      </button>

      <div className="mt-5 flex flex-col items-center text-center">
        <UserAvatar
          src={winner.user.avatarUrl}
          githubUsername={winner.user.githubUsername}
          displayName={winner.user.displayName}
          alt={winner.user.displayName || winner.user.githubUsername}
          className="h-24 w-24 shadow-[0_20px_45px_-25px_rgba(15,23,42,0.55)]"
          initialsClassName="text-lg tracking-[0.08em]"
          size={192}
        />

        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          <RankIcon rank={winner.rank} />
          #{winner.rank}
        </div>

        <h3 className="mt-5 text-[1.65rem] font-semibold tracking-[-0.045em] text-foreground">
          {winner.user.displayName}
        </h3>
        <p className="mt-1 text-[15px] text-muted-foreground">
          @{winner.user.githubUsername}
        </p>

        <div className="mt-5 grid w-full grid-cols-2 gap-3">
          <div className="rounded-[24px] border border-border bg-background px-4 py-3.5 text-left">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              <Zap className="h-3.5 w-3.5" />
              Aura
            </div>
            <p className="mt-2 text-lg font-semibold text-foreground">
              {winner.totalAura.toLocaleString()}
            </p>
          </div>
          <div className="rounded-[24px] border border-border bg-background px-4 py-3.5 text-left">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              Contributions
            </div>
            <p className="mt-2 text-lg font-semibold text-foreground">
              {winner.contributionsCount.toLocaleString()}
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          className="mt-6 w-full"
          onClick={() =>
            window.open(`/user/${winner.user.githubUsername}`, "_blank", "noopener")
          }
        >
          View profile
        </Button>
      </div>
    </motion.div>
  );
}

function WinnersGrid({ monthData }: { monthData: MonthlyWinnersData }) {
  const ordered = [...monthData.winners].sort((a, b) => a.rank - b.rank);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Hall of fame
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-foreground">
            {formatMonthYear(monthData.monthYear)}
          </h2>
        </div>
        <Badge
          variant="outline"
          className="w-fit rounded-full border-border bg-card px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
        >
          Top 3 archived
        </Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {ordered.map((winner) => (
          <WinnerCard
            key={winner.id}
            winner={winner}
            monthYear={monthData.monthYear}
          />
        ))}
      </div>
    </section>
  );
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

  return (
    <nav className="mt-10 flex items-center justify-center gap-3">
      <Button
        variant="outline"
        disabled={!pagination.hasPrevPage}
        onClick={() => onPageChange(pagination.currentPage - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
        Prev
      </Button>

      <div className="rounded-full border border-border bg-card px-4 py-2 text-xs text-muted-foreground">
        Page {pagination.currentPage} of {pagination.totalPages}
      </div>

      <Button
        variant="outline"
        disabled={!pagination.hasNextPage}
        onClick={() => onPageChange(pagination.currentPage + 1)}
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
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
        (month) => month.monthYear !== currentMonthYear
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
      }
    },
    [pagination.totalPages]
  );

  if (winnersQuery.isLoading && !winnersQuery.data) {
    return (
      <div className="min-h-screen bg-background">
        <Header leaderboard={false} dashboard={false} />
        <main className="mx-auto max-w-6xl px-4 pb-10 pt-28 sm:px-6">
          <Card className="rounded-[28px] border-border bg-card p-10 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border border-foreground/20 border-t-foreground" />
            <p className="mt-4 text-sm text-muted-foreground">
              Loading monthly winners...
            </p>
          </Card>
        </main>
      </div>
    );
  }

  if (winnersQuery.isError) {
    return (
      <div className="min-h-screen bg-background">
        <Header leaderboard={false} dashboard={false} />
        <main className="mx-auto max-w-6xl px-4 pb-10 pt-28 sm:px-6">
          <Card className="rounded-[28px] border-red-500/20 bg-red-500/10 text-center">
            <CardContent className="py-10">
              <h2 className="text-lg font-semibold text-foreground">
                Unable to load monthly winners
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {winnersQuery.error instanceof Error
                  ? winnersQuery.error.message
                  : "Unknown error."}
              </p>
              <Button className="mt-5" onClick={() => void winnersQuery.refetch()}>
                Retry
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header leaderboard={false} dashboard={false} />

      <main className="mx-auto max-w-6xl px-4 pb-10 pt-28 sm:px-6">
        <section className="mb-10 max-w-3xl">
          <Badge
            variant="outline"
            className="rounded-full border-border bg-card px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground"
          >
            Monthly winners
          </Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl">
            Archived podium finishes, month by month.
          </h1>
          <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-[15px]">
            A quieter hall of fame for the developers who led GitAura in Aura
            and contribution output each month.
          </p>
          {winnersQuery.isFetching && winnersQuery.data && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              <div className="h-2 w-2 animate-pulse rounded-full bg-foreground/60" />
              Updating archive
            </div>
          )}
        </section>

        {visibleWinnersData.length === 0 ? (
          <Card className="rounded-[28px] border-border bg-card/80">
            <CardContent className="py-16 text-center">
              <Trophy className="mx-auto h-12 w-12 text-muted-foreground" />
              <h2 className="mt-4 text-xl font-semibold text-foreground">
                No winners archived yet
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Monthly winners will appear here once the first leaderboard
                snapshots are saved.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-10">
            {visibleWinnersData.map((monthData) => (
              <WinnersGrid key={monthData.monthYear} monthData={monthData} />
            ))}
            <Pagination pagination={pagination} onPageChange={handlePageChange} />
          </div>
        )}
      </main>
    </div>
  );
}
