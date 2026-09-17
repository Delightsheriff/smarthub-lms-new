# PLAN 023 — Jobs

Route: `/jobs` · File: `modules/jobs/components/JobsPageContent.tsx`
Read `plans/000-index.md` first (ground rules + acceptance, shared).

## Current state (read in full)

Masthead applied. Filter row is server-side (search, company `Select`,
remote/onsite pills — already debounced from an earlier data-fetching
pass, leave that alone). Body: one bordered `Card` containing a
`divide-y` `<ul>` of `JobRow`s (icon chip, company/remote badge, title,
location/salary/posted-date meta, trailing "Apply" + external-link).
This is already structurally very close to `IndexRow`'s grammar
(hairline-divided rows, icon, meta line, trailing affordance) — just
not the actual component, and with no numbering/progress concept
(neither of which a jobs list needs).

## Direction

Convert `JobRow`'s container from the single wrapping `Card` +
`divide-y ul` to `IndexList`, and `JobRow` itself to `IndexRow` (or a
close sibling if `IndexRow`'s `progress`/`status` slots don't fit a
job listing — a job doesn't have "progress," so `progress` stays
unset; `status` could hold "Remote"/"Onsite"). This is a low-risk,
mostly-mechanical conversion since the current row shape already
matches. Server-side pagination (`Pager`) stays as-is — this plan
doesn't touch data-fetching.

## Acceptance

(Plus the shared checklist in `plans/000-index.md`.)

- [ ] Job list uses `IndexList`/`IndexRow` (or a documented sibling),
      not a `Card` + `divide-y ul`.
- [ ] "Apply" / external-link action still works per row.
- [ ] Pagination, search, and filters unchanged and still functional.
