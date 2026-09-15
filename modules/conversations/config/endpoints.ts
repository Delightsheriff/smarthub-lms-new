import { LMS_PREFIX } from "@/lib/api/constants";

export const CONVERSATIONS_ENDPOINTS = {
  LIST: `${LMS_PREFIX}/conversations`,
  MARK_READ: (id: string) => `${LMS_PREFIX}/conversations/${id}/read`,
} as const;
