"use client";

import { useQuery } from "@tanstack/react-query";
import { progressService } from "./progress.service";

export const PROGRESS_QUERY_KEYS = {
  achievements: ["progress", "achievements"] as const,
  pulse: ["progress", "pulse"] as const,
} as const;

export function useAchievements() {
  return useQuery({
    queryKey: PROGRESS_QUERY_KEYS.achievements,
    queryFn: () => progressService.getAchievements(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useProgressPulse() {
  return useQuery({
    queryKey: PROGRESS_QUERY_KEYS.pulse,
    queryFn: () => progressService.getPulse(),
    staleTime: 5 * 60 * 1000,
  });
}
