# PLAN 024 — Cohort Workspace (all 6 tabs)

Route: `/teach/cohorts/[scheduleId]` · File: `modules/teaching/components/CohortDetailPageContent.tsx` + 6 tab components
Read `plans/000-index.md` first (ground rules + acceptance, shared).

## Current state (read in full)

Masthead applied on the shell; horizontally-scrollable `Tabs` bar (6
tabs, live counts in labels) already using the correct pattern. Every
one of the 6 tab bodies is a **stack of boxed cards** — none use
`Ledger`/`IndexList` today, including Roster, despite roster data
(name/email/submission-count/last-submitted) looking like an obvious
`IndexList` candidate on paper.

## Direction, per tab

1. **Overview** (`CohortOverviewTab`) — a 4-up stat-tile grid + one
   description card. Align the stat tiles to the shared bento-tile
   shape if not already close; the description card is a genuine
   distinct object, leave it.
2. **Modules** (`CohortModulesTab`) — numbered content (Module 1, 2,
   3...) currently as boxed cards → `IndexList`/`IndexRow`: `subtitle`
   = assignment/recording counts, row expands or links to the module's
   detail rather than showing full `RichText` description inline.
3. **Assignments** (`CohortAssignmentsTab`) — boxed cards with a
   visibility `Switch` + due-date/submission/pending meta →
   `IndexList` row per assignment, with the `Switch` moved into the
   row's trailing slot (add an `actions`-style escape hatch to
   `IndexRow` if it doesn't have one, matching `NagItem`'s).
4. **Submissions** (`CohortSubmissionsTab`) — boxed cards with a grade
   button, plus its own all/pending/graded filter tabs → `Ledger`:
   `tone`/`icon` from status (graded → success icon, late → warning
   tone), `meta` = student + assignment, `onClick` opens
   `GradingDialog` exactly as today. Filter tabs move into the
   `Ledger`'s `actions` header slot (same pattern used for
   Notifications).
5. **Sessions** (`CohortSessionsTab`) — boxed cards with a "Mark
   Attendance" button → `Ledger`, `when` = session start, `onClick`/
   `href` to the attendance page (plan 008).
6. **Roster** (`CohortRosterTab`) — **flagged in the audit as further
   from `IndexList` than expected**: no numbering, no progress rule,
   fully boxed. Needs a real rebuild, not a light touch: `IndexList`
   with `subtitle` = email, a `progress`-slot repurposed or left unset
   (no natural 0-100 value here — don't force one), `status` =
   submission count / last-submitted, row action opens
   `StudentAttendanceSheet`.

## Acceptance

(Plus the shared checklist in `plans/000-index.md`.)

- [ ] All 6 tabs converted per their direction above — this is one
      plan but six real sub-changes; don't ship a partial pass across
      only some tabs and call the plan done.
- [ ] Every interactive behavior preserved and re-tested: visibility
      toggle (Assignments), grading dialog (Submissions), mark-
      attendance (Sessions + Roster), submission/pending/graded filter
      (Submissions).
- [ ] Tabs bar itself untouched (already correct).
- [ ] Live-verified by actually switching between all 6 tabs at
      375px/768px/desktop — not just the default (Overview) tab.
