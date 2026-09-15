import { LMS_PREFIX } from "@/lib/api/constants";

export const NOTIFICATIONS_ENDPOINTS = {
  LIST: `${LMS_PREFIX}/notifications`,
  // No server-side unread-count endpoint exists (smarthub-api only ever
  // returns the full list) — unread count is derived client-side in
  // notifications.queries.ts, same as the legacy app.
  MARK_READ: (id: string) => `${LMS_PREFIX}/notifications/${id}/read`,
  MARK_ALL_READ: `${LMS_PREFIX}/notifications/mark-all-read`,
} as const;
