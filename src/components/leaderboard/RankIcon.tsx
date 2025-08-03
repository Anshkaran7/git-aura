import { Crown, Medal } from "lucide-react";

interface RankIconProps {
  rank: number;
}

export function RankIcon({ rank }: RankIconProps) {
  switch (rank) {
    case 1:
      return <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />;
    case 2:
      return <Medal className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />;
    case 3:
      return <Medal className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600" />;
    default:
      return (
        <span className="text-xs sm:text-sm font-bold text-[#7d8590] bg-[#21262d] rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
          {rank}
        </span>
      );
  }
}
