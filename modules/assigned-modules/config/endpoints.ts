import { LMS_PREFIX } from "@/lib/api/constants";

/**
 * Standalone modules an instructor has granted directly to a student
 * (not tied to any course). Served by smarthub-api at
 * `GET /lms/modules/assigned`.
 */
export const ASSIGNED_MODULES_ENDPOINTS = {
  ASSIGNED: `${LMS_PREFIX}/modules/assigned`,
} as const;
