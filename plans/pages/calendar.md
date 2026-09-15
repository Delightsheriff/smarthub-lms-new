# Calendar (`/calendar`)

Status: 🔴 Not started

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

- [ ] Query range is computed per active view (month/week/day/agenda), not
      a fixed 9-month window.
- [ ] `?view=` persists in the URL and restores on reload.
- [ ] Agenda view has a window-size control (7/14/30 days).
- [ ] All raw Tailwind event-type colors replaced with theme tokens.
- [ ] `PageHeader`/`EmptyState` adopted.
- [ ] `npx tsc --noEmit` and `npx eslint` clean.
