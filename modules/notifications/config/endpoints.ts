import { LMS_PREFIX } from "@/lib/api/constants";

export const NOTIFICATIONS_ENDPOINTS = {
  LIST: `${LMS_PREFIX}/notifications`,
  UNREAD_COUNT: `${LMS_PREFIX}/notifications/unread-count`,
  MARK_READ: (id: string) => `${LMS_PREFIX}/notifications/${id}/read`,
  MARK_ALL_READ: `${LMS_PREFIX}/notifications/mark-all-read`,
} as const;
