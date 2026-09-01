import { LMS_PREFIX } from "@/lib/api/constants";

export const PROGRESS_ENDPOINTS = {
  ACHIEVEMENTS: `${LMS_PREFIX}/progress/achievements`,
  PULSE: `${LMS_PREFIX}/progress/pulse`,
} as const;
