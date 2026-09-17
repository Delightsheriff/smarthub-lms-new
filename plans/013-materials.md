# PLAN 013 — Materials

Route: `/materials` · File: `modules/learning/components/materials-page-content.tsx`
Read `plans/000-index.md` first (ground rules + acceptance, shared).

## Current state

Masthead applied. A prior plan claimed this shipped a "course-grouped
`IndexList` with file metadata and download actions" — **confirmed
false**: `grep` finds no `IndexList`/`IndexRow` import in this file.
Treat the claimed direction as the target, not as done.

## Direction

`IndexList`/`IndexRow`, grouped by course: numbered rows, file-type
icon, file size / format as metadata, a download or preview action in
place of the chevron (check whether `IndexRow` needs an `actions`
escape hatch similar to `NagItem`'s, for a "Download" affordance
distinct from "open the row" — add one if so, additively, matching how
`NagItem` already does this).

## Acceptance

(Plus the shared checklist in `plans/000-index.md`.)

- [ ] File re-read fresh; confirm actual current structure before
      converting.
- [ ] Materials list is `IndexList`, grouped by course, with a real
      download/preview action per row.
