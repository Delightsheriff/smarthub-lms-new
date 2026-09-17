# PLAN 015 — Billing (student)

Route: `/billing` · File: `modules/billing/components/BillingPageContent.tsx`
Read `plans/000-index.md` first (ground rules + acceptance, shared).

## Current state (read in full)

Masthead applied. `useBillingBreakdown()` returns `overall` (totalPaid/
totalDue/totalAmount/paymentProgress/nextPaymentDue) and
`registrations: BillingRegistrationCard[]`, each with courseName,
cohortLabel, paymentStatus, paymentOption, amounts, paymentProgress,
discount fields, nextPaymentDue, and a `payments` array. Body: a
`BillingSummaryCard`, then a "Per course" section that is **a vertical
stack of boxed `RegistrationBillingCard`s** — exactly the equal-weight
card-stack pattern this whole rollout exists to fix.

## Direction

1. Per-course registrations → `IndexList`/`IndexRow`: `title` =
   courseName + cohortLabel, `progress` = paymentProgress, `status` =
   paymentStatus, row click opens whatever detail the card currently
   opens (or expands inline if there's no separate detail view).
2. Each registration's individual `payments` history (if shown) → a
   `Ledger` of dated payment entries, not nested inside the card.
3. `BillingSummaryCard` (the top-level totals) is a legitimate
   candidate for the bento-tile pattern if it currently hand-rolls its
   own tile look — check it against `StatsStrip`'s shape and align if
   it's a near-miss.

## Acceptance

(Plus the shared checklist in `plans/000-index.md`.)

- [ ] Per-course list is `IndexList`, not a stack of bordered cards.
- [ ] Payment history (if surfaced) is a `Ledger`.
- [ ] `BillingSummaryCard` matches the shared bento-tile shape if it's
      close to one already; left alone if it's a genuinely different
      kind of summary (e.g. a single progress bar, not a tile grid).
