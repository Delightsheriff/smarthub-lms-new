"use client";

import { useState } from "react";

/**
 * Live class or pre-recorded lecture? The only place the distinction
 * exists is the title prefix: the capture pipeline names a class `S3_…`
 * while uploaded lectures are `L28-…` (or unnumbered).
 * `googleDriveFileId` looks like the field for it and isn't.
 */
export type RecordingKind = "live" | "recorded";
export type SortDirection = "default" | "reversed";

export const recordingKindOf = (title?: string | null): RecordingKind =>
  /^\s*S\s*\d/i.test(String(title ?? "")) ? "live" : "recorded";

export interface ContentFilterOptions<T> {
  getTitle: (item: T) => string;
  /** Omit for lists with no live/recorded split (materials, assignments). */
  getKind?: (item: T) => RecordingKind;
  getSubtitle?: (item: T) => string | undefined;
}

/**
 * Pure: search, then kind, then order. Runs BEFORE paging so a match on
 * page 4 isn't hidden. Reversing never re-sorts by another key, so the
 * server's ordering (and series grouping) survives. Copies before
 * reversing — the input is the query cache's array.
 */
export function filterContent<T>(
  items: T[],
  opts: ContentFilterOptions<T>,
  state: { query: string; kind: RecordingKind | "all"; direction: SortDirection },
): T[] {
  const q = state.query.trim().toLowerCase();
  let rows = items;
  if (q) {
    rows = rows.filter((i) =>
      `${opts.getTitle(i)} ${opts.getSubtitle?.(i) ?? ""}`.toLowerCase().includes(q),
    );
  }
  if (state.kind !== "all" && opts.getKind) {
    const getKind = opts.getKind;
    rows = rows.filter((i) => getKind(i) === state.kind);
  }
  return state.direction === "reversed" ? [...rows].reverse() : rows;
}

/** Search + kind + order state for one content list. Client-side on
 *  purpose: these lists arrive whole, so a round trip per keystroke buys
 *  nothing. */
export function useContentFilter<T>(items: T[], opts: ContentFilterOptions<T>) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<RecordingKind | "all">("all");
  const [direction, setDirection] = useState<SortDirection>("default");
  const filtered = filterContent(items, opts, { query, kind, direction });
  return {
    query,
    setQuery,
    kind,
    setKind,
    direction,
    setDirection,
    filtered,
    /** True when a filter is hiding something. */
    isFiltered: query.trim().length > 0 || kind !== "all",
    total: items.length,
  };
}
