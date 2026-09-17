# PLAN 020 — Webinars

Route: `/webinars` · File: `modules/webinars/components/WebinarsPageContent.tsx`
Read `plans/000-index.md` first (ground rules + acceptance, shared).

## Current state (read in full)

Masthead applied, with an Upcoming/Past `Tabs` switch in header
actions. Body is a responsive card grid of `WebinarCard`s (poster
image, title, speakers, date, join/watch link), `Stagger`-animated,
plus a numeric pager for Past.

## Direction

**Leave the grid as a grid.** Webinars have real poster art and
speaker info that a text-only `IndexList` row would flatten away —
this is one of the pages where the card-grid pattern is actually
correct, per `plans/DESIGN-SYSTEM.md` §4's "not everything is a card"
note working in both directions (some things genuinely are cards).
The only real change here: confirm the grid uses `sm:grid-cols-2
xl:grid-cols-3` (or similar) rather than a fixed column count that
squeezes on tablet with the sidebar open — verify at 768px
specifically. If there's a way to fold "next webinar you're likely to
attend" into a small hero above the grid using real registration/
interest data, that's a legitimate addition; don't fabricate one if
the data doesn't support it.

## Acceptance

(Plus the shared checklist in `plans/000-index.md`.)

- [ ] Grid breakpoints verified correct at 768px specifically (this
      was the known tablet-squeeze risk).
- [ ] No `IndexList` conversion — confirmed as the deliberate,
      documented exception, not an oversight.
