"use client";

import { cn } from "@/utils/cn";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  if (totalPages <= 1) return null; // Inutile d'afficher la pagination s'il n'y a qu'une page

  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2 py-4">
      {/* BOUTON PRÉCÉDENT */}
      <button
        className="flex items-center justify-center w-9 h-9 sm:w-auto sm:px-4 rounded-lg border border-(--border) text-sm font-medium transition-all hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed hover:border-(--primary) hover:text-(--primary)"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        title="Page précédente"
      >
        <ChevronLeft size={18} />
        <span className="hidden sm:inline ml-1">Précédent</span>
      </button>

      {/* NUMÉROS DE PAGES */}
      <div className="flex items-center gap-1">
        {getPageNumbers(currentPage, totalPages).map((page, index) =>
          page === "..." ? (
            <span
              key={`dots-${index}`}
              className="w-8 h-8 flex items-center justify-center text-sm text-(--text-secondary) opacity-50"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              className={cn(
                "w-9 h-9 rounded-lg text-sm font-semibold transition-all cursor-pointer",
                page === currentPage
                  ? "bg-(--primary) text-white shadow-md shadow-blue-500/20"
                  : "border border-(--border) text-(--text-secondary) hover:border-(--primary) hover:text-(--primary) hover:bg-white/5",
              )}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          ),
        )}
      </div>

      {/* BOUTON SUIVANT */}
      <button
        className="flex items-center justify-center w-9 h-9 sm:w-auto sm:px-4 rounded-lg border border-(--border) text-sm font-medium transition-all hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed hover:border-(--primary) hover:text-(--primary)"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        title="Page suivante"
      >
        <span className="hidden sm:inline mr-1">Suivant</span>
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
