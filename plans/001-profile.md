# PLAN 001 — Profile

Route: `/profile` · File: `app/(app)/profile/page-content.tsx` (+ `modules/profile/components/*`)
Read `plans/000-index.md` first (ground rules + acceptance, shared).

## Current state

Masthead already applied. Structurally this page is already a
distinct, legitimate pattern — not a card-stack anti-pattern to fix:
an identity `Card` (avatar, name, badges, joined date) + a persistent
left settings rail (solid-fill active state, horizontal-scroll pill
row on mobile) driving 7 sections: overview / professional / siwes /
banking / notifications / achievements / security. Data comes from
`useAuthStore((s) => s.user)`, not a query hook. The Overview section
is one boxed `Card` with a hand-rolled `Row` helper rendering
`divide-y` label/value pairs (name, email, phone, city, etc.).

## Direction

Keep the identity-card + settings-rail shell — it's the right pattern
for an account-settings page, not something to force into hero+ledger
or magazine-index. Real changes:

1. **Overview's label/value rows** — already hairline-divided, close
   in spirit to `Ledger` but a plain 2-column list is the more honest
   fit here (there's no date/type/urgency signal per field, just
   "field: value"). Give it real typographic treatment instead of the
   generic `Row` helper: mono uppercase micro-labels (matching the
   `Ledger`/masthead mono-label convention used everywhere else now),
   value in the normal body weight, consistent vertical rhythm.
2. **Read the Professional, SIWES, Banking, Notifications,
   Achievements, and Security sections before starting** — this plan
   was written from the Overview tab and the shell alone; the other
   six weren't read in full. Apply judgment per section:
   - Achievements (badges/trophies): a real bento-tile candidate if it
     shows counts/stats — match `ProgressPulseCard`'s tile shape if so.
   - Banking/Professional (form fields): these are edit forms, not
     browse lists — leave the RHF+zod form patterns alone (plan 017
     from the prior sequence already standardized these), focus only
     on visual rhythm, not re-architecting the forms.
3. Don't touch `PageHeader`'s dateline/divider — already correct.

## Acceptance

(Plus the shared checklist in `plans/000-index.md`.)

- [ ] Overview's row list has real typographic hierarchy (mono
      micro-labels), not the generic hand-rolled `Row` look.
- [ ] Every other section read and given a considered, judgment-based
      pass — not skipped, not force-fit into an unrelated pattern.
- [ ] The identity-card + settings-rail shell is preserved (it's
      correct), not replaced.
