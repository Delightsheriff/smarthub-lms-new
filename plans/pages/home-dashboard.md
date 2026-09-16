# Home (`/dashboard`) — student + instructor

Status: ✅ Done — instructor dashboard implemented; editorial greeting rolled out (Plan 016 Slice 2)

## Current state

`app/(app)/dashboard/page.tsx` branches on `useEffectiveMode()`:
- **Student mode** → `StudentDashboardBody` (inline in the same file, ~180
  lines). Well-built: greeting, self-gating status-nag grid (billing,
  acceptance letter, referrals, internship ×2, tech scholarship), stats
  strip, progress pulse, webinars widget, assigned-modules widget,
  "Continue learning" hero card, calendar + upcoming-deadlines row,
  progress-by-course list, "Your courses" preview grid.
- **Instructor mode** → `<ComingSoon title="Teaching dashboard" />`. A
  literal placeholder. This is the single biggest functional gap found in
  this audit.

## Legacy state

Legacy's dashboard branches the same way, but instructor mode renders
`TeachPageContent` (`src/modules/teaching/components/TeachPageContent.tsx`,
140 lines) — a real, complete instructor home:
- Greeting with icon badge ("Hi {name}", "Teaching N cohorts")
- Priority grid: `NeedsGradingStrip` (2/3 width) + `UpcomingClassesTile` (1/3)
- Activity grid: `RecentSubmissionsTile` (2/3) + `DashboardWebinarsWidget` (1/3)
- Full cohort grid below: active cohorts, then a divider, then dimmed past
  cohorts

Current codebase already has a `TeachPageContent` — but it's a *different*,
much simpler component mounted at `/teach` (91 lines): just a header with
Active/Past tabs and the cohort grid. It has none of `NeedsGradingStrip`,
`UpcomingClassesTile`, or `RecentSubmissionsTile`.

### What already exists to build on

- `useUpcomingEvents` (`modules/calendar/api/calendar.queries.ts:50`) — same
  hook legacy's `UpcomingClassesTile` uses. Already ported.
- `GradingDialog` (`modules/teaching/components/GradingDialog.tsx`) — already
  ported, used elsewhere in the teaching module.
- `DashboardWebinarsWidget` — already exists (used on the student dashboard).
- Backend: `GET /lms/teaching/inbox?limit=N&status=ungraded|all` — one
  endpoint serves both "needs grading" (status=ungraded, the default) and
  "recent submissions" (status=all). Confirmed live in
  `smarthub-api/src/controllers/teaching.controllers.ts:287` /
  `src/routes/lms-routes/teaching.lms.routes.ts:239`. No backend work needed.
- Missing on the frontend: `useInstructorInbox` / `useRecentSubmissions`
  query hooks, `NeedsGradingStrip`, `UpcomingClassesTile` (legacy has an
  equivalent-shaped one already usable as reference), `RecentSubmissionsTile`.
  `InboxRow` type and `normaliseInboxRow` normaliser also need porting into
  `modules/teaching/types/index.ts` and `modules/teaching/api/normalise.ts`.

## Design direction

Port the structure (it's a sound information architecture: priority actions
above the fold, browse surfaces below), but execute it in this session's
established language, not legacy's stock shadcn look:
- Both dashboards (student + instructor) should feel like the same product.
  Reuse the student dashboard's grid rhythm (`grid gap-4 lg:grid-cols-3` /
  `lg:col-span-2` pairing already used for Calendar+Deadlines) for the
  instructor's Needs-grading+Upcoming-classes and Recent-submissions+Webinars
  rows.
- Needs-grading rows use a solid warning-tinted icon badge, not an outline;
  match the badge/dot treatment already established on Referrals'
  `StatusBadge`.
- Cohort grid: keep active/past as a scroll-continuous list with a divider
  (legacy's pattern) rather than tabs — a dashboard is a single "here's
  what's going on" surface, tabs imply hidden content, which undersells the
  past-cohorts context that's still worth a glance.
- Empty states throughout via the shared `EmptyState` primitive, not
  hand-rolled cards.

## Acceptance criteria

- [ ] Instructor `/dashboard` no longer shows "Coming soon" — replaced with
      a real dashboard.
- [ ] `useInstructorInbox(limit)` and `useRecentSubmissions(limit)` hooks
      exist in `modules/teaching/api/teaching.queries.ts`, both backed by
      the existing `GET /lms/teaching/inbox` endpoint with the right
      `status` param, with independent query keys (don't share a cache
      entry — ungraded and all-status are different lists).
- [ ] `InboxRow` type + `normaliseInboxRow` exist in the teaching module,
      matching the shape `GradingDialog` / `CohortSubmissionRow` expects
      (check `CohortSubmissionRow` in `modules/teaching/types/index.ts` —
      the adapter must produce a compatible shape, same as legacy's
      `inboxToSubmissionRow`).
- [ ] `NeedsGradingStrip` — top-N ungraded submissions, click opens
      `GradingDialog`, shows a count badge, late-submission badge per row,
      "All caught up" empty state.
- [ ] `UpcomingClassesTile` — next N class-session calendar events (filtered
      from `useUpcomingEvents`, not a new query), Join link when live,
      Attendance link when past (via `sourceId`), Cancelled badge, "No
      classes scheduled" empty state. Link to `/calendar` in the header.
- [ ] `RecentSubmissionsTile` — top-N submissions regardless of grade state,
      graded rows show score/points badge, click opens `GradingDialog`.
- [ ] Instructor dashboard renders: greeting → priority grid → activity grid
      → cohort grid (active, then dimmed past below a divider) — matching
      legacy's structure.
- [ ] No raw Tailwind palette colors introduced — success/warning/primary
      tokens only.
- [ ] `npx tsc --noEmit` and `npx eslint` clean on every touched file.
- [ ] Verified in the browser in Teaching mode: at least one cohort with a
      real class session/submission shows populated tiles; confirm empty
      states separately if no seed data provides them.
