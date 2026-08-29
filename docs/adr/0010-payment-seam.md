# ADR 0010 — The learner-facing payment surface is one seam, not a provider call

- **Status:** Accepted
- **Date:** 2026-08 (Plan 009)

## Context

Payment touches the student's day in several places: an enrolment billing
screen, an installment-plan schedule card, a full-page gate when access is
paused, a grace-window banner, and the "you saved" summary line. In the
legacy codebase each of these read slightly different wire shapes and
reasoned about payment state in its own way — the gate queried installment
plans, the summary card showed a hardcoded "contact admin" nudge for
waivers and installment enrolment, and nowhere did the product make a
single statement about "does this learner currently have access?"

The plan pre-announced a **payment seam** (`plans/ARCHITECTURE.md`
§"Known seams"): one interface that Paystack / Flutterwave / manual /
waiver can slot behind, so screens stop knowing which provider settled a
payment.

## Decision

Every learner-facing account in this slice reads from **two contracts
only**, both behind the `modules/payment-proofs` service:

1. **`MyInstallmentPlan`** (`GET /payment-proofs/my-plans`) — one row per
   enrolment, carrying `accessStatus`, tranches, grace and amounts. The
   payment **gate**, the grace **banner**, the **schedule card** and the
   billing **summary** all derive from this single shape.
2. **`BillingBreakdown.overall`** (`GET /lms/billing/breakdown`) — the
   summary-card rollups, including `totalDiscount > 0` as the "you saved"
   flag.

Supporting decisions:

- **Gates derive from state, never from provider calls.** The paywall
  decision lives in `resolvePaymentGate(plans, pathname)` — a pure,
  unit-tested function — and triggers only on `accessStatus ===
  "suspended_payment"`, with any other open plan or an always-open route
  (payments/billing/profile/help/inbox) passing through. The API's 402 is
  the authority; the shell gate is the friendly client-side companion.
- **The wire modules are the real seam.** `payment-proofs` owns the
  installment-plan contract; `billing` owns the breakdown. A provider swap
  touches handler wiring under the data seam, never the screens.
- **No payment mutations in this slice.** Proofs are submitted and
  reviewed through ops-facing surfaces (Plan 010+/admin); the learner side
  here is read + one "make a payment" redirect to `/payments`.

## Consequences

- **Positive:** one `accessStatus` drives gate, banner and cards — there is
  no second source of truth for "can this learner open a course", and the
  suspended/grace/active transitions collapse to a single field change.
- **Positive:** the gate decision is testable without a DOM (`tests/payment-gate.test.ts`),
  and normalisers carry the discount-presence contract (`discountAmount > 0`
  toggle) that powers the summary.
- **Positive:** a future provider/waiver change stays inside the handler
  layer of one module.
- **Negative:** enrolment is still modeled as a flat plan list; scholarship
  and internship payment flavors (full-upfront plans already render) fold
  in via `origin`/`planType` on the same shape rather than new screens.