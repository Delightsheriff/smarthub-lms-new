# ADR 0003 — Module-per-domain structure

- **Status:** Accepted
- **Date:** 2026-08 (port kickoff)

## Context

The old repo already organised code per domain module. A flat
`lib/api` / `components` arrangement for a product this size (courses,
assignments, calendar, messaging, billing, SIWES, teaching, programs)
would collide — every new screen would fight for names in shared
folders.

## Decision

Each domain module owns its `api/` (service + queries + normalise),
`components/`, `config/endpoints.ts`, and `types/` (`api.types` +
`index`). Shared infrastructure that doesn't belong to a domain stays in
`lib/`.

## Consequences

- **Positive:** discoverable ownership; a module's API coupling is
  visible in one place; normalise maps wire→UI per module.
- **Positive:** the seam (ADR 0001) means each module's `api/service`
  is thin and swappable.
- **Negative:** more folders than a flat layout; acceptable given the
  scale and the AI-navigability/predictability benefit for agents.
