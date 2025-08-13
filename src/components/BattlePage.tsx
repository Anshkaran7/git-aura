
"use client";
import React, { useState } from "react";
import Link from "next/link";
import GitHubProfileCard from "./GitHubProfileCard";
import BattleResultTable from "./BattleResultTable";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import type { GitHubProfile } from "./types";
import { motion, AnimatePresence } from "framer-motion";

type MetricResult = {
  key: string;
  label: string;
  value1: number | string;
  value2: number | string;
  winner: "user1" | "user2" | null;
};

type BattleResult = {
  user1: GitHubProfile;
  user2: GitHubProfile;
  results: MetricResult[];
  winner: "user1" | "user2" | null;
};

export default function BattlePage() {
  const [user1, setUser1] = useState("");
  const [user2, setUser2] = useState("");
  const [result, setResult] = useState<BattleResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleBattle = async () => {
    setLoading(true);
    setResult(null);
    const res = await fetch(`/api/battle?user1=${user1}&user2=${user2}`);
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="relative min-h-[80vh] w-full py-14 md:py-20 px-4 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            GitHub 1v1 Battle
          </h1>
          <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            Compare two GitHub users across public repos, stars, followers and more. We highlight the winner for each metric and overall.
          </p>
        </div>

      <motion.div
        className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4 mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Input
          placeholder="GitHub Username 1"
          value={user1}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUser1(e.target.value.replace(/https?:\/\/github.com\//, ""))}
          className="w-64 md:w-72"
          disabled={loading}
        />
        <span className="font-semibold text-xl md:text-2xl text-muted-foreground">vs</span>
        <Input
          placeholder="GitHub Username 2"
          value={user2}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUser2(e.target.value.replace(/https?:\/\/github.com\//, ""))}
          className="w-64 md:w-72"
          disabled={loading}
        />
        <Button
          onClick={handleBattle}
          disabled={!user1 || !user2 || loading}
          className="md:ml-2"
        >
          {loading ? "Comparing..." : "Compare"}
        </Button>
      </motion.div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.35 }}
            className="w-full"
          >
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
              <motion.div animate={result.winner === "user1" ? { scale: 1.03 } : {}}>
                <GitHubProfileCard profile={result.user1} highlight={result.winner === "user1"} />
              </motion.div>
              <span className="font-bold text-3xl md:text-4xl text-muted-foreground">VS</span>
              <motion.div animate={result.winner === "user2" ? { scale: 1.03 } : {}}>
                <GitHubProfileCard profile={result.user2} highlight={result.winner === "user2"} />
              </motion.div>
            </div>
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 md:p-6">
              <BattleResultTable results={result.results || []} />
            </div>
            <div className="flex flex-col md:flex-row items-center justify-center gap-3 mt-10">
              <Button
                variant="outline"
                onClick={() => {
                  const url = window.location.href;
                  navigator.clipboard.writeText(url);
                }}
              >
                Share Result
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setUser1("");
                  setUser2("");
                  setResult(null);
                }}
              >
                Rematch
              </Button>
              <Button variant="ghost" onClick={() => (window.location.href = "/leaderboard")}>
                Back to Leaderboard
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
