/**
 * Auth wire surface. Auth lives at the unprefixed root, NOT under
 * /lms — the user isn't a student until after login resolves. During
 * the UI-first phase only the set-password mutation is served by the
 * mock; the full login/reset/session surface lands with Plan 012.
 */
export const AUTH_ENDPOINTS = {
  SET_PASSWORD: "/auth/set-password",
} as const;