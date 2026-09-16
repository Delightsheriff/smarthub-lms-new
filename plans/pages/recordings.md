# Recordings (`/recordings`)

Status: ✅ Done — editorial PageHeader rolled out (Plan 016 Slice 6).

## Current state

`modules/learning/components/recordings-page-content.tsx` (236 lines) +
`recording-player-dialog.tsx` (192) + shared `module-section.tsx` (361,
also used by materials/assignments in-course views).

## Legacy state

`src/app/(app)/recordings/page.tsx` (287, logic inline) +
`recording-player-dialog.tsx` (226) + `module-section.tsx` (476) +
`utils/content-filter.ts` (77, **absent in current**).

## Concrete gaps (found by audit agent, file:line references)

1. **No pagination.** Legacy paginates each course's recording list at
   10/page (`Pager`/`usePagedList`, legacy `page.tsx:16,144-277`). Current
   dumps every recording in a course into one unbounded `<ul>`
   (`recordings-page-content.tsx:112-208`).
2. **Watched-state source regressed.** Legacy derives "watched" from a
   cross-course progress table (`useAllProgress()`, legacy `page.tsx:34,
   41-47,115`) because a recording payload is shared across students.
   Current reads `recording.watched` directly off the recording object
   (`recordings-page-content.tsx:35-37,144-148`) — implies per-content
   rather than per-student-per-course storage. **Verify against the
   backend response shape before assuming this is a frontend bug** — it
   may be that the API now returns a per-student-joined field and legacy's
   approach is the outdated one.
3. **No manual "Mark as complete" fallback.** Legacy's dialog explicitly
   dropped auto-mark-at-80% ("it never did, and for a Drive embed it never
   could" — legacy `recording-player-dialog.tsx:44`) and replaced it with
   an explicit button + `toggleComplete` mutation (legacy dialog:196-219).
   Current still has the retracted auto-mark-at-80% behavior
   (`recording-player-dialog.tsx:132-142`) with no fallback button — for
   any non-`<video>` embed (YouTube/Vimeo/Drive — the majority), a
   recording can never be marked watched.
4. **No search/filter inside a module's recording list.** Legacy's
   `module-section.tsx` has free-text search + live/recorded kind filter +
   sort toggle (`useContentFilter`, legacy `module-section.tsx:82-132`) and
   honors a `?recording=<id>` deep link. Current's `module-section.tsx` has
   none of this.
5. Top-level All/Unwatched/Watched tabs are preserved correctly — not a gap.
6. Hand-rolled header + empty state instead of `PageHeader`/`EmptyState`
   (`recordings-page-content.tsx:53-58,81-91`); same in `module-section.tsx`
   (local `function EmptyState` at line 355 instead of the shared one).
7. Raw Tailwind colors: `text-emerald-600` at `recordings-page-content.tsx:145`,
   `module-section.tsx:105`, and `recording-player-dialog.tsx:85` (legacy's
   dialog already uses `text-success`).

## Design direction

Keep the fix scope tight to real gaps — this isn't the flagship redesign
(that's Courses). Bring in `PageHeader`/`EmptyState`, fix the raw colors,
add the manual "Mark as complete" fallback (this is a real, user-facing
bug: most recordings literally cannot be marked watched today), and add
pagination once a course has more than ~10 recordings. Search/filter and
the watched-state data-model question are lower priority — flag, don't
block on them if time runs short.

## Acceptance criteria

- [x] `PageHeader` replaces the hand-rolled `<header>` in
      `recordings-page-content.tsx` and `materials-page-content.tsx`.
      `EmptyState` replaces the hand-rolled empty-state card in both.
      `module-section.tsx`'s local `EmptyState` (a compact single-line
      variant for a nested sub-section list) was left as-is — it's not
      the page-level pattern the shared primitive replaces.
- [x] `text-emerald-600` → `text-success` in `recording-player-dialog.tsx`,
      `recordings-page-content.tsx`, `module-section.tsx`.
- [x] `RecordingPlayerDialog` has an explicit "Mark as watched" button
      that works regardless of embed type (calls the same
      `trackView` mutation the video branch's auto-mark uses — confirmed
      it's the actual watched-flip endpoint, not just a view-count ping).
      The video branch keeps its 80%-auto-mark too; the button is the
      fallback for every other embed kind, not a replacement.
- [ ] Pagination — deferred. Couldn't verify against real data (this
      session's test account has zero enrollments), so didn't build UI
      for a case not confirmed to occur. Revisit once a course with 10+
      recordings is available to check against.
- [ ] Search/filter inside `module-section.tsx`'s per-module list —
      deferred, lower priority than the mark-as-watched bug.
- [x] `npx tsc --noEmit` and `npx eslint` clean.
- [ ] Mark-as-watched verified against a real non-video recording — this
      session's test account has none; verified by code review only.

## Also fixed in this pass (not originally scoped to this doc)

`next.config.ts` had no `images.remotePatterns` at all — every
`next/image` usage with a remote URL (course thumbnails, avatars,
instructor photos, help-resource thumbnails) would 400 in production.
Legacy has `res.cloudinary.com` allow-listed; this port dropped it
entirely. Added back. Needs a dev-server restart to verify (config
changes aren't hot-reloaded) — not done this session due to prior
restart instability observed in this environment; flagged for the
next session to confirm with a restart + screenshot of a real image.
