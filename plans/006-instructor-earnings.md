# PLAN 006 — Instructor Earnings + Cohort Revenue Breakdown

Route: `/billing` (instructor mode) + `/billing/cohort/[scheduleId]`
Files: `modules/instructor-earnings/components/InstructorEarningsPageContent.tsx`,
`modules/instructor-earnings/components/CohortEarningsDetailContent.tsx`
Read `plans/000-index.md` first (ground rules + acceptance, shared).

## Current state (read in full)

Masthead applied on both. `InstructorEarningsPageContent`: a bank-
details nudge `Card` (conditional), a 3-up `Tile` grid (Pending/
Processing/Paid), an optional 3-up `MiniStat` grid (base/revenue-share/
bonus breakdown), then two real `<table>` sections — "By cohort"
(course, stream, pending, paid, chevron to the detail page) and
"Payout history" (amount, bank, status, run date, paid date).
`Tile`/`MiniStat` are page-local functions — a bordered card with a
label and a big number, structurally already bento-tile-*shaped* but
a separate implementation from `StatsStrip`/`ProgressPulseCard`.

`CohortEarningsDetailContent`: masthead, a 2-3up `Tile` grid
(Collected/Your earnings/Your share), then a "who paid" `<table>`
(student, paid, your cut) with a totals `<tfoot>` row.

## Direction

1. **Replace both pages' local `Tile`/`MiniStat` with the actual
   shared bento-tile component** — extract the tile markup from
   `StatsStrip`/`ProgressPulseCard` into one real shared component if
   it isn't already factored out, and use it here. Three pages with
   three near-identical hand-rolled tile components is exactly the
   drift the shared-primitive registry exists to prevent.
2. **The tables stay tables.** Dense, multi-column, comparable-row
   financial data is a legitimate table use case — don't force "By
   cohort," "Payout history," or "who paid" into `Ledger` rows, which
   would lose column alignment that actually matters here. Do restyle
   the table chrome: replace the heavy `bg-muted/40` header row and
   current border treatment with the lighter hairline aesthetic used
   elsewhere (`border-border`, no filled header background), for
   visual consistency with the rest of the app.
3. **`CohortEarningsDetailContent` moves onto Reading + Rail**
   (`plans/DESIGN-SYSTEM.md` §3): the "who paid" table is the reading
   column's content; the headline stats (Collected / Your earnings /
   Your share) move into a slim sticky rail as a vertical stack
   instead of a 3-up grid competing with the table for top-of-page
   space.

## Acceptance

(Plus the shared checklist in `plans/000-index.md`.)

- [ ] One real shared bento-tile component, used by both pages here
      (and ideally the dashboard's own tiles, if not already the same
      component).
- [ ] Tables keep their column structure, restyled to the lighter
      hairline chrome — not converted to `Ledger`.
- [ ] `CohortEarningsDetailContent` is reading-column + sticky rail,
      not a stacked grid-then-table.
