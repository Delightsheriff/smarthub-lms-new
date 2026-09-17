# PLAN 007 — Internship Fee Payment

Route: `/internships/me/payment` · File: `modules/internships/components/payment/InternshipPaymentPageContent.tsx`
Read `plans/000-index.md` first (ground rules + acceptance, shared).

## Current state

Masthead applied (payment status in dateline). Same content shape as
the already-migrated student Payments page (bank details + proof
upload) — **not personally re-read for this plan**; read it fresh, then
read `modules/payment-proofs/components/PaymentsPageContent.tsx` (plan
016) as the reference, since these two pages solve the same problem
(pay via bank transfer, upload proof) and should look the same.

## Direction

Mirror plan 016's shipped pattern exactly — don't invent a second
design for the same interaction. If plan 016 hasn't shipped yet when
you reach this plan, do them together or use `plans/000-index.md`'s
shared vocabulary directly (masthead + flat info panels + a `Ledger`
for the submission history, per plan 016's own direction) rather than
inventing something page-local.

## Acceptance

(Plus the shared checklist in `plans/000-index.md`.)

- [ ] Visually and structurally consistent with the student Payments
      page's shipped pattern — not a second, different design for the
      same flow.
- [ ] Submission/status history (if this page has one) is a `Ledger`,
      not boxed cards.
