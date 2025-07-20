import { Crown, Medal } from "lucide-react";

interface RankIconProps {
  rank: number;
}

export function RankIcon({ rank }: RankIconProps) {
  switch (rank) {
    case 1:
      return (
        <Crown className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-yellow-500" />
      );
    case 2:
      return (
        <Medal className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-400" />
      );
    case 3:
      return (
        <Medal className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-amber-600" />
      );
    default:
      return (
        <span className="text-base sm:text-lg font-bold text-[#7d8590] bg-[#21262d] rounded-full w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 flex items-center justify-center">
          {rank}
        </span>
      );
  }
}
