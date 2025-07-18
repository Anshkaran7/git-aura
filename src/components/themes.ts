import { Theme } from "./types";

export const themes: Theme[] = [
  {
    name: "Light",
    background: "bg-gray-50",
    cardBackground: "bg-white",
    text: "text-gray-900",
    border: "border-gray-200",
    contribution: {
      level0: "bg-gray-100",
      level1: "bg-emerald-200",
      level2: "bg-emerald-400",
      level3: "bg-emerald-500",
      level4: "bg-emerald-600",
    },
  },
  {
    name: "Dark",
    background: "bg-[#0d1117]",
    cardBackground: "bg-[#161b22]",
    text: "text-gray-200",
    border: "border-gray-800",
    contribution: {
      level0: "bg-[#161b22]",
      level1: "bg-[#0e4429]",
      level2: "bg-[#006d32]",
      level3: "bg-[#26a641]",
      level4: "bg-[#39d353]",
    },
  },
  {
    name: "Ocean Dark",
    background: "bg-[#0f172a]",
    cardBackground: "bg-[#1e293b]",
    text: "text-[#e2e8f0]",
    border: "border-[#1e293b]",
    contribution: {
      level0: "bg-[#0f172a]",
      level1: "bg-[#0c4a6e]",
      level2: "bg-[#0369a1]",
      level3: "bg-[#0ea5e9]",
      level4: "bg-[#38bdf8]",
    },
  },
];
