import { LMS_PREFIX } from "@/lib/api/constants";

/**
 * Instructor earnings surface. Read-only — the admin runs payouts
 * ("Run payout" on the admin instructor-pay page); this endpoint is
 * transparency only, no self-serve request.
 */
export const INSTRUCTOR_EARNINGS_ENDPOINTS = {
  /** GET — the calling instructor's own earnings: pending/processing/
   *  paid totals, per-cohort breakdown, payout history. */
  ME: `${LMS_PREFIX}/instructor-earnings/me`,
  /** GET — the caller's per-student revenue breakdown (who paid, how
   *  much, and their cut for the flat models). */
  BREAKDOWN: `${LMS_PREFIX}/instructor-earnings/breakdown`,
} as const;