# PLAN 010 — Course Module Detail

Route: `/courses/[slug]/modules/[moduleSlug]` · File: `modules/courses/components/CourseModulePageContent.tsx`
Read `plans/000-index.md` first (ground rules + acceptance, shared).

## Current state

A boxed card header, then a separate accordion for lesson content. Not
personally re-read line-by-line for this plan — read it fresh before
starting; the direction below is the same pattern as plan 009
(Assignment Detail), which was read in full, and this page is the same
shape (a single-item detail page under a boxed header).

## Direction

Same Reading + Rail treatment as plan 009:

1. Boxed header → masthead (module title, dateline = course context,
   divider).
2. Objectives/progress/duration/lesson-format tabs → the rail
   (`sticky` on desktop).
3. Lesson content/accordion → the wide reading column.
4. Confirm the existing tabs (if multiple lesson formats) use the
   `overflow-x-auto`/`w-max` scrollable-tabs fix already established
   elsewhere, not a fixed grid that squeezes on tablet.

## Acceptance

(Plus the shared checklist in `plans/000-index.md`.)

- [ ] File re-read fresh; header/content split confirmed against
      actual current code before implementing.
- [ ] Header is a masthead, not a boxed card.
- [ ] Rail is `sticky` on desktop, reflows on mobile.
- [ ] Any multi-format tab strip is horizontally scrollable, not fixed-
      grid squeezed.
