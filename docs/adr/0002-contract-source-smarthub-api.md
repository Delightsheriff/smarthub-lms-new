# ADR 0002 — Contract source = `smarthub-api` (mirrored wire types + enums)

- **Status:** Accepted
- **Date:** 2026-08 (port kickoff)

## Context

The LMS has two historical sources of truth for "what does the API
return": the Mongoose models in `smarthub-api` and the legacy client's
module type files. Copying legacy client types verbatim risks importing
shapes that drifted from the live backend.

## Decision

The **authoritative contract source is `smarthub-api`**
(`src/models/*` + `src/constants/index.ts`). The new repo keeps one
mirrored copy of that contract locally: enum constants in
`lib/api/constants.ts` and shared **wire types** in
`lib/api/wire.types.ts` (string `_id`s, nested sub-docs — identical to
the backend). Each module's small UI `types/` derives from these via its
normaliser.

## Consequences

- **Positive:** one upstream to read; the mock can't disagree with the
  API because both are generated from the same wire shapes.
- **Positive:** a grep of enum literal sets is a reliable contract
  check.
- **Negative:** the mirror must be updated whenever the API changes —
  kept small and local (`lib/api/`) so it's cheap to refresh.
