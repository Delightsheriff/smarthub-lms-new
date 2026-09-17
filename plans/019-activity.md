# PLAN 019 — Activity

Route: `/activity` · File: `modules/activity/components/MyActivityPageContent.tsx`
Read `plans/000-index.md` first (ground rules + acceptance, shared).

## Current state (read in full)

Masthead applied. Body: events grouped by calendar day (a `Map` keyed
by localized day string), each day a heading + a `Stagger`-animated
list of bordered `Card`s (icon chip, action label, target, timestamp,
IP badge). Pagination at the bottom (`meta.currentPage`/`totalPages`).
This is the textbook `Ledger` use case — a dated, typed list — just not
using it yet.

## Direction

Replace the per-event bordered `Card` with `LedgerItem` (`icon` slot
for the action-type icon chip, `meta` = target + IP, `when` = time-of-
day since the day is already the section heading). **Keep the day-
grouping** — wrap each day's `LedgerItem`s in their own `Ledger` (or
one `Ledger` per day, title = the day string) rather than flattening
into one long list; the grouping is real, useful structure, not
incidental. Pagination controls stay as they are.

## Acceptance

(Plus the shared checklist in `plans/000-index.md`.)

- [ ] Each day's events render as `LedgerItem` rows inside a `Ledger`,
      not bordered cards.
- [ ] Day-grouping preserved — this isn't a flatten-everything change.
- [ ] Pagination still works (page forward/back, correct event set per
      page) after the conversion.
