// src/components/leaderboard/BattleCard.tsx
"use client";

import CopyButton from "@/components/ui/CopyButton";

type Player = { username: string; score?: number };
type BattleCardProps = {
  player1: Player;
  player2: Player;
};

export default function BattleCard({ player1, player2 }: BattleCardProps) {
  return (
    <div className="rounded-xl border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="font-medium">{player1.username}</span>
          <CopyButton text={player1.username} label="Copy Player 1 username" />
        </div>
        {player1.score !== undefined && <span>{player1.score}</span>}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center">
          <span className="font-medium">{player2.username}</span>
          <CopyButton text={player2.username} label="Copy Player 2 username" />
        </div>
        {player2.score !== undefined && <span>{player2.score}</span>}
      </div>
    </div>
  );
}
