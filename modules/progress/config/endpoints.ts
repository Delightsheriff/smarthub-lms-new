import { LMS_PREFIX } from "@/lib/api/constants";

/**
 * Endpoint constants for the gamification surface. All under the
 * canonical /lms/me prefix.
 */
export const PROGRESS_ENDPOINTS = {
  PULSE: `${LMS_PREFIX}/me/progress-pulse`,
  ACHIEVEMENTS: `${LMS_PREFIX}/me/achievements`,
  COHORT_PULSE: `${LMS_PREFIX}/me/cohort-pulse`,
} as const;
