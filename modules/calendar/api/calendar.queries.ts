"use client";

import { useQuery } from "@tanstack/react-query";
import { calendarService } from "./calendar.service";
import { normaliseEvent } from "./normalise";
import type { CalendarEventUI } from "../types";

export const CALENDAR_QUERY_KEYS = {
  all: ["calendar", "events"] as const,
  range: (from?: string, to?: string) => ["calendar", "events", from, to] as const,
} as const;

export function useStudentCalendar(range?: { from?: string; to?: string }) {
  return useQuery<CalendarEventUI[]>({
    queryKey: CALENDAR_QUERY_KEYS.range(range?.from, range?.to),
    queryFn: async () => {
      const raw = await calendarService.getEvents(range);
      return (raw || []).map(normaliseEvent);
    },
  });
}

export function useUpcomingEvents(limit = 5) {
  const all = useStudentCalendar();
  return {
    ...all,
    data: (all.data || [])
      .filter((e) => !e.isCancelled && e.start.getTime() >= Date.now() - 3600 * 2 * 1000)
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .slice(0, limit),
  };
}
