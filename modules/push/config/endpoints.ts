import { LMS_PREFIX } from "@/lib/api/constants";

export const PUSH_ENDPOINTS = {
  CONFIG: `${LMS_PREFIX}/push/config`,
  SUBSCRIBE: `${LMS_PREFIX}/push/subscribe`,
  // Lives under the profile router (`/lms/profile/notification-prefs`),
  // not a `/notifications` collection — verified against
  // smarthub-api's profile.lms.routes.ts.
  PREFS: `${LMS_PREFIX}/profile/notification-prefs`,
} as const;
