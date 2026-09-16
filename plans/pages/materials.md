# Materials (`/materials`)

Status: ✅ Done — editorial PageHeader rolled out (Plan 016 Slice 6).

## Current state

`modules/learning/components/materials-page-content.tsx` (253) +
`material-preview-dialog.tsx` (225).

## Legacy state

`src/app/(app)/materials/page.tsx` (257, inline) + `MaterialPreviewDialog.tsx`
(222).

## Findings

This is the cleanest port of the three learning surfaces — near line-for-line
structural parity (same file-type icon map, same All/Files/Guides filter,
same course-grouped list, same preview-vs-download split, same
instructions-only expand/collapse for guide-type materials). Current even
improved on legacy by using the shared `Tabs`/`Button` primitives instead of
legacy's raw `<button>` filter chips.

Real gaps:
1. No `PageHeader`/`EmptyState` adoption — hand-rolled header
   (`materials-page-content.tsx:72-77`) and empty-state card (lines 100-110).
   Same gap existed in legacy, so not a regression — just an opportunity,
   lower priority than surfaces where it's an actual behavior loss.
2. Same missing search/filter inside `module-section.tsx`'s per-module
   materials list as Recordings has (legacy `module-section.tsx:244-272`,
   `placeholder="Search materials…"`).
3. No raw Tailwind color violations found.
4. No dead links or TODOs found.

## Design direction

Small, low-risk pass: adopt `PageHeader`/`EmptyState`, nothing else unless
the Recordings fix for `module-section.tsx`'s search naturally covers
Materials too (it's the same shared file).

## Acceptance criteria

- [ ] `PageHeader` replaces the hand-rolled header.
- [ ] `EmptyState` replaces the hand-rolled empty-state card.
- [ ] If `module-section.tsx` gets search/filter added for Recordings, confirm
      it also serves Materials correctly (shared component).
- [ ] `npx tsc --noEmit` and `npx eslint` clean.
