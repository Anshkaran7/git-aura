import { MedalFirstPlaceIcon, MedalSecondPlaceIcon, MedalThirdPlaceIcon } from "@hugeicons/core-free-icons";
import { HugeIcon } from "@/components/ui/huge-icon";

interface RankIconProps {
  rank: number;
}

export function RankIcon({ rank }: RankIconProps) {
  switch (rank) {
    case 1:
      return <HugeIcon icon={MedalFirstPlaceIcon} size={16} className="text-amber-400" />;
    case 2:
      return <HugeIcon icon={MedalSecondPlaceIcon} size={16} className="text-slate-300" />;
    case 3:
      return <HugeIcon icon={MedalThirdPlaceIcon} size={16} className="text-orange-400" />;
    default:
      return (
        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-border/70 bg-background/80 text-[10px] font-semibold text-muted-foreground shadow-sm">
          {rank}
        </div>
      );
  }
}
