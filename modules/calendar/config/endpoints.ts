import { LMS_PREFIX } from "@/lib/api/constants";

export const CALENDAR_ENDPOINTS = {
  LIST: `${LMS_PREFIX}/calendar`,
} as const;
