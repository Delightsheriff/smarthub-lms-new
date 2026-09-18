# PLAN 027 — Accessibility audit of this session's new shared primitives

No single route — this audits components used across all 25 pages,
not one page. Read `plans/000-index.md` first (ground rules, shared).

## Current state (read in full)

None of `Ledger`/`LedgerItem`/`NagItem`/`LedgerControlItem`
(`components/ui/ledger.tsx`), `IndexList`/`IndexRow`
(`components/ui/index-list.tsx`), `StatusBadge`
(`components/ui/status-badge.tsx`), or `SegmentedControl`
(`components/ui/segmented-control.tsx`) — all new or rewritten this
session, all used on most of the 25 redesigned pages — have had a
dedicated accessibility pass. They were verified visually (browser,
375px/768px/desktop, both themes) but not for keyboard nav, screen
reader semantics, or contrast. Four concrete, already-known gaps
(not a guess — read the source before starting):

1. **`SegmentedControl` uses `role="tablist"`/`role="tab"` without
   roving-tabindex arrow-key navigation.** The ARIA Authoring
   Practices tab pattern expects Left/Right arrow keys to move focus
   between tabs, not just sequential Tab-key stops — right now every
   tab is individually Tab-focusable, which isn't the pattern's actual
   contract. `RoleSwitcher`'s old `SlidingSwitch` had the same gap
   before this session; it's now generalized into a shared component,
   so fixing it once fixes every future consumer.
2. **Color-tone contrast is unverified.** `StatusBadge`'s `warning`/
   `neutral` variants, `NagItem`'s colored left rule, and `LedgerItem`'s
   status dot all carry meaning by color — check actual contrast
   ratios (WCAG AA, 4.5:1 for text / 3:1 for non-text UI) against both
   `--card` backgrounds, light and dark. `--warning` in particular is
   an orange/amber that's historically borderline against light
   backgrounds in many color systems — don't assume it passes.
3. **Toast screen-reader behavior unverified.** Sonner has its own
   `aria-live` region handling, but the custom `classNames` styling
   added this session (`components/ui/sonner.tsx`) hasn't been checked
   with an actual screen reader (VoiceOver/NVDA) to confirm toasts are
   still announced and the close button is reachable/labeled.
4. **`IndexRow`'s numbered index ("01", "02"...) is unlabeled
   decoration or content?** If it's meant to convey order, a screen
   reader reading the row should hear "1, [title]" or similar — right
   now it's a plain `<span>`, so check whether it's currently
   announced usefully or just noise, and fix whichever it should be
   (`aria-hidden` if decorative, or restructured if it's meant to be
   read).

## Direction

Go component by component, not page by page — fixing `SegmentedControl`
once is worth more than checking it 25 times in different pages. For
each of the four items above: confirm the gap is real (don't take this
plan's word for it — verify with a keyboard and, if available, a
screen reader), fix it in the shared component, then spot-check 2–3
consuming pages to confirm the fix didn't change visual behavior.

For contrast specifically: compute actual ratios (a browser devtools
contrast checker or a quick script against the OKLCH values in
`app/globals.css` is fine) rather than eyeballing it — "looks readable"
isn't a pass/fail criterion.

## Acceptance

(Plus the shared checklist in `plans/000-index.md`.)

- [ ] `SegmentedControl` supports Left/Right arrow key navigation
      between tabs (roving tabindex), matching the ARIA `tablist`
      pattern; Home/End optional but nice.
- [ ] Every tone/color combination used by `StatusBadge`, `NagItem`'s
      left rule, and `LedgerItem`'s dot passes WCAG AA in both themes,
      or is demonstrably decorative-only (paired with a text label a
      screen reader already gets some other way).
- [ ] Toast open/close is confirmed reachable and announced with an
      actual screen reader, not just visually verified.
- [ ] `IndexRow`'s index number has a deliberate, documented
      accessibility treatment (decorative or meaningful), not an
      accident of whatever markup was fastest to write.
- [ ] `npm run typecheck` / `npm run lint` clean; no visual regression
      on the 2–3 spot-checked consuming pages per fix.
