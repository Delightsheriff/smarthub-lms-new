# PLAN 012 — Auth Flows + Real API Swap (Final)

**Status:** Draft (awaiting confirmation)
**Owner:** SmartHub port
**Depends on:** 001 (foundation seam + mock), 002 (app/auth route groups),
004–011 (all UI built against the mock)

---

## 1. Goal

The **final** slice. Two halves, in order:

1. **Auth flows** — replace the mock-seeded session with real login / forgot /
   reset / accept-invitation / change-password, `useEffectiveMode`, `next-path`,
   and a real auth gate on the `(app)` shell (stubbed since Plan 002).
2. **API swap** — swap the Foundation **mock data-source adapter** behind the
   API-client seam for the **real axios client** (single-flight 401 refresh,
   bearer token, auto-toasts, `ApiError`). Because every module consumes the
   API-client seam (and nothing touches axios directly), the swap touches only
   the adapter — normalisers, types, stores and all screens stay as-is.

This closes the loop on the UI-first strategy: the product is already fully
built and verified against the mock; this plan just points it at the real
backend and adds authentication.

## 2. Scope

### In scope
- **Auth flows**
  - `authStore` — real token + user lifecycle (login/set-logout), `useMe()`.
  - `(auth)` routes (stubbed since Plan 002): login, forgot-password,
    reset-password/[token], accept-invitation — full forms + validation.
  - `change-password` surface (under profile/security, completed here).
  - `useEffectiveMode` — mode-aware nav/landing (student/instructor/both).
  - `next-path` helper — preserve `?next=` across the login redirect.
  - `(app)` layout auth gate — redirect `/login?next=` on unauthenticated
    visit (moved from the mock-seeded placeholder gating to real).
- **API swap**
  - `lib/api/client.ts` real axios adapter behind the seam: bearer token
    stamping, single-flight 401 refresh, auto success/error toasts, `silent`,
    get/getBlob/post/put/patch/delete, `ApiError`.
  - `lib/socket/socket-provider.tsx` — real socket.io-client wiring (the mock
    emitter seam retained for tests).
  - Wire the query provider + stores to the real client.
  - Remove / gate the `lib/api/mock/` adapter behind the seam (keep as a
    test fixture / env-switched data source, not the default).
- Types (reuse Foundation's `lib/api/types.ts` — already mirrors
  `smarthub-api`): `AuthUser`, `LoginRequest`, `LoginResponse`,
  `InvitationStatus`, `VerifyInvitationResponse`, `AcceptInvitationPayload`.
- **`CONTEXT.md` + ADRs** — finalize glossary; record the API-swap/UI-first
  outcome ADR and the auth-architecture decisions.

### Out of scope
- Building any new business screen (all exist).
- Payment/upload integration details beyond what the seam already exposes
  (still behind the storage seam; real integrations are future work).
- Admin/back-office surfaces (this port is the LMS product surface).

## 3. Source reference

- `smarthub-core-lms/src/modules/auth/**` — `api/{auth,invitations}.*`,
  `components/{LoginPageContent,ForgotPasswordForm,ResetPasswordForm,
  AcceptInvitationPageContent,ChangePasswordForm}`, `hooks/use-effective-mode`,
  `lib/next-path`, `config/endpoints.ts`.
- `smarthub-core-lms/src/lib/api/client.ts`, `types/` — the axios client to
  re-author (interface already captured in Foundation).
- `smarthub-core-lms/src/lib/socket/socket-provider.tsx`.
- `smarthub-core-lms/src/store/slices/authStore.ts`.
- `smarthub-api` — auth routes/controllers for the exact request/response
  contract (login, refresh, logout, me, password reset flows).

## 4. Target files / structure

```
modules/auth/
  api/auth.service.ts
  api/auth.queries.ts
  api/invitations.service.ts
  api/invitations.queries.ts
  api/use-current-user.ts
  components/LoginPageContent.tsx
  components/ForgotPasswordForm.tsx
  components/ResetPasswordForm.tsx
  components/AcceptInvitationPageContent.tsx
  components/ChangePasswordForm.tsx
  config/endpoints.ts
  config/invitations.endpoints.ts
  hooks/use-effective-mode.ts
  lib/next-path.ts
  types/index.ts            (AuthUser, LoginRequest/Response, invitation types)
lib/api/
  client.ts                 (REAL axios adapter now)
  types.ts                  (mirrored smarthub-api contract — unchanged)
  mock/                     (retained as test fixture / non-default source)
lib/socket/
  socket-provider.tsx       (real socket.io wiring)
store/slices/authStore.ts   (real token/user lifecycle)
app/(auth)/{login,forgot-password,reset-password/[token],accept-invitation}/
app/(app)/layout.tsx        (real auth gate)
```

## 5. shadcn components to use

- `button`, `input`, `label`, `form` (RHF + zod), `card` (auth panel),
  `alert` (error), `separator`, `tabs` (change-password), `password` inputs,
  `checkbox` (remember me), `sonner` toasts.

## 6. Steps

1. Re-author `lib/api/client.ts` as the real axios adapter behind the seam;
   keep the mock adapter registered as an alternate source (env switch).
2. Implement `authStore` (real token + refresh persistence), `useMe()`.
3. Port the auth service/queries + endpoints + normalisation.
4. Build the `(auth)` route forms (login/forgot/reset/accept-invitation)
   against the real client; wire `next-path`.
5. Wire the `(app)` layout auth gate (real redirect to `/login?next=`).
6. Re-author `socket-provider.tsx` with real socket.io-client.
7. Swap the query provider + stores from mock to real client; remove the
   default mock wiring (keep as test fixture).
8. Wire `useEffectiveMode` + change-password under profile/security.
9. Full verification: typecheck, lint, build, dev-boot, and an end-to-end
   login → app → logout smoke pass (manual against a running backend or a
   throwaway seeded dev backend).

## 6.5 Architecture brief (see `ARCHITECTURE.md`)

1. **Deepen** — the auth module's surface is small and deep: login/logout/
   me/refresh behind `authStore` + `useMe`; the axios client is the deep seam
   hiding token stamping, refresh single-flight and error normalisation.
   Deletion-test: if deleted, the complexity lands back in every component —
   so it's earning its keep.
2. **Seams** — this is the **payoff of the two-adapter data-source seam**
   established in Foundation: the swap is one adapter replacement, verified by
   the mock-backed tests still passing against the same interface. Auth gate
   reads `isAuthenticated` in the store (interface = store), not axios.
3. **Testability** — the single-flight 401 refresh and token stamping logic
   is testable through the client surface with a mock transport; the auth
   gate is tested through the store; login form validation via zod schemas.
   The mock adapter is retained as the test fixture so suite still runs
   hermetically without a live backend.
4. **ADR** — record: (a) UI-first strategy closed out — screens built against
   a backend-faithful mock then swapped via a single data-source seam; (b) the
   axios client contract + single-flight refresh; (c) auth gate via the store.

## 7. Acceptance checks

- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` passes (where feasible)
- [ ] `npm run dev` boots
- [ ] Unauthenticated visit to an `(app)` route redirects to `/login?next=`
- [ ] Login flow real (against backend/dev backend) sets the session; logout
      clears it; refresh keeps a session alive across a 401
- [ ] Forgot/reset/accept-invitation/change-password flows render + submit
- [ ] `useEffectiveMode` drives the landing/nav for student/instructor/both
- [ ] All screens (004–011) still render identically against the real client
      (only the adapter changed)
- [ ] Mock-adapter tests still pass hermetically (fixture retained)
- [ ] ADRs + final `CONTEXT.md` notes recorded

## 8. Open questions / to confirm

- Backend connectivity for the live smoke pass: do we target a running local
  `smarthub-api`, a seeded dev backend, or a CI-only verification with the
  mock fixturing the suite? Confirm.
- Retain the mock as an **env-switched** alternate source in production builds,
  or strip it to test-fixture-only? Confirm (recommend fixture-only: smaller
  bundle, no risk of shipping mock as default).
- Auth persistence: localStorage keys (source-style) vs httpOnly-cookie
  refresh. Confirm before implementing the token store.
- Include `@sentry/nextjs` wiring here or defer entirely? Confirm.
