"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

const RANK_STYLES = {
  1: {
    border: "border-yellow-500/30 hover:border-yellow-500/50",
    badgeGlow: "bg-yellow-400",
    badgeImage: "/badge/1st.png",
    iconColor: "text-yellow-500",
    bgColor: "bg-yellow-500/10 hover:bg-yellow-500/20",
    textColor: "text-yellow-400",
    borderColor: "border-yellow-500/30",
    badgeStatus: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
  },
  2: {
    border: "border-gray-500/30 hover:border-gray-500/50",
    badgeGlow: "bg-gray-400",
    badgeImage: "/badge/2nd.png",
    iconColor: "text-gray-400",
    bgColor: "bg-gray-500/10 hover:bg-gray-500/20",
    textColor: "text-gray-400",
    borderColor: "border-gray-500/30",
    badgeStatus: "bg-gray-500/20 text-gray-400 border-gray-500/40",
  },
  3: {
    border: "border-amber-500/30 hover:border-amber-500/50",
    badgeGlow: "bg-amber-400",
    badgeImage: "/badge/3rd.png",
    iconColor: "text-amber-400",
    bgColor: "bg-amber-500/10 hover:bg-amber-500/20",
    textColor: "text-amber-400",
    borderColor: "border-amber-500/30",
    badgeStatus: "bg-amber-500/20 text-amber-400 border-amber-500/40",
  },
};

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return (
        <Crown className="w-8 h-8 text-yellow-500" aria-label="First place" />
      );
    case 2:
      return (
        <Medal className="w-8 h-8 text-gray-400" aria-label="Second place" />
      );
    case 3:
      return (
        <Award className="w-8 h-8 text-amber-600" aria-label="Third place" />
      );
    default:
      return <Trophy className="w-8 h-8 text-gray-500" aria-label="Rank" />;
  }
};

const formatMonthYear = (monthYear: string) => {
  const [year, month] = monthYear.split("-");
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

const WinnerCard = ({
  winner,
  monthYear,
}: {
  winner: MonthlyWinner;
  monthYear: string;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleShare = async () => {
    if (!cardRef.current) return;

    try {
      setIsGenerating(true);
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        backgroundColor: "#000000",
        pixelRatio: 2,
        skipFonts: false,
      });

      // Upload image
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append("image", blob);
      formData.append(
        "name",
        `${winner.user.githubUsername}-monthly-winner-${monthYear}`
      );

      const uploadResponse = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image");
      }

      const uploadData = await uploadResponse.json();
      const imageUrl = uploadData.url;

      // Share text and URL
      const rankText =
        winner.rank === 1 ? "1st 🥇" : winner.rank === 2 ? "2nd 🥈" : "3rd 🥉";
      const shareText = `🎉 Proud to be ranked ${rankText} on GitAura's monthly leaderboard for ${formatMonthYear(
        monthYear
      )}! With ${winner.totalAura.toLocaleString()} Aura points and ${
        winner.contributionsCount
      } contributions.\n\nJoin the competition and showcase your GitHub contributions! 🚀`;
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
    } catch (err) {
      console.error("Error sharing:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const getBorderColor = () => {
    if (winner.rank === 1) return "border-yellow-400";
    if (winner.rank === 2) return "border-gray-400";
    return "border-amber-500";
  };

  const getHighlightColor = () => {
    if (winner.rank === 1) return "shadow-[0_0_0_1px_rgba(250,204,21,0.4)]";
    if (winner.rank === 2) return "shadow-[0_0_0_1px_rgba(156,163,175,0.4)]";
    return "shadow-[0_0_0_1px_rgba(245,158,11,0.4)]";
  };

  const getRankBadgeColor = () => {
    if (winner.rank === 1) return "bg-yellow-400 text-black";
    if (winner.rank === 2) return "bg-gray-400 text-black";
    return "bg-amber-500 text-black";
  };

  const getBadgeImage = () => {
    if (winner.rank === 1) return "/badge/1st.png";
    if (winner.rank === 2) return "/badge/2nd.png";
    return "/badge/3rd.png";
  };

  return (
    <div
      ref={cardRef}
      className={`relative w-full md:w-[320px] rounded-xl border ${getBorderColor()} ${getHighlightColor()} bg-gradient-to-b from-card to-card/80 p-5 flex flex-col gap-4  ${
        winner.rank === 1 ? "md:scale-110" : ""
      }`}
      aria-label={`${winner.user.displayName} - Rank ${winner.rank}`}
    >
      {/* Winner badge */}
      <span
        className={`absolute -top-3 left-4 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide shadow ${getRankBadgeColor()}`}
      >
        {winner.rank === 1
          ? "🥇 CHAMPION"
          : winner.rank === 2
          ? "🥈 RUNNER-UP"
          : "🥉 THIRD PLACE"}
      </span>

      {/* Share Button */}
      <button
        onClick={handleShare}
        disabled={isGenerating}
        className="absolute -top-2 -right-2 p-2 bg-card border border-border rounded-full hover:scale-110 transition-all duration-200 shadow-lg"
        aria-label="Share achievement"
      >
        {isGenerating ? (
          <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
        ) : (
          <Share2 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
        )}
      </button>

      {/* Header */}
      <div className="flex items-start gap-3 mt-2">
        <div className="relative">
          <img
            src={winner.user.avatarUrl}
            alt={winner.user.displayName}
            className="w-16 h-16 rounded-full border border-border object-cover"
          />
          {/* Rank overlay */}
          <div
            className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${getRankBadgeColor()}`}
          >
            {winner.rank}
          </div>
        </div>
        <div className="flex flex-col min-w-0">
          <h2 className="text-base font-semibold text-foreground truncate">
            {winner.user.displayName}
          </h2>
          <p className="text-xs text-muted-foreground truncate">
            @{winner.user.githubUsername}
          </p>
          <div className="mt-1 flex gap-2 text-[10px] text-muted-foreground">
            <span className="px-1.5 py-0.5 whitespace-nowrap bg-muted/60 rounded border border-border">
              Rank #{winner.rank}
            </span>
            {winner.badgeAwarded && (
              <span className="px-1.5 py-0.5 whitespace-nowrap bg-green-500/20 text-green-400 rounded border border-green-500/40">
                Badge Earned
              </span>
            )}
          </div>
        </div>
        <div className="">
          <Image
            src={getBadgeImage()}
            alt={`${winner.rank} place badge`}
            width={1000}
            height={1000}
            className="drop-shadow-lg w-14 h-14"
            priority
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 text-[11px]">
        <div className="flex flex-col gap-1 bg-muted/30 rounded-lg p-2 border border-border/60">
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground">Aura Points</span>
          </div>
          <span className="text-foreground font-medium text-sm">
            {winner.totalAura.toLocaleString()}
          </span>
        </div>
        <div className="flex flex-col gap-1 bg-muted/30 rounded-lg p-2 border border-border/60">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground">Contributions</span>
          </div>
          <span className="text-foreground font-medium text-sm">
            {winner.contributionsCount}
          </span>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={() =>
          window.open(
            `/user/${winner.user.githubUsername}`,
            "_blank",
            "noopener"
          )
        }
        className="w-full py-2 px-4 rounded-lg font-medium text-sm bg-muted/30 hover:bg-muted/50 text-foreground border border-border/60 hover:border-border cursor-pointer transition-all duration-200"
      >
        View Profile
      </button>
    </div>
  );
};

interface WinnersGridProps {
  monthData: MonthlyWinnersData;
}

const WinnersGrid = ({ monthData }: WinnersGridProps) => {
  // Sort winners for podium display: 2nd, 1st, 3rd (1st in center)
  const sortedWinners = [...monthData.winners].sort((a, b) => {
    // For desktop podium layout: 2nd (left), 1st (center), 3rd (right)
    const order = { 2: 1, 1: 2, 3: 3 };
    return (
      order[a.rank as keyof typeof order] - order[b.rank as keyof typeof order]
    );
  });

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 py-8">
      {sortedWinners.map((winner, index) => (
        <div
          key={winner.id}
          className={`${
            winner.rank === 1
              ? "order-1 md:order-2"
              : winner.rank === 2
              ? "order-2 md:order-1"
              : "order-3 md:order-3"
          }`}
          style={{
            animationDelay: `${index * 200}ms`,
          }}
        >
          <WinnerCard winner={winner} monthYear={monthData.monthYear} />
        </div>
      ))}
    </div>
  );
};

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
      className="flex justify-center items-center gap-2 xs:gap-3 sm:gap-4 mt-8 xs:mt-10 sm:mt-12 flex-wrap"
      role="navigation"
      aria-label="Pagination Navigation"
    >
      <Button
        variant="outline"
        onClick={() => onPageChange(pagination.currentPage - 1)}
        disabled={!pagination.hasPrevPage}
        aria-label="Previous page"
        size="sm"
        className="text-xs xs:text-sm"
      >
        <ChevronLeft className="w-3 h-3 xs:w-4 xs:h-4 mr-1 xs:mr-2" />
        <span className="hidden xs:inline">Previous</span>
        <span className="xs:hidden">Prev</span>
      </Button>

      <div
        className="flex items-center gap-1 xs:gap-2"
        aria-label="Page numbers"
      >
        {[...Array(pagination.totalPages)].map((_, i) => {
          const page = i + 1;
          const isActive = page === pagination.currentPage;
          return (
            <Button
              key={page}
              variant={isActive ? "default" : "outline"}
              onClick={() => onPageChange(page)}
              size="sm"
              aria-current={isActive ? "page" : undefined}
              aria-label={`Go to page ${page}`}
              className="w-8 h-8 xs:w-9 xs:h-9 p-0 text-xs xs:text-sm"
            >
              {page}
            </Button>
          );
        })}
      </div>

      <Button
        variant="outline"
        onClick={() => onPageChange(pagination.currentPage + 1)}
        disabled={!pagination.hasNextPage}
        aria-label="Next page"
        size="sm"
        className="text-xs xs:text-sm"
      >
        <span className="hidden xs:inline">Next</span>
        <span className="xs:hidden">Next</span>
        <ChevronRight className="w-3 h-3 xs:w-4 xs:h-4 ml-1 xs:ml-2" />
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
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchWinnersData(newPage);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background transition-colors duration-300">
        <Header leaderboard={false} dashboard={false} />
        <main
          className="max-w-[95vw] xs:max-w-[92vw] sm:max-w-[90vw] md:max-w-4xl lg:max-w-5xl xl:max-w-7xl mx-auto px-2 xs:px-3 sm:px-4 md:px-6 pt-16 xs:pt-18 sm:pt-20 md:pt-24 lg:pt-28 pb-6 xs:pb-8 sm:pb-10"
          role="main"
          aria-busy="true"
        >
          <div className="text-center py-12 xs:py-16 sm:py-20">
            <div className="animate-spin rounded-full h-16 w-16 xs:h-24 xs:w-24 sm:h-32 sm:w-32 border-b-2 border-blue-500 mx-auto" />
            <p className="text-foreground mt-3 xs:mt-4 text-base xs:text-lg sm:text-xl">
              Loading Monthly Winners...
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background transition-colors duration-300">
        <Header leaderboard={false} dashboard={false} />
        <main
          className="max-w-[95vw] xs:max-w-[92vw] sm:max-w-[90vw] md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto px-2 xs:px-3 sm:px-4 md:px-6 pt-16 xs:pt-18 sm:pt-20 md:pt-24 lg:pt-28 pb-6 xs:pb-8 sm:pb-10"
          role="main"
        >
          <Card className="bg-destructive/10 border border-destructive p-4 xs:p-6 text-center">
            <h3 className="text-lg xs:text-xl sm:text-2xl font-bold text-red-400 mb-3 xs:mb-4">
              Error Loading Data
            </h3>
            <p className="text-red-300 text-sm xs:text-base">{error}</p>
            <Button
              onClick={() => fetchWinnersData(pagination.currentPage)}
              className="mt-4 xs:mt-6 text-sm xs:text-base"
              size="sm"
            >
              Retry
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Header leaderboard={false} dashboard={false} />

      <main
        className="max-w-[95vw] xs:max-w-[92vw] sm:max-w-[90vw] md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto px-2 xs:px-3 sm:px-4 md:px-6 pt-16 xs:pt-18 sm:pt-20 md:pt-24 lg:pt-28 pb-6 xs:pb-8 sm:pb-10"
        role="main"
      >
        {/* Header */}
        <section
          aria-label="Page Overview"
          className="text-center mb-12 relative"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Monthly Winners
            </h1>
            <Trophy className="w-8 h-8 text-yellow-400" />
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Celebrating the top 3 developers who dominated the monthly
            leaderboard with exceptional contributions.
          </p>
        </section>

        {/* Winners Grid */}
        {winnersData.length === 0 ? (
          <Card className="bg-card border border-border">
            <CardContent className="text-center py-12 xs:py-16 sm:py-20">
              <Trophy
                className="w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 text-muted-foreground mx-auto mb-3 xs:mb-4"
                aria-hidden="true"
              />
              <h3 className="text-lg xs:text-xl sm:text-2xl font-bold text-foreground mb-3 xs:mb-4">
                No Monthly Winners Yet
              </h3>
              <p className="text-sm xs:text-base text-muted-foreground px-4">
                Winners will be captured automatically at the end of each month.
                Check back soon!
              </p>
            </CardContent>
          </Card>
        ) : (
          winnersData.map((monthData) => (
            <section
              key={monthData.monthYear}
              aria-labelledby={`month-${monthData.monthYear}`}
              className="mb-16"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-3 bg-card border border-border rounded-lg px-6 py-3 shadow-sm">
                  <Calendar
                    className="w-5 h-5 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <h2
                    id={`month-${monthData.monthYear}`}
                    className="text-xl md:text-2xl font-semibold text-foreground"
                  >
                    {formatMonthYear(monthData.monthYear)}
                  </h2>
                </div>
              </div>

              <WinnersGrid monthData={monthData} />
            </section>
          ))
        )}
        {/* Pagination */}
        <Pagination pagination={pagination} onPageChange={handlePageChange} />
      </main>
    </div>
  );
}
