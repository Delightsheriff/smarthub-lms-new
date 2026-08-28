# ADR 0008 — The dashboard is a composition point, not a module

- **Status:** Accepted
- **Date:** 2026-08 (Plan 004)

## Context

The dashboard screen aggregates data owned by many other modules — billing
balance, referral eligibility, upcoming webinars, assigned modules, progress
pulse, calendar deadlines, per-course progress. In the legacy codebase the
dashboard page reached into service/normaliser internals directly and held
its own copies of rollup logic, inviting duplicate queries and drift as each
owning module evolved.

## Decision

Treat the dashboard as a **composition point**: it arranges, it does not
implement.

1. The dashboard page (`DashboardPage` + `StudentDashboardBody`) owns only
   two things — the **composition order** (greeting → self-gating nag grid →
   stats strip → progress pulse → webinars → assigned-modules → continue-
   learning → deadlines → progress-by-course → your-courses) and the
   **role branch** (student body vs the instructor teaching placeholder,
   deferred to Plan 011).
2. Every concern it shows must already exist as a **widget inside its owning
   module**, rendering through that module's **public query hook + normalised
   types**. The dashboard imports and arranges widgets; it never calls a
   module service, normaliser, or raw mock route itself.
3. Each widget **self-gates to `null`** when it has nothing to show (no
   outstanding balance, no referral code, no upcoming webinars, no assigned
   modules) so its slot collapses to zero height.
4. A **delete-test** guards the rule: any widget's `<Foo />` line can be
   removed from the body without leaving dangling layout or dead imports. If a
   widget would merely pass through, it is deleted from the dashboard and the
   dedicated module page owns it instead.

## Consequences

- **Positive:** the dashboard stays shallow by design; its only real
  complexity is ordering + role branch, the product's "what do I need right
  now?" logic.
- **Positive:** each widget is owned, query surface, normalised types,
  self-gating null path, and preview slicing — by its source module, and is
  testable in isolation.
- **Positive:** prevents the "dashboard mega-module" failure mode that reaches
  into private internals or duplicates owning-module logic.
- **Negative:** a thin indirection — the page must import each widget — worth
  it because the module's public query surface *is* the seam the dashboard
  crosses, and it must stay free of layout/nav concerns.
