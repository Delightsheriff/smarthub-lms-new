# ADR 0006 — Route groups `(app)`/`(auth)` + gating layering; `headers` over `proxy`

- **Status:** Accepted
- **Date:** 2026-08 (Plan 002)

## Context

The app needs a protected LMS shell and a small set of public (auth)
routes, and a way to keep staging/port builds out of search engines. The
legacy codebase solved the header-side with `middleware.ts`.

## Decision

1. **Two route groups:**
   - **`(app)`** — the gated LMS shell. Its `layout.tsx` is a thin server
     component; the actual **gate lives in `AppShell`** (client), which
     reads `isAuthenticated` from `authStore` (the interface — no HTTP
     mocking) and `redirect("/login")` when absent. The shell *concentrates*
     gating + providers rather than each page.
   - **`(auth)`** — a public, centered panel. No gating. Real auth screens
     land at Plan 012; stubs only now.

2. **No `proxy.ts` in this slice.** Next 16 renamed `middleware.ts` →
   `proxy.ts` and permits only **one** `proxy.ts` per project; the docs
   call it a **last resort**. Auth (the reason a proxy would exist) ships
   at Plan 012, so we defer creating it.

3. **Global `noindex` via `next.config.ts` `headers()`** — the idiomatic
   replacement for the old middleware `X-Robots-Tag` approach — plus a
   matching `robots.ts` metadata convention and a `/` → `/dashboard`
   redirect for the landing route.

## Consequences

- **Positive:** the gate is testable through the store interface; route
  files stay thin pass-throughs; no empty/throwaway `proxy.ts`.
- **Positive:** `noindex` is config-driven (single source), not a runtime
  layer everyone forgets is there.
- **Positive:** matches the "new system, not a blind port" rule — we use
  the current Next 16 convention, not the deprecated one.
- **Negative:** `proxy.ts` deferred means no server-side auth guard until
  Plan 012 — acceptable because the mock phase is UI-only and the store
  is the gating interface.
