import { LMS_PREFIX } from "@/lib/api/constants";

// Mounted at /lms/me on the backend (src/routes/lms-routes/me.lms.routes.ts),
// not /lms/progress — a separate "me" sub-router owns the gamification
// pulse (progress-pulse / achievements / cohort-pulse).
export const PROGRESS_ENDPOINTS = {
  ACHIEVEMENTS: `${LMS_PREFIX}/me/achievements`,
  PULSE: `${LMS_PREFIX}/me/progress-pulse`,
} as const;
