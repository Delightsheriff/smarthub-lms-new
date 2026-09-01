import { LMS_PREFIX } from "@/lib/api/constants";

export const ACTIVITY_ENDPOINTS = {
  ME: `${LMS_PREFIX}/activity`,
} as const;
