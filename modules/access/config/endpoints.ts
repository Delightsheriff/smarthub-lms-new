export const ACCESS_ENDPOINTS = {
  /** Deliberately reachable without an active enrolment — it is what
   *  explains the absence of one. */
  STATUS: "/lms/me/access-status",
} as const;
