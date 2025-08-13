
"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
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
  // Mouse-follow ambient light
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [spot, setSpot] = useState({ x: 0, y: 0 }); // rendered (smoothed)
  const targetSpot = useRef({ x: 0, y: 0 });
  const animRef = useRef<number | null>(null);
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    targetSpot.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  // Smoothly interpolate toward target for buttery motion
  useEffect(() => {
    const smooth = () => {
      setSpot(prev => {
        const dx = targetSpot.current.x - prev.x;
        const dy = targetSpot.current.y - prev.y;
        // interpolation factor (smaller = smoother/slower)
        const ease = 0.15;
        if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) return prev;
        return { x: prev.x + dx * ease, y: prev.y + dy * ease };
      });
      animRef.current = requestAnimationFrame(smooth);
    };
    animRef.current = requestAnimationFrame(smooth);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  const handleBattle = async () => {
    setLoading(true);
    setResult(null);
    const res = await fetch(`/api/battle?user1=${user1}&user2=${user2}`);
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-[92vh] flex flex-col items-center justify-start py-16 px-4 md:px-8 overflow-hidden bg-black"
    >
      {/* Pure black base */}
      <div className="absolute inset-0 bg-black z-0" />
      {/* High-contrast mouse-follow ambient light */}
      <div
        className="absolute inset-0 pointer-events-none z-10 mix-blend-screen will-change-[background]"
        style={{
          background: `radial-gradient(circle at ${spot.x}px ${spot.y}px, rgba(168,85,247,0.35) 0px, rgba(99,102,241,0.22) 160px, rgba(0,0,0,0) 380px)`,
          transition: 'background 120ms linear'
        }}
      />
      {/* Optional subtle vignette to keep edges dark */}
      <div className="absolute inset-0 pointer-events-none z-20 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_40%,rgba(0,0,0,0.85)_100%)]" />

      <div className="absolute left-4 top-4 z-20">
        <Link href="/" className="inline-flex items-center px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-semibold shadow transition-colors border border-zinc-700">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back
        </Link>
      </div>

  <div className="mb-12 text-center z-30 relative">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-purple-300 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(168,85,247,0.25)]">
          GitHub Battle Arena
        </h1>
        <div className="flex items-center justify-center gap-2 mt-3 mb-2">
          <span className="text-sm md:text-base text-zinc-400/90 backdrop-blur-sm px-3 py-1 rounded-full border border-zinc-700/60 bg-zinc-900/40 shadow-inner">
            Launch a 1v1 stat duel — repos, stars, followers & more.
          </span>
          <span className="relative group cursor-pointer">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline-block text-gray-400"><circle cx="12" cy="12" r="10" strokeWidth="2" /><text x="12" y="16" textAnchor="middle" fontSize="12" fill="currentColor">?</text></svg>
            <span className="absolute left-1/2 -translate-x-1/2 mt-2 w-56 bg-black text-white text-xs rounded-lg px-3 py-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
              Enter two valid GitHub usernames (not URLs). Winner for each metric is highlighted!
            </span>
          </span>
        </div>
        <div className="mt-4 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-fuchsia-300/70 font-mono">
          <span className="px-2 py-0.5 bg-fuchsia-600/10 border border-fuchsia-600/30 rounded">Real-time</span>
          <span className="px-2 py-0.5 bg-indigo-600/10 border border-indigo-600/30 rounded">Open Source</span>
          <span className="px-2 py-0.5 bg-purple-600/10 border border-purple-600/30 rounded">Aura Metrics</span>
        </div>
      </div>

      <motion.div
        className="flex flex-col md:flex-row items-center justify-center gap-4 mb-12 z-40 relative"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Input
          placeholder="GitHub Username 1"
          value={user1}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUser1(e.target.value.replace(/https?:\/\/github.com\//, ""))}
          className="w-64 md:w-72 text-lg px-4 py-3 rounded-lg bg-zinc-900/70 backdrop-blur border border-zinc-700/60 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 transition shadow-lg focus:shadow-[0_0_18px_-2px_rgba(217,70,239,0.5)]"
          disabled={loading}
        />
        <span className="font-bold text-2xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-indigo-400 to-purple-400 animate-pulse drop-shadow-[0_0_12px_rgba(139,92,246,0.4)]">
          vs
        </span>
        <Input
          placeholder="GitHub Username 2"
          value={user2}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUser2(e.target.value.replace(/https?:\/\/github.com\//, ""))}
          className="w-64 md:w-72 text-lg px-4 py-3 rounded-lg bg-zinc-900/70 backdrop-blur border border-zinc-700/60 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-lg focus:shadow-[0_0_18px_-2px_rgba(99,102,241,0.5)]"
          disabled={loading}
        />
        <Button
          onClick={handleBattle}
          disabled={!user1 || !user2 || loading}
          className="ml-0 md:ml-4 px-8 py-3 text-lg font-semibold tracking-wide bg-gradient-to-br from-fuchsia-600 via-violet-600 to-indigo-600 hover:from-indigo-500 hover:via-fuchsia-600 hover:to-purple-600 transition shadow-[0_0_20px_-2px_rgba(168,85,247,0.5)] border border-fuchsia-400/30"
        >
          {loading ? "Comparing..." : "Compare"}
        </Button>
      </motion.div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.5 }}
            className="w-full z-40 relative"
          >
            <div className="flex flex-col md:flex-row items-center justify-center gap-10 mb-12">
              <motion.div className="relative" animate={result.winner === "user1" ? { scale: 1.05 } : {}} transition={{ type: "spring", stiffness: 200 }}>
                <div className="relative group">
                  <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-fuchsia-500/30 via-indigo-500/30 to-purple-600/30 opacity-0 group-hover:opacity-100 blur transition" />
                  <GitHubProfileCard profile={result.user1} highlight={result.winner === "user1"} />
                </div>
                {result.winner === "user1" && (
                  <motion.div className="absolute -top-6 left-1/2 -translate-x-1/2 text-3xl animate-bounce" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>🏆</motion.div>
                )}
              </motion.div>
              <span className="font-bold text-4xl text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-indigo-400 to-purple-400 drop-shadow-[0_0_25px_rgba(99,102,241,0.35)]">
                VS
              </span>
              <motion.div className="relative" animate={result.winner === "user2" ? { scale: 1.05 } : {}} transition={{ type: "spring", stiffness: 200 }}>
                <div className="relative group">
                  <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-indigo-500/30 via-fuchsia-500/30 to-purple-600/30 opacity-0 group-hover:opacity-100 blur transition" />
                  <GitHubProfileCard profile={result.user2} highlight={result.winner === "user2"} />
                </div>
                {result.winner === "user2" && (
                  <motion.div className="absolute -top-6 left-1/2 -translate-x-1/2 text-3xl animate-bounce" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>🏆</motion.div>
                )}
              </motion.div>
            </div>
            <div className="relative border border-zinc-700/60 rounded-xl bg-zinc-900/40 backdrop-blur px-4 py-6 shadow-[0_0_25px_-3px_rgba(139,92,246,0.25)]">
              <div className="absolute -top-px left-8 h-px w-32 bg-gradient-to-r from-transparent via-fuchsia-400/70 to-transparent" />
              <BattleResultTable results={result.results || []} />
            </div>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-12">
              <Button
                variant="outline"
                onClick={() => {
                  const url = window.location.href;
                  navigator.clipboard.writeText(url);
                }}
                className="shadow border-fuchsia-500/30 hover:border-fuchsia-400/60 hover:bg-fuchsia-500/10"
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
                className="shadow border-indigo-500/30 hover:border-indigo-400/60 hover:bg-indigo-500/10"
              >
                Rematch
              </Button>
              <Button
                variant="ghost"
                onClick={() => (window.location.href = "/leaderboard")}
                className="shadow hover:bg-purple-600/10"
              >
                Back to Leaderboard
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
