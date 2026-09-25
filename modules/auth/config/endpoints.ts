/**
 * Auth lives at the API root (`/auth`, `/invitations`), never under
 * `LMS_PREFIX` ("/lms"): `/lms/*` is gated by `requireLmsAccess`, which
 * itself requires an authenticated request — a login endpoint behind
 * that gate would be unreachable by definition. Every path here was
 * verified against smarthub-api's actual route mounts
 * (`src/routes/index.ts`, `src/routes/auth.routes.ts`,
 * `src/routes/invitations.routes.ts`).
 */
export const AUTH_ENDPOINTS = {
  // LOGIN/LOGOUT aren't here: sign-in goes through NextAuth's
  // Credentials provider (auth.ts fetches /auth/login server-side
  // directly, bypassing this browser-facing apiClient); sign-out
  // clears the NextAuth session cookie client-side, and no server-side
  // /auth/logout route exists to call anyway.
  ME: "/auth/me",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
  VERIFY_RESET_TOKEN: (token: string) => `/auth/verify-reset-token/${encodeURIComponent(token)}`,
  CHANGE_PASSWORD: "/auth/change-password",
  // Token is a query param server-side (`GET /invitations/verify?token=`),
  // not a path segment.
  VERIFY_INVITATION: (token: string) =>
    `/invitations/verify?token=${encodeURIComponent(token)}`,
  ACCEPT_INVITATION: "/invitations/accept",
} as const;