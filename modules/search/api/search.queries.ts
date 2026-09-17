"use client";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { searchService } from "./search.service";
import { STALE_TIME } from "@/lib/query-config";

export const SEARCH_QUERY_KEYS = {
  query: (q: string) => ["search", q] as const,
};

/**
 * Fetches grouped search results for `q`. Disabled below 2 chars (the
 * server returns `[]` there anyway). `signal` flows into the service so
 * a superseded request is aborted; `keepPreviousData` keeps the last
 * good groups on screen while the next query settles, so the list
 * doesn't flash empty between keystrokes.
 */
export function useSearch(q: string) {
  const trimmed = q.trim();
  return useQuery({
    queryKey: SEARCH_QUERY_KEYS.query(trimmed),
    queryFn: ({ signal }) => searchService.query(trimmed, signal),
    enabled: trimmed.length >= 2,
    placeholderData: keepPreviousData,
    staleTime: STALE_TIME.REALTIME,
  });
}
