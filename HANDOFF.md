# Handoff — everything left before this ships

> **Superseded as the live punch list by `HANDOFF-NEXT.md`** (2026-09-25).
> Status of the items below: #1 DECIDED (restrained glass on floating chrome
> only — branch `feat/glass-chrome`), #2 DONE (GitHub remote, pushed),
> #6 DONE (accent StatusTone), #8 DONE (README), #9 DONE (.env.example).
> Everything else is carried into HANDOFF-NEXT.md.

Written 2026-09-25, for a fresh session to pick up and work through before
this goes to the boss. Read `plans/DESIGN-SYSTEM.md` first — it's the
living design-system reference (tokens, primitives, non-negotiables,
git-collision hazard). This file is the punch list; that file is the
context.

## Verified state as of this writing

Full suite was run clean, for the first time this session:

```
npm run typecheck   → 0 errors
npm run lint        → 0 errors, 0 warnings
npm run test        → 147/147 passing (27 files)
npm run build       → succeeds, 0 errors (never run before this)
```

Re-run all four after every batch of changes below — see "Verification
discipline" at the end. Don't trust a summary (yours, a prior session's,
or another agent's) without independently re-running these yourself.

**Important context on recent history:** the previous session had another
agent build a full Apple-glass migration (16 commits — sidebar, top bar,
dialogs, sheet drag-dismiss, toasts, buttons, course posters), then
**revert every one of them**, same day. `git diff` confirms the tree is
byte-identical to the commit before that work started — the revert was
clean, nothing orphaned. So the glass/Apple-motion direction does not
exist in the codebase right now. Item 1 below is about deciding what to
do with that, not about there being a partial mess to clean up.

---

## Tier 1 — decide before anything else

### 1. Glass / Apple-motion: redo it, or drop it?

It was built once (commits `4823e52`..`0456365`) and fully reverted
(`0fae088`..`da131cf`). Before redoing this, find out *why* it was
pulled — wrong look, broke something, or a change of mind — so the next
attempt doesn't repeat the same design and hit the same wall. If you do
redo it, a full component-by-component prompt for it already exists in
this session's transcript (dual light/dark glass tokens, the
apple-design skill's material rules, a canvas-based contrast
measurement requirement — the last pass got contrast wrong twice by
computing it by hand instead of measuring rendered pixels).

If you drop it, items 7 and the sheet/expand-collapse work in Tier 3
still stand on their own — they don't require glass.

### 2. No git remote — this repo has never been pushed anywhere

```
git remote -v   → empty
```

Everything lives only on this machine. Get it onto GitHub/GitLab (or
wherever the team lives) before anything else here matters for a handoff.

---

## Tier 2 — never verified, real risk

### 3. Header/sidebar/courses polish — built by another agent, never reviewed

Four days of unreviewed work touched shared chrome:

- `components/layout/top-bar.tsx`
- `components/layout/app-sidebar.tsx`
- `components/layout/app-shell.tsx`
- `components/ui/sidebar.tsx`
- `components/layout/search-trigger.tsx`, `theme-toggle.tsx`, `user-menu.tsx`
- `app/(app)/courses/[slug]/layout.tsx` and course components
- `configs/brand.ts`

It passes typecheck/lint/build, but that's not the same as looking at
it. This is exactly the kind of shared-chrome change that caused two
real mobile-overflow bugs earlier this session (Inbox's filter tabs,
Cohort Roster's `IndexRow` action button) — both only surfaced by
actually loading pages at narrow widths, not by any static check.

**Do this:** live-verify at 375px / 768px / desktop, light and dark, on
at least: `/dashboard`, `/teach`, `/courses`, `/courses/[slug]`, and one
page with a long sidebar nav list. Check
`document.documentElement.scrollWidth === clientWidth` at 375px on each.

### 4. Cross-browser — still only ever tested in Chromium

The whole design uses OKLCH colors and `color-mix()`. Nobody has opened
this in Safari or Firefox. No agent can do this reliably — it needs a
real browser or BrowserStack, by a human or via a tool that actually
drives Safari/Firefox.

---

## Tier 3 — known, scoped, smaller

### 5. 57 raw `<Badge variant=...>` usages not converted to `StatusBadge`

```
grep -rn '<Badge variant=' --include="*.tsx" modules app | wc -l   → 57
```

This was always a partial rollout by design (plan 025 converted the
clear status-pill cases and correctly left icon-chip tints on
`LedgerItem`/`NagItem` alone — those are a different, correct pattern,
not a miss). What's left needs the same per-site judgment call, not a
blind find/replace: is this a real status pill (convert it) or a tint
on an icon chip (leave it)?

### 6. "Qualified" referral badge lost its accent tint

`StatusBadge` only has 4 tones (success/warning/destructive/neutral).
The old bespoke badge in `ReferralsPanel.tsx` had a 5th "accent" tint
for "qualified" that doesn't exist in the shared component. Currently
renders as neutral/outline. Cosmetic, undecided — either accept
neutral, or add a 5th tone to `lib/utils/status.ts`'s `StatusTone` type
and `TONE_TO_VARIANT` in `components/ui/status-badge.tsx`.

### 7. Sheet drag-to-dismiss, expand/collapse animation, role-switch cross-fade

Part of the reverted glass work, never shipped independently:

- Mobile `Sheet` (`components/ui/sheet.tsx`, used by `BottomNav`'s
  "More" menu) has no drag-to-dismiss or momentum.
- Expand/collapse rows snap open instantly with no transition:
  `CohortModulesTab`, `RegistrationBillingCard`,
  `modules/learning/components/module-section.tsx`,
  `materials-page-content.tsx`.
- Switching Student/Teaching hard-cuts between two different dashboards
  with no transition.

None of these require glass. If you want them, they're a normal
`motion/react` job — respect the reduced-motion setup already in place
(`app/globals.css`'s `prefers-reduced-motion` block +
`<MotionConfig reducedMotion="user">` in `app-providers.tsx`).

---

## Tier 4 — polish before it looks like a gift, not a project

### 8. `README.md` is still the generic Next.js template

Doesn't describe SmartHub, doesn't explain how to run it or what it
needs. Write a real one: what this is, `npm run dev`/`build`/`test`,
required env vars (see #9), and a pointer to
`plans/DESIGN-SYSTEM.md` for anyone touching UI.

### 9. No `.env.example`

Only a gitignored `.env.local` exists. Whoever opens this next (your
boss, or a fresh checkout) has no idea what environment variables to
set. At minimum it needs `NEXT_PUBLIC_API_URL`, `AUTH_API_URL`,
`AUTH_SECRET`, `AUTH_TRUST_HOST` (see `plans/DESIGN-SYSTEM.md` §5) —
check `.env.local` for the full real list and copy the *keys*, not the
values, into `.env.example`.

### 10. No CI config

No GitHub Actions, no Vercel config. Ties to #2 — nothing to run until
it's pushed somewhere. Once it is, at minimum wire typecheck/lint/test
on every push.

### 11. `public/mock/` has placeholder assets

Course thumbnails and a person photo (`ade.jpg`) that read as
placeholder/demo content. Worth swapping for real assets before this is
in front of your boss.

### 12. `components/layout/coming-soon.tsx` is dead code

Not imported anywhere currently. Either wire it to whatever unbuilt
feature it was for, or delete it.

---

## Verification discipline (apply to every item above)

- Run `npm run typecheck && npm run lint && npm run test` after every
  batch of edits, not just at the end — paste the actual output, don't
  summarize it.
- For anything touching a page or shared chrome: live-verify in a real
  browser at 375px / 768px / desktop, light and dark. A change that only
  passes typecheck/lint has not been verified — this session hit two
  real mobile-overflow bugs that only static checks would have missed.
- For any color/contrast claim: measure it. Render the color to a
  `<canvas>`, read the actual pixels, compute WCAG contrast from those —
  don't compute it by hand from OKLCH values. A previous pass in this
  project got a contrast number wrong by ~2x doing exactly that, and it
  shipped a badge that failed WCAG AA for a full session before it was
  caught.
- Git: this repo has been edited by concurrent agent sessions before and
  hit a real collision because of it — see `plans/DESIGN-SYSTEM.md` §7.
  Commit with `git commit -m "..." -- <exact paths>`. Never `git add -A`,
  never a bare `git commit`.
- Don't trust a completion report's prose, including this file's own
  claims about what's "done" elsewhere — re-verify against the actual
  code and actual command output before building on top of it.
