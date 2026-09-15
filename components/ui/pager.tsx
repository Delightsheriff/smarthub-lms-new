"use client";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Previous / Next pager for paginated lists.
 * Rebuilt using shadcn Button and design system tokens.
 */
export function Pager({
  page,
  totalPages,
  onPage,
  label,
}: {
  page: number;
  totalPages: number;
  onPage: (next: number) => void;
  /** e.g. "12 recordings" — the count this pager is moving through. */
  label?: string;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between gap-3 pt-3">
      <span className="text-xs text-muted-foreground">
        {label ? `${label} · ` : ""}Page {page} of {totalPages}
      </span>
      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPage(Math.max(1, page - 1))}
          className="h-8 gap-1 px-2.5 text-xs font-medium"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Previous</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPage(Math.min(totalPages, page + 1))}
          className="h-8 gap-1 px-2.5 text-xs font-medium"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

/**
 * Slice an in-memory list into pages, keeping the page number in range.
 */
export function usePagedList<T>(items: T[], pageSize: number) {
  const [rawPage, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(Math.max(1, rawPage), totalPages);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  return { page, setPage, totalPages, pageItems };
}
