"use client";
import { useQuery } from "@tanstack/react-query";
import { instructorEarningsService } from "./instructor-earnings.service";

export const INSTRUCTOR_EARNINGS_KEYS = {
  all: ["instructor-earnings"] as const,
  mine: ["instructor-earnings", "me"] as const,
  breakdown: ["instructor-earnings", "breakdown"] as const,
};

/** The calling instructor's earnings — totals, per-cohort breakdown,
 *  and payout history. Read-only; refetched on window focus so the
 *  view keeps up as the admin runs payouts. */
export function useMyInstructorEarnings() {
  return useQuery({
    queryKey: INSTRUCTOR_EARNINGS_KEYS.mine,
    queryFn: () => instructorEarningsService.getMine(),
  });
}

/** The caller's per-student revenue breakdown — who paid, how much, and
 *  their cut for the flat models. Computed live from current collections
 *  (refetched on window focus, like the earnings summary). */
export function useMyInstructorRevenueBreakdown() {
  return useQuery({
    queryKey: INSTRUCTOR_EARNINGS_KEYS.breakdown,
    queryFn: () => instructorEarningsService.getMineBreakdown(),
  });
}