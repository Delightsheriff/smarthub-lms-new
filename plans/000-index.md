# Plan Index — Editorial Rollout, Per-Page

Every plan in this directory (001+) covers exactly one page/surface.
Read this file once — it holds everything shared across all of them,
so individual plans don't repeat it. Read `plans/DESIGN-SYSTEM.md` §1
and §3 once too, for the move vocabulary (masthead, hero+ledger, bento,
magazine `IndexList`, Reading + Rail) and the shared primitives
(`Ledger`/`LedgerItem`/`NagItem` in `components/ui/ledger.tsx`,
`IndexList`/`IndexRow` in `components/ui/index-list.tsx`, `PageHeader`
in `components/layout/page-header.tsx`).

## The one non-negotiable, stated once

**Every page listed here already has a masthead** (`dateline`,
`divider` on its `PageHeader`) from an earlier pass. That work is done
— do not touch `PageHeader`'s props again unless a plan explicitly
says to. **A plan is not satisfied by touching the header.** Each
plan's "Direction" section names a real structural change to the body
of the page — a card stack becoming a `Ledger`, a list becoming an
`IndexList`, a detail page becoming Reading + Rail. That change is
the deliverable. If a page's diff, at the end, is only
`PageHeader`-adjacent, the plan was not done — this has happened
twice already on this codebase and is the reason these plans now spell
out the exact target shape per page instead of leaving it to
inference.

## Ground rules (every plan)

- Read the plan's own "Current state" section as a starting hint, not
  gospel — re-read the actual file before changing it; it may have
  moved since the plan was written.
- Small, incremental commits: `git commit -m "..." -- <exact paths>`,
  never a bare `git commit` or `git add -A` (concurrent-session git
  hazard — see `plans/DESIGN-SYSTEM.md` §7).
- `npx tsc --noEmit` / `npx eslint <changed files>` clean before every
  commit.
- **Live-verify at 375px, 768px, and desktop, in both themes, against
  the real test account** — not a code review substituting for a
  browser check. Two real bugs (a CSS cascade-order regression, a
  fixed-width flex child overlapping at 375px) were only ever found
  this way, not by reading code.
- Don't invent data a page doesn't have. If a design calls for a
  "most recent" or "most urgent" item and the data doesn't support
  identifying one, say so in the commit message and skip that part
  rather than fabricating it.
- Don't apply a move where it doesn't fit. Some pages in this list
  have real custom visual machinery (a calendar grid, a two-pane
  message thread, a poster-art card grid) that a plan explicitly says
  to leave alone or treat differently — read each plan's own judgment
  calls, don't mechanically force every page onto `Ledger`/`IndexList`.

## Acceptance criteria (every plan, in addition to its own)

- [ ] The page's diff includes a real structural change to its body,
      not just header props (see the non-negotiable above).
- [ ] `npx tsc --noEmit` / `npx eslint` clean.
- [ ] Live-verified at 375px / 768px / desktop, light and dark.
- [ ] Small, incremental commits with exact paths.
- [ ] `plans/DESIGN-SYSTEM.md` §3/§8 updated to reflect what shipped.

## Plan registry

| # | Page | Route |
|---|---|---|
| 001 | Profile | `/profile` |
| 002 | Help | `/help` |
| 003 | Assigned Modules | `/assigned` |
| 004 | Self-Paced Courses | `/learn` |
| 005 | Instructor Self-Paced | `/teach/self-paced` |
| 006 | Instructor Earnings + Cohort Revenue | `/billing` (instructor), `/billing/cohort/[id]` |
| 007 | Internship Fee Payment | `/internships/me/payment` |
| 008 | Session Attendance | `/teaching/sessions/[id]` |
| 009 | Assignment Detail | `/assignments/[id]` |
| 010 | Course Module Detail | `/courses/[slug]/modules/[moduleSlug]` |
| 011 | Oreo AI Assistant | `/oreo` |
| 012 | Recordings | `/recordings` |
| 013 | Materials | `/materials` |
| 014 | Courses | `/courses` (catalog + detail) |
| 015 | Billing (student) | `/billing` |
| 016 | Payments | `/payments` |
| 017 | Referrals | `/refer-and-earn` |
| 018 | Internships (workspace) | `/internships` |
| 019 | Activity | `/activity` |
| 020 | Webinars | `/webinars` |
| 021 | Calendar | `/calendar` |
| 022 | Inbox | `/inbox` |
| 023 | Jobs | `/jobs` |
| 024 | Cohort Workspace (6 tabs) | `/teach/cohorts/[scheduleId]` |

**Already done, not in this list:** the student and instructor
dashboards (plan 001 of the prior sequence — see `plans/DESIGN-SYSTEM.md`
§3), Notifications Center (converted to `Ledger` directly, verified
live). **Assignments list** (`/assignments`, student view) already has
real `Ledger`/hero treatment from an earlier pass — confirm it's still
intact rather than re-doing it, but no new plan file needed unless
verification finds it regressed.

Work through these roughly in order; 001–011 match what's already been
attempted once (masthead-only) and are the most urgent to get right.
