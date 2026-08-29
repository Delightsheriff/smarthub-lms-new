import { LMS_PREFIX } from "@/lib/api/constants";

/**
 * SIWES profile endpoints. Read-only list of the student's own SIWES
 * registrations — the PATCH for duration lives on the registration
 * resource itself and is owned by the acceptance-letters module.
 */
export const SIWES_PROFILE_ENDPOINTS = {
  MY_SIWES_REGISTRATIONS: `${LMS_PREFIX}/me/siwes-registrations`,
} as const;