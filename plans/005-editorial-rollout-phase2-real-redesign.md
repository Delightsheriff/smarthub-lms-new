# PLAN 005 — Real Structural Redesign for the Phase-2 Surfaces

**Status:** Ready to hand off
**Supersedes:** `plans/004-editorial-rollout-phase2-oreo-and-remaining.md`'s
design-move column, which shipped (commits `a745db1`…`5ebef47`) but only
ever prescribed "editorial masthead" for most surfaces — a header
reskin, not the structural change plan 001 actually made to the
dashboard. This plan analyzes the **real, current code** (read fresh
for this doc, not assumed) and prescribes actual layout changes.

**Depends on:** Read `plans/DESIGN-SYSTEM.md` in full, and read
`app/(app)/dashboard/page.tsx` / `modules/teaching/components/TeachPageContent.tsx`
as the bar this needs to clear — a masthead alone does not.

---

## 0. Why plan 004 fell short

Checked the actual diffs, not just the plan doc: `NotificationsPageContent.tsx`,
`HelpPageContent.tsx`, `AssignedModulesPageContent.tsx`, and
`OreoPageContent.tsx` all now have `dateline`/`divider` on their
`PageHeader` — and nothing else changed. Cards are still cards, the
grid is still a grid, the accordion is still an accordion, same
radius/border/shadow on every block. This is exactly the "still looks
like the old system" problem plan 001 fixed on the dashboard, just
with a nicer header sitting on top of it. A masthead is one of four
moves (`plans/DESIGN-SYSTEM.md` §1) — applying only that one, every
time, produces what just shipped: fifteen-plus pages with a new
headline and an unchanged body.

## 1. A fifth move: Reading + Rail, for single-item detail pages

The existing four moves (masthead, hero+ledger, bento, magazine-index)
are built for browse/dashboard surfaces. `AssignmentPageContent` and
`CourseModulePageContent` are neither — they're a single item's detail
page, and forcing a hero+ledger split onto "read this one assignment's
brief" doesn't fit. `assignment-page-content.tsx` already has the
right instinct at the skeleton level (`md:col-span-2` main +
`md:col-span-1` sidebar) — this move names it properly and asks for it
everywhere a single-item detail page exists:

- **Wide reading column** (~2/3): the actual content — assignment
  brief, lesson material — set in real prose typography (generous
  line-height, `max-width` for readable line length), not boxed inside
  a bordered `Card` the way `assignment-page-content.tsx`'s "Main
  Header Banner" currently is.
- **Slim rail** (~1/3, `sticky top-*` on desktop): status, countdown,
  points, the primary action (submit / grade / mark). This is where a
  `Card` earns its keep — it's a genuinely distinct control panel, not
  a list wearing a card costume.
- On mobile, rail content moves below the reading column, in the order
  that matters most first (status/countdown before secondary metadata).

Apply this to: Assignment Detail, Course Module Detail, and Cohort
Revenue Breakdown (which is already a single-cohort detail page under
a card-grid, not yet under this pattern).

## 2. Per-surface direction

### Oreo AI Assistant (`/oreo`)
A chat interface — hero+ledger doesn't apply, and the bubble UI itself
is correct, not broken. Real changes:
- The usage-quota strip (currently its own bordered box directly under
  the masthead) folds into the masthead's `description` line instead
  of duplicating as a second box — the dashboard's masthead pattern
  already puts a live stat inline in the deck (`<strong>{n}</strong>
  courses...`); do the same here instead of a separate `bg-muted/40`
  strip.
- The empty-state suggestion chips (currently a wrapped row of pill
  buttons) become a small numbered list matching `IndexList`'s row
  language — reusing that visual vocabulary here is a real
  cross-surface consistency win, not decoration.
- "How I got this" tool-step panel restyled with the `Ledger`
  aesthetic (hairline rows, mono labels) instead of a generic
  `bg-muted/40` box.

### Help Library (`/help`)
A browse/catalog page — the correct target is `IndexList`, not a
`sm:grid-cols-2` card grid, **except** video resources, which
genuinely benefit from a visual thumbnail (video is inherently a
visual medium; a text row loses real information — the preview image).
Split by type: documents/links become `IndexRow`s (numbered,
hairline-divided, an inline "Read"/"Open" action where `IndexRow`
currently shows a chevron); videos keep a visual card grid, since
that's the one type where the current grid treatment is actually
correct.

### Notifications Center (`/notifications`)
The highest-confidence, lowest-risk win in this whole plan:
notifications are exactly what `Ledger`/`LedgerItem` was built for — a
hairline-divided list of dated, typed entries. Replace the
`Card`-per-notification list with one `Ledger`; `LedgerItem`'s `tone`
dot carries the unread/type signal that's currently a solid accent bar
on each card, `onClick` handles mark-as-read, `when` holds the
timestamp. "Mark all read" moves into the `Ledger`'s title row
(`title`/`count` slot already supports a trailing element — extend it
if it doesn't take one yet) instead of living in the masthead actions
next to a `Tabs` filter.

### Assigned Modules (`/assigned`)
The accordion pattern itself is reasonable — each module carries real,
substantial sub-content (recordings, materials, tasks), so
progressive disclosure isn't wrong. What's wrong is that the *closed*
state has the same visual weight as everything else: a bordered card
indistinguishable from any other card on any other page. Give the
closed row the `IndexList` treatment (numbered, hairline, duration +
counts as compact metadata, chevron that rotates instead of a static
one) so browsing the list reads as an index; let only the *expanded*
content break into its own bordered panel, since expanded content is
genuinely substantial enough to earn one.

### Self-Paced Courses (`/learn`)
Same content shape as the already-migrated `/courses` (a browse list
of enrolled/available tracks) — mirror that page's shipped
`IndexList` + progress-rule pattern exactly, for consistency, not a
new pattern. If there's a clear "most recently active" self-paced
course, it's also a legitimate candidate for the dashboard's
"continue learning" hero pattern — check whether the data supports
identifying one before adding it; don't fabricate a hero for content
that has no real "most recent" signal.

### Instructor Self-Paced (`/teach/self-paced`)
Apply the bento-tile pattern (matching `StatsStrip`/`ProgressPulseCard`'s
exact tile shape — same header treatment, same 2-col grid, no
viewport-based `md:grid-colsN`) to the earnings summary, and
`IndexList` to the course-management list. Read the file fresh before
starting; it wasn't re-read for this plan in the detail the others
were.

### Instructor Earnings (`/billing`, instructor mode) + Cohort Revenue Breakdown
Already read in full for this plan. Better shape than most of plan
004's targets — `Tile`/`MiniStat` are already bento-tile-adjacent (a
bordered card with a label and a big number). Real changes:
1. Replace the page-local `Tile`/`MiniStat` components with the actual
   shared bento-tile visual contract from `StatsStrip`/`ProgressPulseCard`
   (same rounded-xl/icon-circle/big-number shape) instead of a third,
   slightly different hand-rolled version — three pages, three
   almost-identical tile components is exactly the kind of drift the
   shared-primitive registry exists to prevent.
2. The "By cohort" and "Payout history" `<table>` elements are
   **correctly tables** — dense, multi-column, comparable-row financial
   data is a legitimate table use case, not a mis-applied pattern; don't
   force these into `Ledger` rows, which would lose column alignment
   that actually matters here. Do restyle the table chrome (the heavy
   `bg-muted/40` header row, the border treatment) to the lighter
   hairline aesthetic used elsewhere instead of the current boxed-table
   look, for visual consistency with the rest of the app.
3. `CohortEarningsDetailContent` moves onto the Reading + Rail pattern
   from §1: the "who paid" table is the reading column's content, the
   three headline stats (Collected / Your earnings / Your share) move
   into the rail as a compact vertical stack instead of a 3-up grid
   competing with the table for top-of-page space.

### Internship Fee Payment (`/internships/me/payment`)
Same content shape as the already-migrated student `/payments`
(`PaymentsPageContent.tsx` — read it, it already has a real masthead +
flat bank-details panel treatment, not boxed-card-per-field). Mirror
that page's shipped pattern rather than inventing a new one for what
is functionally the same "pay via bank transfer, upload proof" flow.

### Session Attendance (`/teaching/sessions/[id]`)
The roster is a list of typed rows with an inline control — a natural
`Ledger` extension: give `LedgerItem` (or a sibling in the same file)
a variant whose trailing slot holds the status `Select` + note input
instead of a `when` timestamp, replacing the current
`bg-muted/20`-bordered-row-per-student list. The masthead's `divider`
+ session datetime is already correctly in place — this surface's
real gap is the roster body, not the header.

### Assignment Detail (`/assignments/[id]`) + Course Module Detail (`/courses/[slug]/modules/[moduleSlug]`)
Both move onto the Reading + Rail pattern from §1. For Assignment
Detail specifically: the "Main Header Banner" `Card` (type/priority
badges, title, countdown) becomes the masthead (dateline = due date
context, divider), not a bordered box below a separate back-button
row; `SubmissionStatusCard`/`GradeCard` move into the rail;
instructions/brief render in the wide reading column using `RichText`
at real prose width, not squeezed into the same card as the metadata
badges. For Course Module Detail: same shape, plus the already-
established `overflow-x-auto` / `w-max` scrollable-tabs fix for
however many lesson-format tabs the module has.

### Addendum: Recordings, Materials, Courses — plan 003's unfulfilled claim

`plans/003-editorial-rollout-phase1.md` claimed these three shipped
`IndexList` treatment. Checked while writing this plan: none of the
three (`recordings-page-content.tsx`, `materials-page-content.tsx`,
`CoursesPageContent.tsx`) import `IndexList`/`IndexRow` — they're
masthead-only, same as everything else in §2. This is the same,
already-proven pattern as the dashboard's "Your courses" list; no new
design thinking needed, just actually applying it: numbered rows,
hairline dividers, progress rule + status/type metadata, following the
exact shape `app/(app)/dashboard/page.tsx` already uses. Do these
alongside §2's surfaces — they're lower-risk (the pattern is proven,
not proposed) and should be quick relative to the rest of this plan.

## 3. Ground rules

Same discipline as every prior handoff in this track:
`plans/DESIGN-SYSTEM.md` §7 (small commits, `git commit -- <exact
paths>`, never bare `git commit`/`git add -A`), `npx tsc --noEmit` /
`npx eslint <changed files>` clean before every commit, live
verification at 375px / 768px / desktop in both themes against the
real test account — not a code review substituting for a browser
check. Re-read `plans/DESIGN-SYSTEM.md` §4's two named bugs (CSS
cascade order; fixed-width flex children not shrinking at narrow
widths) before touching any header or tab-bar row.

**Don't apply a move where it doesn't fit.** §2 above already makes
per-surface calls (tables stay tables on the earnings pages; Oreo
doesn't get a hero+ledger split); extend that same judgment to any
surface not explicitly covered here rather than mechanically forcing
all five moves onto everything.

## 4. Acceptance

- [ ] Every surface in §2 has an actual structural change beyond its
      `PageHeader` — reviewable by diffing against what's on `main`
      today and confirming more than `dateline`/`divider`/`description`
      changed.
- [ ] Notifications, Assigned Modules, and Help all replace their
      card-grid/card-list body with `Ledger`/`IndexList` per §2's
      per-type split (Help) or full replacement (Notifications, Assigned
      Modules' closed state).
- [ ] Instructor Earnings and Cohort Revenue Breakdown share one bento-
      tile component with the dashboard instead of a third hand-rolled
      `Tile`/`MiniStat`; tables get the lighter hairline chrome, not a
      `Ledger` conversion.
- [ ] Assignment Detail and Course Module Detail (and Cohort Revenue
      Breakdown) are on the new Reading + Rail pattern, documented in
      `plans/DESIGN-SYSTEM.md` §3 as a fifth primitive alongside the
      original four.
- [ ] Every migrated surface live-verified at 375/768/desktop, light
      and dark, against real data.
- [ ] `plans/DESIGN-SYSTEM.md` updated (§3 primitive list gets Reading +
      Rail; §8 status ledger reflects what shipped).
