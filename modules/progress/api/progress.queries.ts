"use client";

import { useQuery } from "@tanstack/react-query";
import { progressService } from "./progress.service";

/** All three queries share a stale window — the dashboard reloads
 *  them in concert so the widget never shows a mix of fresh/stale
 *  numbers. */
const STALE_MS = 60_000;

export const useProgressPulse = () =>
  useQuery({
    queryKey: ["lms", "progress-pulse"],
    queryFn: () => progressService.pulse(),
    staleTime: STALE_MS,
  });

export const useAchievements = () =>
  useQuery({
    queryKey: ["lms", "achievements"],
    queryFn: () => progressService.achievements(),
    staleTime: STALE_MS,
  });

export const useCohortPulse = () =>
  useQuery({
    queryKey: ["lms", "cohort-pulse"],
    queryFn: () => progressService.cohortPulse(),
    staleTime: STALE_MS,
  });
