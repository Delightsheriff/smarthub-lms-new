# PLAN 004 — Self-Paced Courses (student)

Route: `/learn` · File: `modules/self-paced/components/SelfPacedCoursesPageContent.tsx`
Read `plans/000-index.md` first (ground rules + acceptance, shared).

## Current state

Masthead applied (course-inventory count). **Not personally re-read in
full for this plan** — read the file fresh before starting; treat the
direction below as a strong hypothesis grounded in the equivalent
already-shipped page, not a verified diff target.

## Direction

Same content shape as `/courses` (a browse list of enrolled/available
tracks) — mirror whatever real pattern `/courses` ends up on from plan
014 exactly, for consistency, rather than inventing a separate
treatment. Concretely: an `IndexList`/`IndexRow` browse list (progress
rule + status), not a card grid.

If the data supports identifying a genuine "most recently active"
self-paced course (check the query hook for a last-accessed or
last-progress timestamp), that's a legitimate candidate for the
dashboard's "continue learning" hero pattern — a hero + a compact
ledger-or-list of the rest. **Don't fabricate this if the data doesn't
support it** — a plain `IndexList` for every course, no hero, is a
completely fine outcome if there's no real "most recent" signal.

## Acceptance

(Plus the shared checklist in `plans/000-index.md`.)

- [ ] File re-read fresh; direction confirmed or adjusted against
      actual current code before implementing.
- [ ] Course list is `IndexList`, not a card grid — consistent with
      whatever `/courses` (plan 014) ships.
- [ ] A "continue learning" hero only appears if the data genuinely
      supports identifying a most-recent course; otherwise skipped
      with a one-line note in the commit message.
