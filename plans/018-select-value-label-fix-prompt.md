# PLAN 018 — Handoff Prompt: Fix Select Trigger Label Resolution

**Status:** Ready to hand off
**Owner:** SmartHub design-system modernization (same track as Plans 014–017)
**Depends on:** Nothing structurally — read `plans/DESIGN-SYSTEM.md` §4
and the ground rules in `plans/016-editorial-rollout-prompts.md` §2
(git-collision discipline, verify-before-done) before starting.

---

## 0. The bug, precisely

Every `Select` in this app shows the raw stored **value** in its closed
trigger instead of the matching option's **label** — e.g. a course
filter defaulted to "all" shows literally `all` (lowercase) instead of
`All`; the assignment submission-format picker shows `file` instead of
`File Attachment (PDF, Zip, Doc)`. Confirmed live on the Courses page's
Mode/Course kind filters and the assignment submission dialog.

**Root cause, confirmed against the library's own type definitions**
(`node_modules/@base-ui/react/select/value/*.d.ts`): Base UI's
`Select.Value` (this codebase's `SelectValue`, from
`components/ui/select.tsx`) does **not** automatically look up the
currently-selected `Select.Item`'s rendered children the way Radix's
equivalent does. Its own doc comment:

```
/**
 * Accepts a function that returns a `ReactNode` to format the selected value.
 * @example
 * <Select.Value>
 *   {(value: string | null) => value ? labels[value] : 'No value'}
 * </Select.Value>
 */
children?: React.ReactNode | ((value: any) => React.ReactNode);
```

Without that `children` render-prop (or an `items` map passed to
`Select.Root` — see Base UI's docs for that alternative shape), `Select.
Value` just renders the bare value. **Every consumer in this codebase
uses bare `<SelectValue />` or `<SelectValue placeholder="..." />` with
no render-prop**, so this is systemic, not a one-off typo.

## 1. Every file that needs the fix

Confirmed via `grep -rl "SelectValue" modules app components --include="*.tsx"`
(re-run this yourself — it may have grown since):

- **`components/ui/filter-dropdown.tsx`** — highest leverage. This is
  the shared `FilterDropdown` component behind most of the app's status/
  mode/kind filters (Courses, Teaching cohorts, and others). Fixing it
  here fixes every page that uses `FilterDropdown` at once.
- `modules/acceptance-letters/components/EditSiwesDurationDialog.tsx`
- `modules/assignments/components/submission-form.tsx` (the submission
  format picker — the exact one shown broken earlier this session)
- `modules/jobs/components/JobsPageContent.tsx` (company filter)
- `modules/payment-proofs/components/PaymentsPageContent.tsx`
  ("What is this payment for?")
- `modules/profile/components/EditProfileDetailsDialog.tsx`
- `modules/teaching/components/ClassSessionAttendancePage.tsx`
  (per-student attendance status picker)

## 2. The fix

**`FilterDropdown`** already has `options: readonly FilterOption[]` in
scope where `SelectValue` is rendered. Give it a render-prop that looks
up the label:

```tsx
<SelectValue>
  {(v: string) => options.find((o) => o.value === v)?.label ?? v}
</SelectValue>
```

**Every other file** in §1: same pattern, using whatever local options/
labels array that file already has (or the one you need to introduce if
the labels currently only exist as JSX children on each `SelectItem` —
in that case, extract them into a small `value → label` map next to the
existing option list so both the `SelectItem` children and the
`SelectValue` render-prop read from one source, rather than duplicating
label strings in two places).

**Do not** guess a generic "capitalize the value" fix as the primary
fix — `in-progress` capitalized is `In-progress`, not the actual label
`"In progress"` a human wrote, and `full` capitalized is `Full` (fine
by coincidence) but `foundation` becomes `Foundation` (also fine by
coincidence) while something like `siwes` would become `Siwes` (wrong —
should stay `SIWES`). The label strings that already exist in each
`SelectItem` are correct by construction; use them, don't reconstruct
them from the value.

## 3. CSS backstop (the user's explicit second ask)

Separately from the real fix, add `capitalize` (or the equivalent
Tailwind utility) to the shared trigger text in `components/ui/select.tsx`'s
`SelectTrigger` — a defensive backstop so that IF a future value ever
leaks through unresolved (a new Select added without going through
§2's pattern, a label that's genuinely just an unformatted value), it
still reads as a capitalized word rather than an obviously-broken raw
enum string. This is a safety net, not a substitute for §2 — apply
both.

## 4. "All" as the default value — audit, don't assume

The user's second ask: confirm that everywhere a filter Select has an
"all" (or equivalent unscoped) option, that option is the actual
default/initial value, not something else that happens to render first.
Spot-check every consumer in §1 plus every `FilterDropdown` usage
(`grep -rl "FilterDropdown" modules`) — check the `useState` initial
value or `defaultValue` prop feeding each Select, not just the options
array order. Fix any filter where the default isn't actually the
unscoped/"all" option.

## 5. Acceptance

- [ ] Every file in §1 shows its selected option's real label in the
      closed trigger, not the raw value — verify each one live, in the
      browser, against real data (open each select, pick every option
      in turn, confirm the closed trigger updates to the correct label
      each time — not just the default).
- [ ] `SelectTrigger`'s text has a `capitalize` backstop.
- [ ] Every filter's default value is confirmed to be its "all"/unscoped
      option; any that weren't are fixed and noted in the commit message.
- [ ] `npx tsc --noEmit` / `npx eslint <changed files>` clean.
- [ ] Commit incrementally per the established discipline; verify
      `git status -s` / `git diff --stat` immediately before each commit.
