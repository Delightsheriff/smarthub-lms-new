# PLAN 026 — Component testing infrastructure + StatusBadge/SegmentedControl tests

No single route — infrastructure + two component test files. Read
`plans/000-index.md` first (ground rules, shared).

## Current state (read in full)

`vitest` is already set up (`npm run test` = `vitest run`) but
deliberately scoped to pure logic: `vitest.config.ts` sets
`environment: "node"` with a comment explaining there's no jsdom
because "nothing here touches the DOM." `tests/lib/utils.test.ts`
(this session) covers the new pure functions (`pluralize`,
`getInitial`, `daysUntil`, `resolveStatus`) under that same node
environment — that part's done.

`StatusBadge` (`components/ui/status-badge.tsx`) and `SegmentedControl`
(`components/ui/segmented-control.tsx`) are components, not pure
functions — testing them means rendering to a virtual DOM, which the
current config can't do at all.

## Direction

1. **Add `@testing-library/react` and a DOM environment** (`jsdom` or
   `happy-dom` — either is fine, `happy-dom` is lighter and vitest
   supports it natively via `environment: "happy-dom"`). Don't change
   the *existing* `environment: "node"` for the current 24 test files
   — either scope the new environment per-file via a `// @vitest-
   environment happy-dom` comment at the top of the two new test
   files, or split into a second vitest project/config so the pure-
   logic suite keeps its fast node environment. Check `vitest`'s
   current major version's recommended pattern for this (workspace
   config vs. per-file environment comment) rather than assuming.
2. **`tests/ui/status-badge.test.tsx`** — render `<StatusBadge
   status="graded" />` and assert the resolved label text and that it
   picked the right `Badge` variant (via a class/data attribute, not a
   snapshot). Cover: a known status, an unknown status (falls back to
   neutral + raw string), and the `label` override prop bypassing the
   registry's own label while keeping its tone.
3. **`tests/ui/segmented-control.test.tsx`** — render with two items,
   assert the active item has `aria-selected="true"`, click the
   inactive item and assert `onChange` fires with its value and
   `aria-selected` flips. Also test `hideLabelsBelowSm`: with it on,
   the label text should carry the `hidden sm:inline`-class span (or
   just assert the label is still in the accessible tree — the class
   itself isn't behavior worth pinning too tightly to).
4. Add `"test:watch": "vitest"` to `package.json` scripts if it's not
   already there — the existing `"test": "vitest run"` is CI-shaped,
   but there's a real interactive-development gap if there's no watch
   script.

## Acceptance

(Plus the shared checklist in `plans/000-index.md`.)

- [ ] `npm run test` still passes for all 24+ existing node-environment
      test files — the new jsdom/happy-dom environment must not slow
      down or break the pure-logic suite.
- [ ] The two new component test files actually fail if you
      temporarily break the component (e.g. comment out the tone
      resolution) — a test that passes unconditionally isn't testing
      anything.
- [ ] `npm run typecheck` / `npm run lint` clean.
