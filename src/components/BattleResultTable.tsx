import React from "react";

interface MetricResult {
  key: string;
  label: string;
  value1: number | string;
  value2: number | string;
  winner: "user1" | "user2" | null;
}

interface BattleResultTableProps {
  results: MetricResult[];
}

const BattleResultTable: React.FC<BattleResultTableProps> = ({ results }) => {
  const safeResults = Array.isArray(results) ? results : [];
  return (
    <div className="w-full max-w-xl mx-auto mt-6">
      <table className="w-full border-collapse bg-[#181c23] rounded-lg overflow-hidden text-white">
        <thead>
          <tr className="bg-[#23272f]">
            <th className="py-2 px-4 text-left">Metric</th>
            <th className="py-2 px-4 text-center">User 1</th>
            <th className="py-2 px-4 text-center">User 2</th>
          </tr>
        </thead>
        <tbody>
          {safeResults.map((r) => (
            <tr key={r.key} className="border-t border-gray-700">
              <td className="py-2 px-4 font-semibold">{r.label}</td>
              <td className={`py-2 px-4 text-center ${r.winner === "user1" ? "bg-yellow-900/40 font-bold" : ""}`}>{r.value1}</td>
              <td className={`py-2 px-4 text-center ${r.winner === "user2" ? "bg-yellow-900/40 font-bold" : ""}`}>{r.value2}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BattleResultTable;
