/**
 * Tech Scholarship endpoints. Everything is per-applicant under
 * /scholarship-applications/me — the dashboard reads the application,
 * and the share dialog regenerates/updates its banner.
 */
export const SCHOLARSHIP_ENDPOINTS = {
  ME: "/scholarship-applications/me",
  BANNER: "/scholarship-applications/me/banner",
  PHOTO: "/scholarship-applications/me/photo",
} as const;