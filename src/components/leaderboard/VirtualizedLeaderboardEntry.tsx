import React from "react";
import { ListChildComponentProps } from "react-window";
import { LeaderboardEntry } from "./LeaderboardEntry";
import { LeaderboardEntry as LeaderboardEntryType, ViewType } from "./types";

interface VirtualizedLeaderboardEntryData {
  items: LeaderboardEntryType[];
  itemCount: number;
  additionalData?: {
    view: ViewType;
    currentMonth: string;
    currentPage: number;
  };
}

interface VirtualizedLeaderboardEntryProps extends ListChildComponentProps {
  data: VirtualizedLeaderboardEntryData;
}

const VirtualizedLeaderboardEntry = React.memo<VirtualizedLeaderboardEntryProps>(({
  index,
  style,
  data,
}) => {
  const entry = data.items[index];
  const { view, currentMonth, currentPage } = data.additionalData || {
    view: "alltime" as ViewType,
    currentMonth: "",
    currentPage: 1,
  };

  if (!entry) {
    return null;
  }

  return (
    <div style={style}>
      <div className="px-1 pb-1.5 sm:pb-2">
        <LeaderboardEntry
          key={`${entry.user.id}-${view}-${currentMonth}`}
          entry={entry}
          index={index}
          view={view}
          currentMonth={currentMonth}
          currentPage={currentPage}
        />
      </div>
    </div>
  );
});

VirtualizedLeaderboardEntry.displayName = 'VirtualizedLeaderboardEntry';

export { VirtualizedLeaderboardEntry };
