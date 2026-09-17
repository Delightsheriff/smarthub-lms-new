# PLAN 014 — Courses (catalog + detail)

Route: `/courses` (+ course detail) · File: `modules/courses/components/CoursesPageContent.tsx` (+ detail component)
Read `plans/000-index.md` first (ground rules + acceptance, shared).

## Current state

Masthead applied. A prior plan claimed this shipped an "enrolled course
index list" and "polished course detail stats responsive layout" —
**the index-list part is confirmed false** (`grep` finds no
`IndexList`/`IndexRow` import); the detail-page responsive stats work
may be real but wasn't re-verified for this plan.

## Direction

1. Catalog list → `IndexList`/`IndexRow` — this is the most-referenced
   pattern in the whole rollout (the dashboard's own "Your courses"
   section already does exactly this); copy `app/(app)/dashboard/page.tsx`'s
   `IndexRow` usage directly rather than reinventing it.
2. Course detail page: re-verify the "responsive stats layout" claim
   before assuming it's done; if the page's core content is genuinely a
   single item (this course's modules/progress/info), it's a Reading +
   Rail candidate — content in the wide column, enrollment/progress/
   instructor info in a sticky rail. Use judgment: if it's more of a
   browse-the-modules page than a single-item read, `IndexList` for the
   module list may fit better than a rail.

## Acceptance

(Plus the shared checklist in `plans/000-index.md`.)

- [ ] Catalog is `IndexList`, matching the dashboard's own course-list
      pattern exactly.
- [ ] Course detail page's actual current structure re-verified (not
      assumed from the prior plan's claim) before deciding between
      Reading + Rail and an `IndexList` module browse.
