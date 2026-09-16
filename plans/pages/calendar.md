# Calendar (`/calendar`)

Status: ✅ Done — including the previously-deferred query-range rework

## Current vs legacy

Current: `modules/calendar/components/CalendarPageContent.tsx` (246) +
`MonthGrid.tsx` (135), `WeekGrid.tsx` (143), `DayView.tsx` (128),
`EventDetailDialog.tsx` (134), `CourseFilterChips.tsx` (65),
`UpcomingDeadlinesPanel.tsx` (81).

Legacy: same file set, roughly 2x the line count each (577/236/344/224/152/96/107).

Event taxonomy (`class-session`, `assignment-due`, `material-reminder`,
`office-hours`, `announcement`, `general`) is identical in both — no gap
there. Neither has ICS export or Google Calendar sync (confirmed absent in
both, not a regression).

## Concrete gaps

1. **Query window regressed from per-view to a fixed 9-month blob.** Legacy
   computes `{from,to}` dynamically per view — month ±7d buffer, ISO week,
   single day, or rolling agenda window (`CalendarPageContent.tsx:97-129`
   legacy). Current fetches a hardcoded 3-months-back/6-months-ahead range
   once and slices client-side (`calendar.queries.ts:14-27`) — the file's
   own comment admits this is a stopgap.
2. **No URL-synced view state.** Legacy persists `?view=month|week|day|agenda`
   (`CalendarPageContent.tsx:47-62` legacy) so refresh/deep-link restores
   the tab. Current's view state is local-only, resets to Month on reload.
3. **Agenda view lost its window control.** Legacy lets the user pick
   7/14/30-day windows; current just dumps the entire fixed 9-month range,
   sorted, no windowing UI.
4. **Month→Day click-through changed UX**, not a straight port: legacy
   updates a same-page side panel; current switches the whole view to Day.
   Not necessarily wrong — just note it's a deliberate-looking deviation,
   worth a design call rather than "fixing" back to legacy by default.
5. Raw Tailwind colors for event-type tinting across `DayView.tsx:43,45,47,49`,
   `WeekGrid.tsx:38,40,42,44`, `MonthGrid.tsx:36,38,40,42`,
   `EventDetailDialog.tsx:38,40,42,44`, `UpcomingDeadlinesPanel.tsx:24`.
6. No `PageHeader`/`EmptyState` adoption.

## Design direction

The per-view query window (#1) is worth doing right rather than patched —
it directly affects data completeness (a class 7 months out silently isn't
in the fetched range). Event-type color-coding (6 types × color) is a
legitimate case for a small, dedicated token set — same treatment as the
achievement-badge tones fixed earlier this session: map each event type to
one of the existing semantic tokens (primary/accent/success/warning) rather
than reaching for raw blue/purple/emerald/amber.

## Acceptance criteria

- [x] `?view=` persists in the URL and restores on reload.
- [x] All raw Tailwind event-type colors (`DayView`, `WeekGrid`,
      `MonthGrid`, `EventDetailDialog`, `UpcomingDeadlinesPanel`) replaced
      with theme tokens. Note while fixing: the wire tone value `"accent"`
      was actually rendering as green/success everywhere, not this app's
      real (orange) accent color — routed to `success`, and `"violet"`
      (no dedicated token) now goes to the real `accent` token instead,
      matching the same collapse used for achievement-badge tones earlier
      this session.
- [x] `PageHeader` adopted for the header/view-tabs row.
- [x] `npx tsc --noEmit` and `npx eslint` clean.
- [x] Query range computed per active view (month/week/day/agenda),
      not a fixed 9-month window. `useStudentCalendar` already accepted
      a `{from, to}` override (added for the earlier `?view=` fix) —
      the caller just wasn't using it. Now computes month±7d / the same
      Sunday-start week `WeekGrid` renders (via `getWeekDays`, reused
      rather than re-implementing ISO-week math like legacy) / a single
      day / a rolling agenda window. **Verified live** against the real
      backend (dev servers running this session): Month fetches ~6
      weeks, Week fetches exactly 7 days, Agenda's 14-day default and a
      switch to 30 days both produced exactly the right `from`/`to` in
      the network log — not just a compile-clean guess this time.
- [x] Agenda view's 7/14/30-day window control — added, replacing the
      Prev/Next/Today date-navigator (which was never meaningful for
      Agenda, since that view lists events from *today* forward rather
      than being anchored to a browsable date) with a segmented day-
      count picker, matching legacy's actual UX model. The "no events"
      block in Agenda also now uses the shared `EmptyState` instead of
      a hand-rolled div.
