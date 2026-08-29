import { LMS_PREFIX } from "@/lib/api/constants";

/**
 * Acceptance-letter endpoints. The list endpoint is the only read
 * surface; the duration-edit PATCH lives on the registration resource
 * because the duration is a property of the registration, not the
 * letter (the letter is regenerated from it).
 */
export const ACCEPTANCE_LETTERS_ENDPOINTS = {
  LIST: `${LMS_PREFIX}/acceptance-letters`,
  UPDATE_SIWES_DURATION: (id: string) =>
    `${LMS_PREFIX}/registrations/${id}/siwes-duration`,
} as const;