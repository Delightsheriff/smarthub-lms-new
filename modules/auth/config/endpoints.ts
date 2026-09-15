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
  LOGIN: "/auth/login",
  // No server-side /auth/logout route exists (JWT logout is
  // client-side-only here) — this call 404s and is deliberately
  // `{ silent: true }` at the call site so it's a harmless no-op
  // rather than a user-visible error.
  LOGOUT: "/auth/logout",
  ME: "/auth/me",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
  CHANGE_PASSWORD: "/auth/change-password",
  // Token is a query param server-side (`GET /invitations/verify?token=`),
  // not a path segment.
  VERIFY_INVITATION: (token: string) =>
    `/invitations/verify?token=${encodeURIComponent(token)}`,
  ACCEPT_INVITATION: "/invitations/accept",
} as const;