
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
    <div className="relative min-h-[90vh] w-full py-16 md:py-20 px-4 md:px-8 bg-black text-white">
      <div className="mx-auto max-w-6xl">
        {/* Minimal navigation / back links */}
        <div className="mb-8 flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-3">
            <Link href="/" className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
              </svg>
              Home
            </Link>
            <span className="text-gray-600">/</span>
            <span className="text-gray-300">Battle</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/leaderboard" className="text-gray-400 hover:text-white transition-colors">Leaderboard</Link>
            <Link href="/contribute" className="text-gray-400 hover:text-white transition-colors">Contribute</Link>
          </div>
        </div>
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            GitHub 1v1 Battle
          </h1>
          <p className="mt-4 text-sm md:text-base text-gray-400 max-w-2xl mx-auto">
            Enter two GitHub usernames and see a head‑to‑head breakdown. We highlight the winner per metric and overall — no log in required.
          </p>
        </div>

      <motion.div
        className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 mb-12"
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
  <span className="font-semibold text-xl md:text-2xl text-gray-400">VS</span>
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

      {/* Info / Fun section when no result yet */}
      {!result && (
        <div className="mx-auto max-w-5xl mb-14">
          <div className="grid gap-4 md:gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[ 
              { title: 'Metrics Compared', body: 'Repos, followers, following, gists, total stars*, account age & aura (if present).' },
              { title: 'Tie Handling', body: 'Equal values count as a draw for that metric — no points awarded.' },
              { title: 'Stars Note *', body: 'Stars are summed from public non‑fork repos (approximate on first load).'},
              { title: 'Rate Limits', body: 'Unauthenticated requests: 60/hour per IP. Add a GITHUB_TOKEN for higher limits.' },
              { title: 'Fair Play', body: 'Recently renamed or empty accounts may appear weaker — activity history matters.' },
              { title: 'Pro Tip', body: 'Consistent contributions + diverse repos often beats raw repo count.' },
            ].map((f) => (
              <div key={f.title} className="rounded-xl border border-gray-800 bg-zinc-900/40 p-4 md:p-5 hover:border-gray-700 transition-colors">
                <h3 className="text-sm font-semibold text-white mb-1.5 tracking-wide">{f.title}</h3>
                <p className="text-xs md:text-sm leading-relaxed text-gray-400">{f.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-[11px] md:text-xs text-gray-500 text-center">Data is fetched live from the GitHub REST API. Cached briefly in memory for performance.</p>
        </div>
      )}

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.35 }}
            className="w-full"
          >
            <div className="flex flex-col md:flex-row items-center justify-center gap-10 mb-10">
              <motion.div animate={result.winner === "user1" ? { scale: 1.03 } : {}}>
                <GitHubProfileCard profile={result.user1} highlight={result.winner === "user1"} />
              </motion.div>
              <span className="font-bold text-3xl md:text-4xl text-gray-500">VS</span>
              <motion.div animate={result.winner === "user2" ? { scale: 1.03 } : {}}>
                <GitHubProfileCard profile={result.user2} highlight={result.winner === "user2"} />
              </motion.div>
            </div>
            <div className="rounded-xl border border-gray-800 bg-zinc-900/50 backdrop-blur-sm p-4 md:p-6">
              <BattleResultTable results={result.results || []} />
            </div>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-10">
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
              <Button variant="ghost" onClick={() => (window.location.href = "/leaderboard")} className="text-gray-300 hover:text-white">
                Leaderboard
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
