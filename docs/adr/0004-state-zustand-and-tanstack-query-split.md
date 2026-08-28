# ADR 0004 — State split: Zustand (UI/local) + TanStack Query (server)

- **Status:** Accepted
- **Date:** 2026-08 (port kickoff)

## Context

The product needs both server-cache state (courses, submissions,
billing — shaped by the API) and ephemeral UI state (sidebar collapse,
command-palette open, mode toggle, search). Early on in the old codebase
these were conflated, making cache invalidation and optimism fragile.

## Decision

- **TanStack Query** owns all **server/remote** state: fetch, cache,
  background refetch, mutations — with **normalise in the query
  `select`** so components consume small UI types, not wire shapes.
- **Zustand** owns **UI/local** state (`authStore` is the boundary —
  it holds the signed-in `AuthUser` projection and auth flags, seeded
  from the mock in the UI-first phase). Stores are per-slice and
  plain; only the state that must survive navigation/reload is
  persisted.

## Consequences

- **Positive:** cache is correct by construction (invalidations keyed
  to query keys); components are free of manual fetch plumbing.
- **Positive:** normalising in `select` keeps every screen's data
  shape stable regardless of the wire source (mock now, axios later).
- **Negative:** adds two libraries; the split boundary (what is
  "server" vs "UI" state) needs discipline to avoid a gravitation back
  to one store doing everything.
