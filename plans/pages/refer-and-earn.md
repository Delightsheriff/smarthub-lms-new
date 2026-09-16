# Refer & earn (`/refer-and-earn`)

Status: ✅ Done — editorial PageHeader, canvas-warm code card, hairline stat-strip, and TechScholarshipCard rolled out (Plan 016 Slice 4).

Rebuilt with the segmented-header-tabs pattern (Share/Earnings/Ledger/
Payouts in `PageHeader`'s actions slot), `ProgramShareLink` normalized onto
the shared `Card`, icons on the earnings tiles, avatar initials on ledger
rows, `EmptyState` throughout. Legacy's equivalent (`ReferAndEarnPage`) was
read in full during this pass — no functional gaps found beyond styling;
current's dead "Notifications" settings-row pattern (same bug class as the
Profile page's) was not present here.
