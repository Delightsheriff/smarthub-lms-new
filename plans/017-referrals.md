# PLAN 017 — Referrals

Route: `/refer-and-earn` · File: `modules/referrals/components/ReferralsPanel.tsx`
Read `plans/000-index.md` first (ground rules + acceptance, shared).

## Current state (read in full)

Masthead applied, with a Share/Earnings/Ledger/Payouts `Tabs` strip in
the header actions. A persistent "code-pill" hero card sits below the
masthead across all tabs. Per tab: Share = 3 `ProgramShareLink` cards;
Earnings = a 3-up stat-tile row; **the "Ledger" tab is a raw HTML
`<table>`** (a function literally named `LedgerTable`) — **this is NOT
the `Ledger` component from `components/ui/ledger.tsx`, just a naming
coincidence.** Don't assume it's already done because of the name.
Payouts tab is another raw `<table>` plus a request-payout card.

## Direction

1. **The "Ledger" tab's `LedgerTable`** — this genuinely is a
   dated/typed list (referral records with status/amount/date) and
   should become the real `Ledger`/`LedgerItem` component, not stay a
   table. Rename the local function to avoid the collision once
   converted.
2. **Payouts table** — same content shape (dated, typed, status-
   bearing) as the "Ledger" tab; also a real `Ledger` candidate.
3. **Earnings stat-tile row** — align to the shared bento-tile shape
   (`StatsStrip`/`ProgressPulseCard`) if it isn't already close.
4. The code-pill hero and the 3 Share cards are fine as distinct
   objects — don't force them into a list pattern.

## Acceptance

(Plus the shared checklist in `plans/000-index.md`.)

- [ ] The "Ledger" tab uses the actual `Ledger` component (and its
      local `LedgerTable` function is renamed or removed, not left as
      a confusing dead name).
- [ ] Payouts tab is also a real `Ledger`, not a `<table>`.
- [ ] Earnings tiles match the shared bento-tile shape.
- [ ] All 4 tabs still function correctly after conversion — verify
      tab switching, not just the default tab.
