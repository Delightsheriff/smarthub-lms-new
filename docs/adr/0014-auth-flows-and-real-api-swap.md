# 0014. Auth Flows and Real API Swap

Date: 2026-09-01
Status: Accepted

## Context

The SmartHub LMS porting project followed a strict **UI-first strategy** across Plans 001 to 011. All domain modules (courses, learning, assignments, calendar, activity, webinars, inbox, notifications, profile, billing, internships, oreo, and teaching) were built and verified against a unified API-client seam (`lib/api/client.ts`).

Plan 012 represents the final swap to production authentication and real backend APIs (`smarthub-api`).

## Decision

1. **Production Axios Client**:
   - Re-authored `lib/api/client.ts` using Axios with a configurable `NEXT_PUBLIC_API_URL` base URL.
   - Request interceptor automatically stamps Bearer tokens from `useAuthStore`.
   - Response interceptor handles single-flight 401 token refresh via `/lms/auth/refresh` without duplicate requests.
   - Non-silent request errors automatically trigger Sonner toast notifications and throw `ApiError`.

2. **Complete Removal of Mock Adapter**:
   - Removed `lib/api/mock/` completely along with synthetic data structures and canned mock routers.
   - All modules communicate exclusively with the real API endpoint structure defined in `smarthub-api`.

3. **Authentication & Shell Protection**:
   - Real authentication store (`useAuthStore`) managing `user` projection and `token` state.
   - `AppShell` enforces protected routes by checking `isAuthenticated` and redirecting unauthenticated users to `/login?next=...`.
   - Real Socket.io client (`socket.io-client`) connected to `NEXT_PUBLIC_SOCKET_URL` with bearer token handshake.

## Consequences

- The application is fully wired for production authentication and real REST/WebSocket API endpoints.
- No synthetic mock data remains in the codebase bundle.
- The UI-first data-source seam proved successful: zero component or domain normaliser changes were required during the swap.
