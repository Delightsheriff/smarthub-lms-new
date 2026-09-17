# PLAN 011 — Oreo AI Assistant

Route: `/oreo` · File: `modules/oreo/components/OreoPageContent.tsx`
Read `plans/000-index.md` first (ground rules + acceptance, shared).

## Current state (read in full)

Masthead applied, with the usage-quota data already flowing into the
description line (`<strong>{n}</strong> tokens available`) — good.
Directly below the masthead is a **second, separate** `bg-muted/40`
strip repeating usage info (tokens used/remaining) plus a static "LMS
Grounded" label. Empty-state suggestions render as a centered,
wrapped row of pill `Button`s. Assistant turns' "How I got this" panel
is a `Collapsible` with a `bg-muted/40` box of tool-step JSON.

## Direction

A chat interface — hero+ledger doesn't apply, and the bubble UI is
correct, not broken. Real changes:

1. **Remove the duplicate usage strip.** The masthead's description
   already carries the live token count; the second `bg-muted/40` box
   directly under it says the same thing twice. Fold anything from
   that strip actually worth keeping (e.g. "LMS Grounded") into the
   masthead's `actions` slot or drop it if it's not load-bearing.
2. **Suggestion chips → a small numbered list** matching `IndexList`'s
   row language (numbered, hairline-divided) instead of a wrapped row
   of pill buttons — reusing that visual vocabulary here is a real
   cross-surface win, not decoration, since it's the exact same "pick
   one of these" interaction as browsing an index.
3. **"How I got this" → `Ledger`-style hairline rows** (mono tool-name
   labels, one row per step) instead of a generic `bg-muted/40` JSON
   box.
4. Bubble UI, markdown rendering, and the input form stay as they are
   — correct chat UX, not part of this plan.

## Acceptance

(Plus the shared checklist in `plans/000-index.md`.)

- [ ] Only one usage-quota display remains (in the masthead), not two.
- [ ] Empty-state suggestions render as a numbered, hairline-divided
      list, not wrapped pill buttons.
- [ ] "How I got this" uses the hairline/mono-label aesthetic, not a
      generic muted box.
- [ ] Chat bubble behavior (sending, streaming/pending state,
      scrolling) unchanged and verified working after the edit.
