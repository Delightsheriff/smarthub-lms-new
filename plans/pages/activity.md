# Activity (`/activity`)

Status: 🟡 Minor gap only

## Current vs legacy

Current: `modules/activity/components/MyActivityPageContent.tsx` (160) +
`modules/activity/lib/action-type.ts` (65). Legacy: `MyActivityPageContent.tsx`
(190, inline `ACTION_LABELS`/`iconFor`, no separate lib file).

Both group entries by day and paginate. Current already uses `PageHeader`
(`:42-45`) and `EmptyState` (`:150-154`) — no gap there, unlike most other
surfaces audited.

## Concrete gap

Action-type coverage shrank. Legacy's `ACTION_LABELS`/`iconFor` cover
`auth.password.change`, `auth.password.reset.request`/`.complete` (KeyRound
icon), and `enrolment.create`. Current's `action-type.ts:24-52` only maps
`auth.login`, `auth.logout`, `submission.submit`/`.resubmit`,
`payment.create`, `profile.update` — password-reset and enrolment events
fall through to a generic icon and a raw `action.replace(".", " ")` label
instead of proper copy.

Colors are already clean (semantic tokens throughout) — the raw-color-looking
strings at line 14 are in a comment describing a past refactor, not live
classes.

## Acceptance criteria

- [ ] `action-type.ts` adds entries for `auth.password.change`,
      `auth.password.reset.request`, `auth.password.reset.complete`, and
      `enrolment.create`, each with a proper label and icon (not the
      generic fallback).
- [ ] `npx tsc --noEmit` and `npx eslint` clean.
