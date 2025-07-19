import { ChevronLeft, ChevronRight } from "lucide-react";
import { PaginationInfo } from "./types";

interface PaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
}

export function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { currentPage, totalPages, hasPrevPage, hasNextPage } = pagination;

  return (
    <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-[#21262d]">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrevPage}
        className="p-2 rounded-md bg-[#161b21] border border-[#21262d] text-[#7d8590] hover:text-white hover:bg-[#21262d] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-1">
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum;
          if (totalPages <= 5) {
            pageNum = i + 1;
          } else if (currentPage <= 3) {
            pageNum = i + 1;
          } else if (currentPage >= totalPages - 2) {
            pageNum = totalPages - 4 + i;
          } else {
            pageNum = currentPage - 2 + i;
          }

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                pageNum === currentPage
                  ? "bg-[#39d353] text-black"
                  : "bg-[#161b21] border border-[#21262d] text-[#7d8590] hover:text-white hover:bg-[#21262d]"
              }`}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage}
        className="p-2 rounded-md bg-[#161b21] border border-[#21262d] text-[#7d8590] hover:text-white hover:bg-[#21262d] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
