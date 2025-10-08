"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Trophy,
  Medal,
  Award,
  Crown,
  Calendar,
  Users,
  Zap,
  Share2,
} from "lucide-react";
import Image from "next/image";
import { Header } from "@/components/home";
import { toPng } from "html-to-image";
import { motion, AnimatePresence } from "framer-motion";

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

/** ——— Brand-y rank styles with glow tokens ——— */
const RANK_TOKENS = {
  1: {
    badge: "/badge/1st.png",
    ring: "ring-yellow-400/25",
    border: "border-yellow-400/40",
    chip: "bg-yellow-500/10 text-yellow-300 border-yellow-400/30",
    haloFrom: "from-yellow-500/25",
    haloTo: "to-amber-500/10",
    icon: "text-yellow-400",
    gradientText:
      "bg-gradient-to-r from-yellow-200 to-amber-300 bg-clip-text text-transparent",
  },
  2: {
    badge: "/badge/2nd.png",
    ring: "ring-zinc-400/25",
    border: "border-zinc-400/40",
    chip: "bg-zinc-500/10 text-zinc-300 border-zinc-400/30",
    haloFrom: "from-zinc-400/25",
    haloTo: "to-slate-500/10",
    icon: "text-zinc-300",
    gradientText:
      "bg-gradient-to-r from-zinc-200 to-slate-300 bg-clip-text text-transparent",
  },
  3: {
    badge: "/badge/3rd.png",
    ring: "ring-amber-500/25",
    border: "border-amber-500/40",
    chip: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    haloFrom: "from-amber-400/25",
    haloTo: "to-orange-500/10",
    icon: "text-amber-300",
    gradientText:
      "bg-gradient-to-r from-amber-200 to-orange-300 bg-clip-text text-transparent",
  },
};

const RankIcon = ({ rank }: { rank: number }) => {
  switch (rank) {
    case 1:
      return (
        <Crown
          className="w-6 h-6 md:w-7 md:h-7 text-yellow-400"
          aria-label="First place"
        />
      );
    case 2:
      return (
        <Medal
          className="w-6 h-6 md:w-7 md:h-7 text-zinc-300"
          aria-label="Second place"
        />
      );
    case 3:
      return (
        <Award
          className="w-6 h-6 md:w-7 md:h-7 text-amber-400"
          aria-label="Third place"
        />
      );
    default:
      return (
        <Trophy
          className="w-6 h-6 md:w-7 md:h-7 text-muted-foreground"
          aria-label="Rank"
        />
      );
  }
};

const formatMonthYear = (monthYear: string) => {
  const [year, month] = monthYear.split("-");
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

/** ——— Winner Card ——— */
const WinnerCard = ({
  winner,
  monthYear,
}: {
  winner: MonthlyWinner;
  monthYear: string;
}) => {
  const t = RANK_TOKENS[winner.rank];
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleShare = async () => {
    if (!cardRef.current) return;
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
      formData.append(
        "name",
        `${winner.user.githubUsername}-winner-${monthYear}`
      );

      const uploadResponse = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });
      if (!uploadResponse.ok) throw new Error("Failed to upload image");
      const { url: imageUrl } = await uploadResponse.json();

      const rankText =
        winner.rank === 1 ? "1st 🥇" : winner.rank === 2 ? "2nd 🥈" : "3rd 🥉";
      const shareText = `🎉 Ranked ${rankText} on GitAura's monthly leaderboard (${formatMonthYear(
        monthYear
      )}) — ${winner.totalAura.toLocaleString()} Aura, ${
        winner.contributionsCount
      } contributions. Join in! 🚀`;
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
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  /** podium elevation */
  const podium =
    winner.rank === 1
      ? "order-2 md:-translate-y-10 lg:-translate-y-12 scale-[1.06]"
      : winner.rank === 2
      ? "order-1 md:-translate-y-4 scale-[1.02]"
      : "order-3 md:-translate-y-2";

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`relative ${podium} w-full max-w-[300px]`}
    >
      {/* soft halo */}
      <div
        className={`pointer-events-none absolute -inset-6 rounded-3xl bg-gradient-to-b ${t.haloFrom} ${t.haloTo} blur-2xl opacity-60`}
        aria-hidden
      />

      <div
        className={[
          "relative rounded-3xl border backdrop-blur-xl",
          "bg-gradient-to-b from-white/5 to-white/[0.03] dark:from-white/3 dark:to-white/[0.04]",
          "shadow-[0_8px_40px_-8px_rgba(0,0,0,0.45)]",
          t.border,
        ].join(" ")}
      >
        {/* badge top-right */}
        <div className="absolute right-4 top-4 z-20">
          <Image
            src={t.badge}
            alt={`${winner.rank} place badge`}
            width={56}
            height={56}
            className="drop-shadow-xl"
            priority
            unoptimized
          />
        </div>

        {/* share button */}
        <button
          onClick={handleShare}
          disabled={isGenerating}
          className={`absolute left-4 top-4 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full border text-xs 
          ${t.chip} hover:bg-white/10 transition`}
          aria-label="Share achievement"
        >
          {isGenerating ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <Share2 className="h-4 w-4" />
          )}
        </button>

        {/* header / avatar */}
        <div className="px-6 pb-6 pt-10">
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <div
                className={`absolute -inset-3 rounded-full ring-8 ${t.ring}`}
              />
              <div className="relative h-28 w-28 overflow-hidden rounded-full border border-white/10 shadow-2xl">
                <Image
                  src={winner.user.avatarUrl}
                  alt={`${winner.user.displayName} avatar`}
                  fill
                  className="object-cover"
                  sizes="112px"
                  priority
                />
              </div>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-1 inline-flex items-center gap-2">
                <RankIcon rank={winner.rank} />
                <span className={`text-xl font-semibold ${t.gradientText}`}>
                  #{winner.rank}
                </span>
              </div>
              <h3 className="text-lg font-bold text-foreground leading-tight">
                {winner.user.displayName}
              </h3>
              <p className="text-sm text-muted-foreground">
                @{winner.user.githubUsername}
              </p>
            </div>

            {/* metrics chips */}
            <div className="mt-5 grid w-full grid-cols-2 gap-3">
              <div
                className={`flex items-center justify-center gap-2 rounded-full border px-3 py-2 text-sm ${t.chip}`}
              >
                <Zap className={`h-4 w-4 ${t.icon}`} />
                <span className="tabular-nums">
                  {winner.totalAura.toLocaleString()}
                </span>
                <span className="opacity-80">Aura</span>
              </div>
              <div
                className={`flex items-center justify-center gap-2 rounded-full border px-3 py-2 text-sm ${t.chip}`}
              >
                <Users className={`h-4 w-4 ${t.icon}`} />
                <span className="tabular-nums">
                  {winner.contributionsCount}
                </span>
                <span className="opacity-80">Contribs</span>
              </div>
            </div>

            <Button
              onClick={() =>
                window.open(
                  `/user/${winner.user.githubUsername}`,
                  "_blank",
                  "noopener"
                )
              }
              className="mt-5 rounded-full"
              variant="secondary"
            >
              View Profile
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/** ——— Winners Grid ——— */
const WinnersGrid = ({ monthData }: { monthData: MonthlyWinnersData }) => {
  const ordered = [...monthData.winners].sort((a, b) => a.rank - b.rank);
  return (
    <div className="relative">
      {/* background accents */}
      <div
        className="pointer-events-none absolute inset-x-0 -top-16 mx-auto h-40 w-[80%] rounded-full bg-gradient-to-r from-indigo-500/10 via-primary/10 to-emerald-500/10 blur-3xl"
        aria-hidden
      />
      <div className="flex min-h-[420px] items-end justify-center gap-3 sm:gap-6 md:gap-10">
        {ordered.map((w) => (
          <WinnerCard key={w.id} winner={w} monthYear={monthData.monthYear} />
        ))}
      </div>

      {/* podium base */}
      <div className="mx-auto mt-6 grid max-w-lg grid-cols-3 items-end gap-3 sm:gap-6 md:gap-10">
        <div className="h-2 rounded-md bg-white/5" />
        <div className="h-3 rounded-md bg-white/8" />
        <div className="h-1.5 rounded-md bg-white/5" />
      </div>
    </div>
  );
};

/** ——— Pagination ——— */
const Pagination = ({
  pagination,
  onPageChange,
}: {
  pagination: PaginationInfo;
  onPageChange: (newPage: number) => void;
}) => {
  if (pagination.totalPages <= 1) return null;
  return (
    <nav
      className="mt-12 flex items-center justify-center gap-3"
      role="navigation"
      aria-label="Pagination"
    >
      <Button
        variant="outline"
        onClick={() => onPageChange(pagination.currentPage - 1)}
        disabled={!pagination.hasPrevPage}
        aria-label="Previous page"
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Prev
      </Button>

      <div
        className="hidden items-center gap-2 sm:flex"
        aria-label="Page numbers"
      >
        {Array.from({ length: pagination.totalPages }).map((_, i) => {
          const page = i + 1;
          const active = page === pagination.currentPage;
          return (
            <Button
              key={page}
              variant={active ? "default" : "outline"}
              onClick={() => onPageChange(page)}
              size="sm"
              aria-current={active ? "page" : undefined}
              className="min-w-9"
            >
              {page}
            </Button>
          );
        })}
      </div>

      <div className="sm:hidden text-sm text-muted-foreground">
        Page <span className="tabular-nums">{pagination.currentPage}</span> /{" "}
        <span className="tabular-nums">{pagination.totalPages}</span>
      </div>

      <Button
        variant="outline"
        onClick={() => onPageChange(pagination.currentPage + 1)}
        disabled={!pagination.hasNextPage}
        aria-label="Next page"
      >
        Next
        <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    </nav>
  );
};

export default function MonthlyWinnersPage() {
  const [winnersData, setWinnersData] = useState<MonthlyWinnersData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalMonths: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const fetchWinnersData = useCallback(async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/monthly-winners?page=${page}&limit=6`);
      if (!response.ok) throw new Error("Failed to fetch monthly winners");
      const data = await response.json();

      setWinnersData(data.data || []);
      setPagination((prev) => ({ ...prev, ...data.pagination }));
    } catch (e) {
      setError((e as Error).message || "Unknown error fetching data");
      setWinnersData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWinnersData(1);
  }, [fetchWinnersData]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages)
      fetchWinnersData(newPage);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header leaderboard={false} dashboard={false} />
        <main
          className="mx-auto max-w-6xl px-4 pt-24 pb-10"
          role="main"
          aria-busy="true"
        >
          <div className="relative mx-auto max-w-sm overflow-hidden rounded-2xl border border-white/10 p-10 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-white/5 to-emerald-500/10 blur-2xl" />
            <div className="relative">
              <div className="mx-auto h-14 w-14 animate-spin rounded-full border-2 border-b-transparent border-t-transparent" />
              <p className="mt-4 text-lg text-foreground">
                Loading Monthly Winners…
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header leaderboard={false} dashboard={false} />
        <main className="mx-auto max-w-6xl px-4 pt-24 pb-10" role="main">
          <Card className="border-destructive/40 bg-destructive/10 text-center">
            <CardContent className="py-12">
              <h3 className="mb-2 text-2xl font-bold text-red-400">
                Error Loading Data
              </h3>
              <p className="text-red-300">{error}</p>
              <Button
                onClick={() => fetchWinnersData(pagination.currentPage)}
                className="mt-6"
              >
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
      {/* subtle page background accents */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(60%_40%_at_50%_-10%,rgba(56,189,248,0.10),transparent),radial-gradient(40%_30%_at_20%_10%,rgba(99,102,241,0.10),transparent),radial-gradient(30%_20%_at_80%_0%,rgba(16,185,129,0.08),transparent)]"
        aria-hidden
      />
      <Header leaderboard={false} dashboard={false} />

      <main className="mx-auto max-w-6xl px-4 pt-24 pb-10" role="main">
        {/* Title */}
        <section aria-label="Page Overview" className="mb-12 text-center">
          <div className="mx-auto flex max-w-2xl items-center justify-center gap-3">
            <Trophy className="h-10 w-10 text-yellow-400" />
            <h1 className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl">
              Monthly Winners
            </h1>
            <Trophy className="h-10 w-10 text-yellow-400" />
          </div>
          <p className="mx-auto mt-4 max-w-2xl text-balance text-lg text-muted-foreground">
            Celebrating the top developers who dominated the monthly leaderboard
            with standout contributions and Aura.
          </p>
        </section>

        {/* Months */}
        {winnersData.length === 0 ? (
          <Card className="border border-border bg-card/40">
            <CardContent className="py-20 text-center">
              <Trophy
                className="mx-auto mb-4 h-20 w-20 text-muted-foreground"
                aria-hidden="true"
              />
              <h3 className="mb-2 text-2xl font-bold text-foreground">
                No Monthly Winners Yet
              </h3>
              <p className="text-muted-foreground">
                Winners are captured automatically at the end of each month.
                Check back soon!
              </p>
            </CardContent>
          </Card>
        ) : (
          winnersData.map((month) => (
            <section key={month.monthYear} className="mb-16">
              <div className="mb-10 text-center">
                <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-2.5">
                  <Calendar
                    className="h-5 w-5 text-primary"
                    aria-hidden="true"
                  />
                  <h2 className="text-xl font-semibold text-foreground">
                    {formatMonthYear(month.monthYear)}
                  </h2>
                </div>
              </div>
              <WinnersGrid monthData={month} />
            </section>
          ))
        )}

        <Pagination pagination={pagination} onPageChange={handlePageChange} />
      </main>
    </div>
  );
}
