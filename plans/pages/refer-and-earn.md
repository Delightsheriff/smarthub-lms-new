# Refer & earn (`/refer-and-earn`)

Status: ✅ Done — commit `cd8874d`. Legacy compared during this redesign.

Rebuilt with the segmented-header-tabs pattern (Share/Earnings/Ledger/
Payouts in `PageHeader`'s actions slot), `ProgramShareLink` normalized onto
the shared `Card`, icons on the earnings tiles, avatar initials on ledger
rows, `EmptyState` throughout. Legacy's equivalent (`ReferAndEarnPage`) was
read in full during this pass — no functional gaps found beyond styling;
current's dead "Notifications" settings-row pattern (same bug class as the
Profile page's) was not present here.
