"use client";

import { useQuery } from "@tanstack/react-query";
import { progressService } from "./progress.service";
import { STALE_TIME } from "@/lib/query-config";

export const PROGRESS_QUERY_KEYS = {
  achievements: ["progress", "achievements"] as const,
  pulse: ["progress", "pulse"] as const,
} as const;

export function useAchievements() {
  return useQuery({
    queryKey: PROGRESS_QUERY_KEYS.achievements,
    queryFn: () => progressService.getAchievements(),
    staleTime: STALE_TIME.EXTENDED,
  });
}

export function useProgressPulse() {
  return useQuery({
    queryKey: PROGRESS_QUERY_KEYS.pulse,
    queryFn: () => progressService.getPulse(),
    staleTime: STALE_TIME.SLOW,
  });
}
