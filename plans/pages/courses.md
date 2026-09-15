# Courses (`/courses`, `/courses/[slug]`, `/courses/[slug]/modules/[moduleSlug]`)

Status: 🟡 Critical bug fixed + first creative pass shipped; deeper redesign still open

## What this doc covers

Four surfaces: the browse grid (student) / cohort roster (instructor), the
course landing page, the two-pane outline+content shell, and the per-module
content pane. Legacy comparison and the Coursera/Udemy research below.

## Critical bug found and fixed (see also home-dashboard.md)

`/courses` rendered the student browse grid **unconditionally** — no
`useEffectiveMode()` branch. Since Teaching mode's nav "Courses" item points
at this same route, an instructor had **no way to reach their teaching
cohorts from the main nav at all** — worse than the dashboard's "Coming
soon" placeholder, because it silently showed the wrong (empty) data
instead of admitting the feature didn't exist. Fixed: ported legacy's
`InstructorCoursesBody` (search + Mode/Privacy/Status filters over
teaching cohorts, grouped by course) as the instructor branch, using this
repo's `FilterDropdown`/`FilterBar` (Select-based) instead of legacy's raw
`DropdownMenu`-radio filters. Commit `0df9f0c`.

This also surfaced that `TeachingCohort`/`ApiTeachingCohort` never mapped
`mode`, `isPrivate`, `applicationIsOpen`, `applicationEndDate` even though
the backend already returns them (`get-instructor-cohorts.service.ts`
`$project`) — fixed as part of the same change (see home-dashboard.md,
committed alongside the dashboard work since both needed it).

## What already existed and is genuinely good

The two-pane course shell (`app/(app)/courses/[slug]/layout.tsx` +
`course-outline.tsx`) is **already** a Coursera/Udemy-style syllabus rail:
sticky left outline (desktop) / Sheet drawer (mobile), active-module
tracking by route, active-item tracking by URL hash with `hashchange`
sync, per-item watched/type icons. This is not something that needed
inventing — it needed sharper visual execution, which is where this pass
focused.

`CourseModulePageContent` already has tab+hash sync, prev/next module nav,
per-cohort status badging, and hides empty tabs — solid mechanics.

## Coursera/Udemy research — what this pass drew from

- **Completion rings, not just bars.** Both platforms use a small circular
  progress indicator as the primary "how far along" signal on a course
  card and at the top of an in-progress course's content view — a bar
  alone reads as a form-field, a ring reads as an achievement/status.
  Built `components/ui/circular-progress.tsx` (plain SVG, themes through
  `currentColor` like every icon in the app, no new dependency) and used
  it: (1) a corner badge on `CourseCard` for in-progress courses, replacing
  the old linear-bar-plus-percentage footer; (2) a persistent "X% complete"
  header at the top of the outline rail — previously the rail had zero
  aggregate progress indicator, only per-item state.
- **Solid "you are here" state in the syllabus rail.** Both platforms make
  the current lesson visually unmistakable — a filled block, not a tint,
  often with a left accent bar. The outline's active-module link was
  `bg-primary/10` (a tint, inconsistent with this repo's own established
  "solid active-state" rule used everywhere else — sidebar, referrals
  rail, profile rail); now `bg-primary text-primary-foreground`. Leaf
  items (recordings/materials/assignments) gained a solid left accent bar
  on the active row, a detail both platforms use for the current sub-item
  inside an expanded module.
- **Raw-color cleanup**: `text-emerald-600` (watched-recording checkmark
  in the outline, completion percentage on `CourseCard`) → `text-success`.

## Not yet done — deeper redesign still open

This pass fixed the critical routing bug and gave the existing shell a
real visual upgrade, but did not touch:
- The course landing page's content structure (hero/stats/about/
  instructors/module-accordion) — functionally fine, could go further
  toward a Udemy-style "what you'll learn" + curriculum-preview-with-
  lesson-durations layout.
- The module content pane's tab shape (Recordings/Materials/Assignments)
  — could take more from Udemy's lesson-adjacent tab pattern (Overview /
  Q&A / Notes), though that implies new backend-supported features
  (per-lesson notes, Q&A) not yet confirmed to exist.
- Self-paced courses' own UI (`modules/self-paced`) — explicitly called
  out by name as needing the same creative treatment; not yet audited or
  touched in this pass. Pick this up next under this same doc.
- Visual verification blocked by the dev seed data: the test account
  available in this session has zero course enrollments, so the
  `CircularProgress` ring on `CourseCard` and the outline's progress
  header could not be screenshot-verified against real data — verified
  by code review, `tsc`, and `eslint` only. Confirm visually against an
  account with an active enrollment before considering this fully done.

## Acceptance criteria

- [x] Instructor `/courses` shows their teaching cohorts, not the student
      grid.
- [x] `CircularProgress` primitive exists and themes correctly in both
      light and dark (uses `stroke-primary`/`stroke-muted`, no raw colors).
- [x] Course outline's active module is a solid fill, not a tint.
- [x] Course outline shows an aggregate completion ring when a course
      progress number is available.
- [x] All raw Tailwind colors in `CourseCard.tsx` and `course-outline.tsx`
      replaced with theme tokens.
- [x] `npx tsc --noEmit` and `npx eslint` clean.
- [ ] Visually verified against an account with real enrollment data
      (blocked this session — no such account available).
- [ ] Self-paced courses UI audited and redesigned to match.
- [ ] Deeper course-landing-page and module-tab redesign (optional,
      lower priority than the above).
