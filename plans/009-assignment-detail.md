# PLAN 009 — Assignment Detail

Route: `/assignments/[id]` · File: `modules/assignments/components/assignment-page-content.tsx`
Read `plans/000-index.md` first (ground rules + acceptance, shared).

## Current state (read in full)

A back-button row, then a "Main Header Banner" `Card` (type/priority
badges, title, countdown), then a `grid grid-cols-1 xl:grid-cols-3`
splitting `SubmissionStatusCard`/`GradeCard` (sidebar, 1 col) from the
main content (2 cols) — the skeleton loader already hints at this
shape (`md:col-span-2` + a sidebar skeleton), so the 2/3-1/3 split
already half-exists structurally; it's just not framed as a masthead +
sticky rail, and the header is still a boxed card instead of a
masthead.

## Direction

This is the reference case for Reading + Rail
(`plans/DESIGN-SYSTEM.md` §3):

1. The "Main Header Banner" `Card` becomes the masthead — `PageHeader`
   editorial variant, `dateline` = due-date context (e.g. "Due in 2
   days" or the actual due date), `divider`, type/priority badges
   folded into the description or a small row under the title. Not a
   bordered box below a separate back-button row.
2. `SubmissionStatusCard`/`GradeCard` move into a rail: `sticky top-*`
   on desktop (`xl:` breakpoint, matching the existing grid's), full
   width below the reading column on mobile.
3. Instructions/brief (`RichText`) render in the wide reading column
   at real prose width — not squeezed into the same card as metadata
   badges.

## Acceptance

(Plus the shared checklist in `plans/000-index.md`.)

- [ ] Header is a real masthead, not a bordered `Card`.
- [ ] Rail is `sticky` on desktop, reflows below content on mobile —
      verify the sticky behavior actually works while scrolling, not
      just that the CSS is present.
- [ ] Countdown badge doesn't wrap awkwardly at 375px (this was
      explicitly flagged as a pre-existing issue).
