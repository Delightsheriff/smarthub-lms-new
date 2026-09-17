# PLAN 016 — Payments

Route: `/payments` · File: `modules/payment-proofs/components/PaymentsPageContent.tsx`
Read `plans/000-index.md` first (ground rules + acceptance, shared).

## Current state (read in full)

Masthead applied, coordinated loading gate already in place (from an
earlier data-fetching pass — leave that alone). Body: a bank-details
info box, zero-or-more `InstallmentScheduleCard`s (stacked), a full
upload form in its own bordered card, then "Your submissions" as a
**hand-rolled `<ul>` of boxed `<li>` rows** with a status pill — this
is exactly `Ledger`'s stated shape (a dated, typed, status-bearing
list) and isn't using it.

## Direction

1. "Your submissions" → `Ledger`/`LedgerItem`: `tone` from status
   (pending → `due`, confirmed → treat as `info` with a success-colored
   icon chip instead of the dot — reuse the `icon`/`iconClassName`
   slot added for Notifications, since a status icon is a stronger
   signal here than a plain tone dot), `meta` = amount/reference,
   `when` = createdAt.
2. Installment schedule cards: if there are multiple, consider whether
   they're better as `IndexList` rows (due date, amount, status) or
   should stay as distinct cards — judgment call based on how much
   each one actually holds (a rich per-installment breakdown probably
   earns a card; a flat due-date list doesn't).
3. Bank-details box and upload form stay as they are — these are
   genuinely distinct panels (reference info, a real form), not list
   items wearing card costumes.

## Acceptance

(Plus the shared checklist in `plans/000-index.md`.)

- [ ] "Your submissions" is a `Ledger`, not a hand-rolled `<ul>` of
      boxed `<li>`s.
- [ ] Status signal (pending/confirmed/rejected) is clear on each row
      via icon or tone, not lost in the conversion.
- [ ] Upload form and bank-details panel unchanged.
