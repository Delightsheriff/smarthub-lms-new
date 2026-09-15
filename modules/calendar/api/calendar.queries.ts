"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { calendarService } from "./calendar.service";
import { normaliseEvent } from "./normalise";
import type { CalendarEventUI } from "../types";

export const CALENDAR_QUERY_KEYS = {
  all: ["calendar", "events"] as const,
  range: (from?: string, to?: string) => ["calendar", "events", from, to] as const,
} as const;

// The backend requires both `from` and `to` (400s otherwise) — every
// current call site fetches once and slices client-side (month/week/day
// navigation, upcoming-events filtering) rather than re-querying per
// view, so default to a window wide enough to cover that: 3 months back
// to 6 months ahead. Narrowing this to a real per-view range is a
// separate, larger change to how the calendar page fetches.
function defaultRange(): { from: string; to: string } {
  const now = new Date();
  const from = new Date(now);
  from.setMonth(from.getMonth() - 3);
  const to = new Date(now);
  to.setMonth(to.getMonth() + 6);
  return { from: from.toISOString(), to: to.toISOString() };
}

export function useStudentCalendar(range?: { from?: string; to?: string }) {
  // Memoized on the primitive override values (not `defaultRange()`,
  // which mints a fresh `new Date()` — and therefore a new query key —
  // on every render). Without this the query key never stabilises and
  // React Query treats every render as a brand new query, polling the
  // backend in a tight loop.
  const { from, to } = useMemo(
    () => ({ ...defaultRange(), ...range }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [range?.from, range?.to],
  );

  return useQuery<CalendarEventUI[]>({
    queryKey: CALENDAR_QUERY_KEYS.range(from, to),
    queryFn: async () => {
      const raw = await calendarService.getEvents({ from, to });
      return (raw || []).map(normaliseEvent);
    },
  });
}

export function useUpcomingEvents(limit = 5) {
  const all = useStudentCalendar();
  const [now] = useState(() => Date.now());

  const data = useMemo(() => {
    const cutoff = now - 3600 * 2 * 1000;
    return (all.data || [])
      .filter((e) => !e.isCancelled && e.start.getTime() >= cutoff)
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .slice(0, limit);
  }, [all.data, limit, now]);

  return {
    ...all,
    data,
  };
}
