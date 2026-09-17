# PLAN 012 — Recordings

Route: `/recordings` · File: `modules/learning/components/recordings-page-content.tsx`
Read `plans/000-index.md` first (ground rules + acceptance, shared).

## Current state

Masthead applied. A prior plan claimed this shipped a "next-up hero
with direct play trigger" and a "course-grouped index list" —
**confirmed false**: `grep` finds no `IndexList`/`IndexRow` import in
this file. Treat the claimed direction as the target, not as done.

## Direction

1. If there's a genuine "next unwatched recording" signal in the data
   (check the query hook for a watched/unwatched flag and a real
   ordering), that's a legitimate hero candidate — a dominant card with
   a direct play trigger, matching the dashboard's "continue learning"
   hero shape. Don't fabricate this if the data doesn't support it.
2. The rest of the list → `IndexList`/`IndexRow`, grouped by course
   (numbered within each course group), with a watched/unwatched
   status and duration as row metadata instead of a card grid.

## Acceptance

(Plus the shared checklist in `plans/000-index.md`.)

- [ ] File re-read fresh; confirm actual current card-grid structure
      before converting.
- [ ] Recording list is `IndexList`, grouped by course.
- [ ] A hero only appears if the data genuinely supports a "next up"
      signal; otherwise skipped with a one-line note in the commit.
