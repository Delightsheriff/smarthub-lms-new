# Billing (student) / Earnings (instructor) / Payments

Status: ✅ Done — editorial PageHeader rolled out on Billing header (Plan 016 Slice 6). Legacy-parity not yet fully audited.

`PageHeader`/`EmptyState` adopted on both `BillingPageContent` and
`InstructorEarningsPageContent`. The summary/registration/cohort-breakdown
cards underneath were already well-built (theme tokens, `Progress`, `Badge`)
and untouched.

Not yet checked against legacy in this pass: the `/payments` route (separate
nav item from `/billing`, not yet read this session) and `CohortEarningsDetailContent`
(the per-cohort drill-down) beyond the header. If picking this back up,
audit `/payments` specifically — it hasn't been looked at at all yet.
