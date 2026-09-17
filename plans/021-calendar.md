# PLAN 021 — Calendar

Route: `/calendar` · File: `modules/calendar/components/CalendarPageContent.tsx`
Read `plans/000-index.md` first (ground rules + acceptance, shared).

## Current state (read in full)

Masthead applied, with a Month/Week/Day/Agenda `Tabs` switch in header
actions, a date-navigator bar, and `CourseFilterChips`. Month/Week/Day
are bespoke visual calendar grids (`MonthGrid`/`WeekGrid`/`DayView`) —
real calendar-rendering machinery, not a list surface. Agenda mode is
**a stack of boxed `Card`s** sorted by start time.

## Direction

**Leave Month/Week/Day alone** — these are genuine calendar grids, not
a card-stack anti-pattern; forcing them into `Ledger`/`IndexList` would
break the actual calendar-reading UX. The real target is **Agenda
mode only**: convert its boxed-card list to a `Ledger`
(`tone`/`icon` from `typeTone`/type, `meta` = course/module context,
`when` = start time), since Agenda is explicitly a chronological list
view, not a grid — it's the one sub-view actually being an anti-pattern
today.

## Acceptance

(Plus the shared checklist in `plans/000-index.md`.)

- [ ] Agenda mode is a `Ledger`, not boxed cards.
- [ ] Month/Week/Day grids untouched — confirm they still render and
      navigate correctly (this plan shouldn't touch their code at all).
- [ ] Clicking an Agenda entry still opens `EventDetailDialog`
      correctly.
