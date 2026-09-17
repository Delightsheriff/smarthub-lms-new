# PLAN 008 — Session Attendance

Route: `/teaching/sessions/[id]` · File: `modules/teaching/components/ClassSessionAttendancePage.tsx`
Read `plans/000-index.md` first (ground rules + acceptance, shared).

## Current state (read in full)

Masthead applied correctly (session title + start datetime as
dateline, "Save All Marks" as the header action) — this surface's
header is genuinely done, don't touch it. The gap is the roster body:
one bordered `Card` containing a `space-y-3` stack of
`bg-muted/20`-bordered rows, each with name/email/source badge on the
left and a status `Select` + note `Textarea` on the right.

## Direction

Give `LedgerItem` (`components/ui/ledger.tsx`) a variant, or add a
sibling row component in the same file, whose trailing slot holds
inline controls (the status `Select` + note input) instead of a
`when` timestamp — the roster is a list of typed rows with an inline
control, which is what `Ledger` already models, just with a control in
the slot that's currently text-only. Replace the
`bg-muted/20`-bordered-row list with this. Keep the `Select`'s options
and the note `Textarea` exactly as they are — this is a container
change, not a control change.

## Acceptance

(Plus the shared checklist in `plans/000-index.md`.)

- [ ] Roster renders as hairline-divided rows (`Ledger` or a sibling
      pattern), not individually bordered/backgrounded rows.
- [ ] Status `Select` and note `Textarea` behavior unchanged —
      verify a status change and a note both still save correctly on
      "Save All Marks."
- [ ] Masthead untouched (already correct).
