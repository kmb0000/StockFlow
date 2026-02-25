"use client";

import { cn } from "@/utils/cn";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

function getPageNumbers(
  currentPage: number,
  totalPages: number,
): (number | "...")[] {
  if (totalPages <= 5)
    return Array.from({ length: totalPages }, (_, i) => i + 1);

  const pages: (number | "...")[] = [1];

  if (currentPage > 3) pages.push("...");

  for (
    let i = Math.max(2, currentPage - 1);
    i <= Math.min(totalPages - 1, currentPage + 1);
    i++
  ) {
    pages.push(i);
  }

  if (currentPage < totalPages - 2) pages.push("...");

  pages.push(totalPages);

  return pages;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  return (
    <div className="flex gap-2">
      <button
        className="px-3 py-1 rounded-md border border-(--border) text-sm cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:border-(--primary) hover:text-(--primary) transition-all"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Précédent
      </button>

      {getPageNumbers(currentPage, totalPages).map((page, index) =>
        page === "..." ? (
          <span key={`dots-${index}`} className="px-3 py-1 text-sm opacity-40">
            ...
          </span>
        ) : (
          <button
            key={page}
            className={cn(
              "px-3 py-1 rounded-md text-sm cursor-pointer transition-all",
              page === currentPage
                ? "bg-(--primary) text-white"
                : "border border-(--border) hover:border-(--primary) hover:text-(--primary)",
            )}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ),
      )}

      <button
        className="px-3 py-1 rounded-md border border-(--border) text-sm cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:border-(--primary) hover:text-(--primary) transition-all"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Suivant
      </button>
    </div>
  );
}
