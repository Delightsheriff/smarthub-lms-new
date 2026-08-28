# PLAN 002 — App Shell & Routes Skeleton

**Status:** Draft (awaiting confirmation)
**Owner:** SmartHub port
**Depends on:** 001

---

## 1. Goal

Recreate the top-level Next.js routing skeleton and the app shell, so every
future module has a home. Establishes the `(app)` vs `(auth)` split, the root
layout, and all the global route/files (middleware, manifest, robots, 404,
error boundary, redirects). No real screens yet — page stubs that render a
placeholder within the new design system. **UI-first:** the shell mounts
against the seeded mock — the `(auth)` group and auth gate are *stubs* now,
completed in the final Auth/API plan (auth last).

## 2. Scope

### In scope
- `app/layout.tsx` — root layout: font (`Inter`/system), metadata (title
  template "%s · SmartHub", robots noindex), viewport (theme-color,
  pinch-zoom), `AppProviders` wrapper.
- `(app)` route group + `layout.tsx` — shell that reads the **seeded mock
  session** from `authStore` (no real auth yet; a mock "signed-in" user is
  pre-seeded so the `(app)` routes render). Mounts minimal chrome (full
  chrome in Plan 004) + main content region.
- `(auth)` route group + `layout.tsx` — centered panel layout.
- Global files: `middleware.ts` (robots header), `not-found.tsx`,
  `global-error.tsx`, `manifest.ts`, `robots.ts`, `instrumentation.ts`.
- Root `app/page.tsx` → redirect `/dashboard`.
- Page stubs for the known routes (each renders a "Coming soon" placeholder
  within the shell) so navigation has targets.

### Out of scope (explicitly deferred)
- Real auth flows — **final plan (Auth/API swap, last)**. `(auth)` route
  stubs exist here only as placeholders.
- Full navigation chrome / sidebar / mobile menu (Plan 004).
- Any module business logic.

## 3. Source reference

- `smarthub-core-lms/src/app/layout.tsx`, `(app)/layout.tsx`, `(auth)/layout.tsx`
- `smarthub-core-lms/src/app/{middleware,manifest,robots,instrumentation,not-found,global-error,page}.ts`
- `smarthub-core-lms/src/components/layout/*` (chrome comes 004)

## 4. Target files / structure

```
app/
  layout.tsx
  page.tsx                  (redirect /dashboard)
  middleware.ts
  manifest.ts
  robots.ts
  instrumentation.ts
  not-found.tsx
  global-error.tsx
  (app)/
    layout.tsx
    dashboard/page.tsx       (stub)
    courses/page.tsx         (stub)
    recordings/page.tsx      (stub)
    materials/page.tsx       (stub)
    assignments/page.tsx     (stub)
    assigned/page.tsx        (stub)
    teach/page.tsx           (stub)
    calendar/page.tsx        (stub)
    inbox/page.tsx           (stub)
    notifications/page.tsx   (stub)
    activity/page.tsx        (stub)
    webinars/page.tsx        (stub)
    oreo/page.tsx            (stub)
    help/page.tsx            (stub)
    profile/page.tsx         (stub)
    billing/page.tsx         (stub)
    payments/page.tsx        (stub)
    internships/page.tsx     (stub)
    refer-and-earn/page.tsx  (stub)
    check-in/page.tsx        (stub)
  (auth)/
    layout.tsx
    login/page.tsx           (stub)
    forgot-password/page.tsx (stub)
    reset-password/[token]/page.tsx (stub)
    accept-invitation/page.tsx (stub)
```

## 5. shadcn components to use

- `skeleton` (for placeholder states), maybe `card` for a basic "coming soon"
  block. Rest comes in later plans.

## 6. Steps

1. Root layout + providers + metadata/viewport.
2. `(app)` guard layout + route stubs.
3. `(auth)` layout + route stubs.
4. Global files (middleware, manifest, robots, instrumentation, 404, error).
5. Root redirect.
6. Verify all routes render placeholders within the shell.

## 7. Acceptance checks

## 6.5 Architecture brief (see `ARCHITECTURE.md`)

1. **Deepen** — route files stay thin pass-throughs; the real surface is the
   shell layout + providers. Deletion-test: the shell must concentrate
   complexity (auth gate, providers, gating), not just render children.
2. **Seams** — providers are the seams (auth store, query, theme, socket);
   keep each provider as a small independent module with a clear interface —
   no provider coupling. In the mock phase the query provider + auth store are
   backed by the mock seeded session.
3. **Testability** — the shell's gating reads `isAuthenticated` in the store
   (interface = the store); no HTTP mocking in the layout. New tests follow
   the pattern established in Foundation (a mock-seeded "authenticated" state
   renders the `(app)` shell; an unseeded one redirects).
4. **ADR** — record the `(app)`/`(auth)` route-group split and the
   gating/paywall layering once stable.

- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] Visiting `/`, `/dashboard`, `/login` etc. reach the right shell/placeholder
- [ ] With mock-seeded session, `(app)` routes render in the shell; without
      one (or unseeded), they redirect to the (stub) login — both tested

## 8. Open questions / to confirm

- Confirm the list of stub routes matches what we want (can prune later).
- `manifest.ts` — confirm brand name "SmartHub" and start URL `/dashboard`.
