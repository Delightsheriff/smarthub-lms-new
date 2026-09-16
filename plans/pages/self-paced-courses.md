# Self-paced courses (student-facing, `/learn`, `/learn/[slug]`, `/learn/[slug]/lessons/[lessonId]`)

Status: ✅ Done — editorial landing hero & player typography rolled out (Plan 016 Slice 3). Catalog filter deferred.

## Legacy comparison

Full audit run (agent-assisted, ~31 tool calls across every component). Headline
finding: **this module is a near line-for-line legacy port already** — every
file has a 1:1 legacy counterpart, near-identical structure, no dead links, no
TODOs, no raw Tailwind colors, no functional regressions in catalog/landing/
player/certificate/access-state/nudge-widget flows. This is the
best-preserved surface audited this session. The real gaps found were
**inconsistency with the newly-redesigned cohort-course surface**, not
legacy-parity bugs.

Route disambiguation (asked for explicitly during the audit): `/self-paced/
[slug]` is not a page — it's a documented redirect shim forwarding
`smarthub-api`'s legacy notification deep-link format
(`/self-paced/:slug?lesson=:lessonId`) to the real route at `/learn/[slug]`.
Exact parity with legacy, not a bug.

Completion mechanics (checked closely, since cohort recordings had a real bug
here): self-paced lesson completion is **entirely manual** — a "Mark
complete" button, or a prompt card offered when the video reports `ended`.
No watch-percentage auto-completion exists, matching legacy exactly. This is
a different (and arguably more honest) model than cohort recordings' watch-
threshold tracking — not a bug to fix.

## What was fixed

1. **`CircularProgress` ring adopted**, matching the cohort-course redesign
   from the previous session — this module had zero ring usage before this
   pass, still on the old linear-bar-plus-percentage pattern everywhere:
   - `SelfPacedCourseCard.tsx` — ring badge on the thumbnail corner for
     in-progress courses (mirrors `modules/courses/components/CourseCard.tsx`
     exactly), footer simplified to just the lesson count once the ring
     covers the percentage.
   - `SelfPacedCoursePageContent.tsx` — small ring next to the "Lessons"
     card's `X/Y done` count.
   - `LessonPlayerPageContent.tsx` — the top-bar linear progress bar
     replaced with a compact ring next to the lesson count.
2. **Solid active-state** — `LessonList.tsx`'s current-lesson row was
   `bg-primary/10` (a tint), inconsistent with the established rule (solid
   fill) already applied to the cohort course outline, the settings rails,
   and the sidebar. Now `bg-primary text-primary-foreground` with a solid
   left accent bar, matching `course-outline.tsx`'s `OutlineItem` treatment.
3. **Recurring `Badge` pattern fixed** — three spots
   (`SelfPacedCourseCard.tsx`, `SelfPacedCoursePageContent.tsx`,
   `PassMembershipCard.tsx`) hand-rolled `variant="outline"` plus manual
   `border-success/30 text-success bg-success/10` classes where the
   `success`/`warning` `Badge` variants (added last session) already exist
   and do the same thing in less code. Looked like leftover churn from the
   `asChild` → `render` Base UI migration rather than a deliberate choice.
4. **Real UX gap: no mobile access to the lesson list on the player.** The
   lesson player's sidebar rail (`lg:sticky`) had no `hidden lg:block` guard
   and no mobile alternative — on a phone, reaching the lesson list meant
   scrolling past the entire video + lesson body first. Cohort courses solve
   this with a `Sheet` drawer trigger (`app/(app)/courses/[slug]/layout.tsx`);
   ported the same pattern directly into `LessonPlayerPageContent.tsx` (a
   "Lessons" button in the top bar, `lg:hidden`, opening the same
   `LessonList` in a drawer) rather than introducing a shared route-level
   `layout.tsx` — the course-landing page's own inline lesson list and the
   player's sidebar rail serve different shapes (full list vs. compact rail)
   the same way the cohort course detail page and its outline rail do, so a
   forced shared layout wasn't the right fix; the missing mobile drawer was
   the actual, narrower problem.
5. Verified Base UI's `Accordion` defaults to `multiple: false` (single-open,
   matching legacy's Radix `type="single"` behavior) — the audit flagged
   this as worth checking since `CourseFaqs.tsx` dropped the explicit prop
   during the Base UI migration; confirmed no behavior change occurred.

## Deliberately not done

- **No search/filter on the `/learn` catalog**, unlike the redesigned cohort
  `/courses` (which has a search box + status/mode/kind `FilterDropdown`s).
  This is parity with legacy (neither had one), not a regression, and most
  students hold a handful of self-paced courses at most — a filter bar may
  be solving a problem that doesn't exist yet at this scale. Revisit if
  self-paced catalogs grow large enough to need one.
- The `PartyPopper` celebration-dialog icon color changed from legacy's
  `accent` (orange) to `primary` (maroon) at some point during the port —
  both are real theme tokens, so this wasn't flagged as a bug, just noted.
  Left as-is.
- Visual verification blocked the same way as the Courses pass: this
  session's test account has zero self-paced enrollments, so the new rings,
  the solid lesson-list active state, and the mobile drawer could not be
  screenshot-verified against real data — verified by `tsc`/`eslint` and
  code review only.

## Acceptance criteria

- [x] `CircularProgress` used consistently across the catalog card, course
      landing page, and lesson player — matching the cohort Courses redesign.
- [x] `LessonList`'s active-lesson row is a solid fill, not a tint.
- [x] All three hand-rolled success/warning badge spots use the `Badge`
      variant instead of manual classes.
- [x] Lesson player has a mobile-accessible way to reach the lesson list
      without scrolling past the whole page (drawer, `lg:hidden`).
- [x] `npx tsc --noEmit` and `npx eslint` clean.
- [ ] Visually verified against a real self-paced enrollment — blocked this
      session, same as Courses.
