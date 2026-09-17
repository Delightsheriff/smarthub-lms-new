# PLAN 005 — Instructor Self-Paced

Route: `/teach/self-paced` · File: `modules/self-paced/components/InstructorSelfPacedPageContent.tsx`
Read `plans/000-index.md` first (ground rules + acceptance, shared).

## Current state

Masthead applied. Has a horizontally-scrollable `Tabs` bar (already
using the `overflow-x-auto`/`w-max` fix from `plans/DESIGN-SYSTEM.md`
§4's cascade-order note — confirm it's the Tailwind-utility version,
not a hand-written media query, before assuming it's correct). **Not
personally re-read in full** — the original plan-004 table described
an "earnings summary" and a course-management list; re-read the file
before starting.

## Direction

1. Earnings summary → the shared bento-tile shape (matching
   `StatsStrip`/`ProgressPulseCard`'s exact `rounded-xl`/icon-circle/
   big-number tile), same component plan 006 uses for Instructor
   Earnings — don't hand-roll a third version of this tile.
2. Course-management list → `IndexList`/`IndexRow`.
3. Confirm the tabs bar is genuinely using `hidden sm:flex`-style
   Tailwind utilities per `plans/DESIGN-SYSTEM.md` §4, not a
   hand-written `@media` override — fix it if not.

## Acceptance

(Plus the shared checklist in `plans/000-index.md`.)

- [ ] File re-read fresh; earnings tiles and course list confirmed
      against actual current code before implementing.
- [ ] Earnings summary uses the same shared bento-tile shape as
      Instructor Earnings (plan 006) — not a third hand-rolled version.
- [ ] Course-management list is `IndexList`.
- [ ] Tabs bar confirmed on Tailwind responsive utilities, not a
      hand-written media query.
