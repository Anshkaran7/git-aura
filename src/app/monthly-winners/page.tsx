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
  const rankStyles = RANK_STYLES[winner.rank] || RANK_STYLES[3];
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

  return (
    <div
      ref={cardRef}
      className={`relative flex flex-col items-center bg-gray-700/20 rounded-lg p-4 ${
        winner.rank === 1
          ? "order-2 scale-105 md:scale-110 -translate-y-8 md:-translate-y-16"
          : winner.rank === 2
          ? "order-1"
          : "order-3"
      } transition-all w-full max-w-[280px]`}
      aria-label={`${winner.user.displayName} - Rank ${winner.rank}`}
    >
      {/* Share Button */}
      <button
        onClick={handleShare}
        disabled={isGenerating}
        className={`absolute top-4 left-4 p-2 rounded-full transition-all duration-300
          ${
            winner.rank === 1
              ? "bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20"
              : winner.rank === 2
              ? "bg-gray-500/10 text-gray-400 hover:bg-gray-500/20"
              : "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
          } ${isGenerating ? "opacity-50 cursor-not-allowed" : ""}`}
        aria-label="Share achievement"
      >
        {isGenerating ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <Share2 className="w-4 h-4" />
        )}
      </button>

      {/* Badge Image in Top Right */}
      <div className="absolute top-4 right-4 w-16 h-16 z-20">
        <Image
          src={rankStyles.badgeImage}
          alt={`${winner.rank} place badge`}
          width={64}
          height={64}
          className="drop-shadow-xl"
          priority
          unoptimized
        />
      </div>

      {/* Profile Image with Enhanced Ribbon */}
      <div className="relative mb-4">
        {/* Glowing Effect */}
        <div
          className={`absolute -inset-4 ${
            winner.rank === 1
              ? "bg-yellow-500/20"
              : winner.rank === 2
              ? "bg-gray-500/20"
              : "bg-amber-500/20"
          } blur-xl opacity-50 z-0`}
        />

        {/* Profile Image Container with Enhanced Border */}
        <div className="relative z-10 ">
          <div
            className={`w-28 h-28 rounded-full border-4 overflow-hidden shadow-2xl
            ${
              winner.rank === 1
                ? "border-yellow-500 ring-4 ring-yellow-500/20"
                : winner.rank === 2
                ? "border-gray-400 ring-4 ring-gray-400/20"
                : "border-amber-500 ring-4 ring-amber-500/20"
            }`}
          >
            <Image
              src={winner.user.avatarUrl}
              alt={`${winner.user.displayName} avatar`}
              fill
              className="object-cover overflow-hidden rounded-full"
              priority
              sizes="112px"
            />
          </div>

          {/* Enhanced Score Badge */}
          {/* <div
            className={`absolute -bottom-3 left-1/2 transform -translate-x-1/2 px-4 py-1.5 rounded-full text-sm font-bold
            shadow-lg backdrop-blur-md border border-white/10
            ${
              winner.rank === 1
                ? "bg-yellow-500/90 text-black"
                : winner.rank === 2
                ? "bg-gray-400/90 text-black"
                : "bg-amber-500/90 text-black"
            }`}
          >
            {winner.totalAura}
          </div> */}
        </div>
      </div>

      {/* Name and Username with Enhanced Typography */}
      <div className="text-center space-y-1">
        <h3 className="text-white text-xl font-bold tracking-wide">
          {winner.user.displayName}
        </h3>
        <p className="text-[#7d8590] text-sm font-medium">
          @{winner.user.githubUsername}
        </p>
      </div>

      {/* Enhanced Stats Display */}
      <div className="mt-4 flex gap-6 text-sm bg-white/5 px-6 py-3 backdrop-blur-sm">
        <div className="text-center flex items-center gap-2">
          <Zap className={`${rankStyles.iconColor} w-4 h-4`} />
          <p className="text-[#7d8590] text-sm font-medium whitespace-nowrap">
            {winner.totalAura.toLocaleString()} Aura
          </p>
        </div>
        <div className="text-center flex items-center gap-2">
          <Users className={`${rankStyles.iconColor} w-4 h-4`} />
          <p className="text-[#7d8590] text-sm font-medium whitespace-nowrap">
            {winner.contributionsCount} Contribs
          </p>
        </div>
      </div>

      {/* View Profile Button */}
      <button
        onClick={() =>
          window.open(
            `/user/${winner.user.githubUsername}`,
            "_blank",
            "noopener"
          )
        }
        className={`mt-4 px-6 py-2 rounded-full text-sm font-medium transition-all duration-300
        ${
          winner.rank === 1
            ? "bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20"
            : winner.rank === 2
            ? "bg-gray-500/10 text-gray-400 hover:bg-gray-500/20"
            : "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
        }`}
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
  return (
    <div className="relative">
      <div className="flex justify-center items-end gap-4 md:gap-8 lg:gap-12 min-h-[400px]">
        {monthData.winners
          .sort((a, b) => a.rank - b.rank)
          .map((winner) => (
            <WinnerCard
              key={winner.id}
              winner={winner}
              monthYear={monthData.monthYear}
            />
          ))}
      </div>
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
      className="flex justify-center items-center gap-4 mt-12"
      role="navigation"
      aria-label="Pagination Navigation"
    >
      <Button
        variant="outline"
        onClick={() => onPageChange(pagination.currentPage - 1)}
        disabled={!pagination.hasPrevPage}
        className="bg-[#21262d] border-[#30363d] text-white hover:bg-[#30363d]"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Previous
      </Button>

      <div className="flex items-center gap-2" aria-label="Page numbers">
        {[...Array(pagination.totalPages)].map((_, i) => {
          const page = i + 1;
          const isActive = page === pagination.currentPage;
          return (
            <Button
              key={page}
              variant={isActive ? "default" : "outline"}
              onClick={() => onPageChange(page)}
              className={
                isActive
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-[#21262d] border-[#30363d] text-white hover:bg-[#30363d]"
              }
              size="sm"
              aria-current={isActive ? "page" : undefined}
              aria-label={`Go to page ${page}`}
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
        className="bg-[#21262d] border-[#30363d] text-white hover:bg-[#30363d]"
        aria-label="Next page"
      >
        Next
        <ChevronRight className="w-4 h-4 ml-2" />
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
      <div className="min-h-screen bg-black transition-colors duration-300">
        <Header leaderboard={false} dashboard={false} />
        <main
          className="max-w-[95vw] sm:max-w-[90vw] md:max-w-5xl lg:max-w-6xl mx-auto px-3 sm:px-4 md:px-6 pt-20 sm:pt-24 md:pt-28 pb-8 sm:pb-10"
          role="main"
          aria-busy="true"
        >
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto" />
            <p className="text-white mt-4 text-xl">
              Loading Monthly Winners...
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black transition-colors duration-300">
        <Header leaderboard={false} dashboard={false} />
        <main
          className="max-w-[95vw] sm:max-w-[90vw] md:max-w-5xl lg:max-w-6xl mx-auto px-3 sm:px-4 md:px-6 pt-20 sm:pt-24 md:pt-28 pb-8 sm:pb-10"
          role="main"
        >
          <Card className="bg-[#161b22] border border-red-600 p-6 text-center">
            <h3 className="text-2xl font-bold text-red-400 mb-4">
              Error Loading Data
            </h3>
            <p className="text-red-300">{error}</p>
            <Button
              onClick={() => fetchWinnersData(pagination.currentPage)}
              className="mt-6"
            >
              Retry
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black transition-colors duration-300">
      <Header leaderboard={false} dashboard={false} />

      <main
        className="max-w-[95vw] sm:max-w-[90vw] md:max-w-5xl lg:max-w-6xl mx-auto px-3 sm:px-4 md:px-6 pt-20 sm:pt-24 md:pt-28 pb-8 sm:pb-10"
        role="main"
      >
        {/* Header */}
        <section aria-label="Page Overview" className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Trophy className="w-12 h-12 text-yellow-400" />
            <h1 className="text-4xl sm:text-5xl font-bold text-white">
              Monthly Winners
            </h1>
            <Trophy className="w-12 h-12 text-yellow-400" />
          </div>
          <p className="text-lg sm:text-xl text-[#7d8590] max-w-2xl mx-auto">
            Celebrating the top 3 developers who dominated the monthly
            leaderboard with their exceptional contributions and aura scores.
          </p>

          {/* <div
            className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto"
            aria-label="Statistics overview"
          >
            <div
              className="bg-[#161b22] border border-[#30363d] rounded-lg p-4"
              role="region"
              aria-live="polite"
            >
              <Users
                className="w-8 h-8 text-blue-400 mx-auto mb-2"
                aria-hidden="true"
              />
              <div className="text-2xl font-bold text-white">
                {pagination.totalMonths}
              </div>
              <div className="text-[#7d8590]">Months Tracked</div>
            </div>
            <div
              className="bg-[#161b22] border border-[#30363d] rounded-lg p-4"
              role="region"
              aria-live="polite"
            >
              <Crown
                className="w-8 h-8 text-yellow-400 mx-auto mb-2"
                aria-hidden="true"
              />
              <div className="text-2xl font-bold text-white">
                {pagination.totalMonths}
              </div>
              <div className="text-[#7d8590]">Champions Crowned</div>
            </div>
            <div
              className="bg-[#161b22] border border-[#30363d] rounded-lg p-4"
              role="region"
              aria-live="polite"
            >
              <Medal
                className="w-8 h-8 text-gray-300 mx-auto mb-2"
                aria-hidden="true"
              />
              <div className="text-2xl font-bold text-white">
                {pagination.totalMonths * 3}
              </div>
              <div className="text-[#7d8590]">Total Winners</div>
            </div>
          </div> */}
        </section>

        {/* Winners Grid */}
        {winnersData.length === 0 ? (
          <Card className="bg-[#161b22] border border-[#30363d]">
            <CardContent className="text-center py-20">
              <Trophy
                className="w-24 h-24 text-gray-400 mx-auto mb-4"
                aria-hidden="true"
              />
              <h3 className="text-2xl font-bold text-white mb-4">
                No Monthly Winners Yet
              </h3>
              <p className="text-[#7d8590]">
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
              className="mb-20"
            >
              <div className="text-center mb-12">
                <div
                  aria-level={2}
                  role="heading"
                  id={`month-${monthData.monthYear}`}
                  className="inline-flex items-center gap-3 bg-[#161b22] border border-[#30363d] rounded-full px-6 py-3 justify-center"
                >
                  <Calendar
                    className="w-6 h-6 text-blue-400"
                    aria-hidden="true"
                  />
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">
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
