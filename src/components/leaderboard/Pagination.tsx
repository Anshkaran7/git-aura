import { ChevronLeft, ChevronRight } from "lucide-react";
import { PaginationInfo } from "./types";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
}

export function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { currentPage, totalPages, hasPrevPage, hasNextPage } = pagination;

  return (
    <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-border">
      <Button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrevPage}
        variant="outline"
        size="icon"      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

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
            <Button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              variant={pageNum === currentPage ? "default" : "outline"}
            >
              {pageNum}
            </Button>
          );
        })}
      </div>

      <Button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage}
        variant="outline"
        size="icon"      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
