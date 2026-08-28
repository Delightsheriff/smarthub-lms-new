# ADR 0009 — Student learning surface shares one normalisation taproot

- **Status:** Accepted
- **Date:** 2026-08 (Plan 005)

## Context

Plan 005 delivers the student learning surface: course list, course detail +
outline, module page, recordings/materials global feeds, and the "assigned to
you" surface. These screens render the same underlying facts — a module's
recordings, materials, and assignments — in several arrangements:

- inside a course (module rows, module-page tabs, the outline rail),
- flattened across the whole library (recordings feed grouped by course,
  materials feed grouped by course),
- standalone (assigned modules with no course slug).

The legacy codebase duplicated normalisation and thumbnail/embed logic per
surface, drifting over time (e.g. three places deciding a recording's
embeddable URL).

## Decision

Give module content a **shared normalisation taproot** — the functions in
`modules/learning/api/normalise.ts` — and drive every surface from it:

1. **One taproot normalises `ApiRecording`, `ApiMaterial`, `ApiAssignment`,
   and `ApiModule`** into the UI `Recording` / `Material` / `Assignment` /
   `Module` types. Course, feed, and assigned surfaces all consume these
   outputs; none re-derive durations, file-type guesses, links, or statuses.
2. **The URL classifier (`classifyVideoUrl` in `modules/learning/utils/
   video-source.ts`) is the single place** deciding how a recording URL
   embeds (mp4/webm vs YouTube/vimeo/Drive vs external). The player dialog
   and any future embed surface call it; no screen reimplements the host
   matching.
3. **Section components are shared, not copied.** `module-section.tsx`
   (`RecordingsSection`, `MaterialsSection`, `AssignmentsSection`) rendered
   the module-page tabs; the global `/recordings` and `/materials` feeds
   reuse the same row components, and the assigned surface reuses the
   recordings/materials sections. Layout, counts, and empty states stay in
   one place.
4. **Pure logic is unit-tested with Vitest** (Plan 005 chose the pure `node`
   environment — no jsdom). Normalisers and the URL classifier are covered
   directly since they carry the business rules (duration formatting, mime→
   type mapping, embed construction, order fallback).
5. **Assigned modules render assignments read-only.** Because a standalone
   assigned module has no course slug, there is (by design) no submission
   route; the `AssignedModulesPageContent` lists tasks without links or
   status badges.

## Consequences

- **Positive:** one implementation of the fiddly bits (duration labels,
  file-type guessing, embed URLs, link fallbacks) — a single change fixes
  every surface, and the tests lock the behaviour in.
- **Positive:** surfaces stay thin; they compose sections and present
  arrangement/layout only.
- **Positive:** the taproot makes the mock seed and real API share a shape,
  so swapping mock for real data later requires no screen rewrites.
- **Negative:** surfaces reach adjacent modules through their public query
  hooks / components (learning ← courses, assigned ← learning) rather than
  importing from a single monolithic module; this is the intended seam
  boundary, at the cost of a few cross-module imports.
