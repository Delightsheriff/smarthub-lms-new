import { LMS_PREFIX } from "@/lib/api/constants";

export const PUSH_ENDPOINTS = {
  CONFIG: `${LMS_PREFIX}/push/config`,
  SUBSCRIBE: `${LMS_PREFIX}/push/subscribe`,
  PREFS: `${LMS_PREFIX}/notifications/prefs`,
} as const;
