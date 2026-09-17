# PLAN 018 — Internships (workspace)

Route: `/internships` · File: `modules/internships/components/InternshipWorkspacePageContent.tsx`
Read `plans/000-index.md` first (ground rules + acceptance, shared).

## Current state (read in full)

Masthead applied. Body: a standalone progress `Card` (percent +
status), a 3-up `grid` of placement-summary cards (mentor, contact,
window), a "Tasks" section as one bordered `Card` with `divide-y` rows
(status badge + action + inline submit dialog), and a "Check-ins"
section, same boxed-card-with-divide-y pattern.

## Direction

Closer to plan 009's shape (a dominant progress + two dated/typed
lists) than a pure browse page:

1. Progress card + placement-summary tiles → could combine into a
   masthead-adjacent hero (progress) + bento row (mentor/contact/
   window as 3 tiles matching the shared shape) instead of a card then
   a separate grid.
2. Tasks → `Ledger`/`LedgerItem`: `tone` from status (todo/in_progress
   → `due`, submitted/done → `info` with a success icon), `meta` = due
   date, `onClick` opens the existing inline submit dialog exactly as
   today.
3. Check-ins → a second `Ledger` (or the same one, sectioned) — `meta`
   = week-of + hours logged, `when` = submittedAt.
4. The existing `divide-y` structure is already halfway there
   (hairline dividers exist) — this is more a component swap than a
   from-scratch redesign.

## Acceptance

(Plus the shared checklist in `plans/000-index.md`.)

- [ ] Tasks and Check-ins are `Ledger`s, not bordered-`Card`-with-
      `divide-y`.
- [ ] Inline submit dialog (Tasks) and new-check-in dialog still open
      and function correctly after conversion.
- [ ] Progress + placement info reads as a coherent hero/bento
      grouping, not three disconnected blocks.
