# ADR 0001 — UI-first: mock data source behind the API seam (auth/API last)

- **Status:** Accepted
- **Date:** 2026-08 (port kickoff)

## Context

The SmartHub LMS is being rebuilt in this repo from scratch on a new
stack (Next.js 16 / shadcn `base-vega`) while the old app + API live
outside, read-only, as reference. A common failure mode for a port done
"UI-first" is locking screens to a real backend too early — screens get
blocked on missing endpoints, and the design system can't be validated
without data.

## Decision

Build every screen and module against a **data-source seam**
(`lib/api/client.ts`) whose first adapter is an in-memory **mock
database** (`lib/api/mock/`). The real axios transport and the auth flow
are deliberately deferred to the final slice (Plan 012). Module
`*.service.ts` files call only the seam, so normalisers, types, stores
and screens remain byte-for-byte identical across the swap.

## Consequences

- **Positive:** screens render meaningful UI immediately; the design
  system is validated with real shapes, not lorem ipsum; the API slot is
  a genuine two-adapter seam, unit-testable through its surface.
- **Positive:** infra (query provider, auth store, socket) can't drift
  from what the backend returns because the mock mirrors the wire types.
- **Negative:** mock fixtures must be manually kept in sync with the API
  contract; a later cloud replace (Plan 012) will differ slightly from
  the seamless in-memory handlers.
- **Trade-off accepted:** auth tokens/refresh are stubbed; a `logout`
  still clears state so the guard logic can be exercised.
