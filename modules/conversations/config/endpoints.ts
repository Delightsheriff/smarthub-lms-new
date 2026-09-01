import { LMS_PREFIX } from "@/lib/api/constants";

export const CONVERSATIONS_ENDPOINTS = {
  LIST: `${LMS_PREFIX}/conversations`,
} as const;
