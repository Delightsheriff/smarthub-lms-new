import { LMS_PREFIX } from "@/lib/api/constants";

export const WEBINAR_ENDPOINTS = {
  LIST: `${LMS_PREFIX}/webinars`,
} as const;
