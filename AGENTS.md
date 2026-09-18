<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# SmartHub Core LMS

The original 28-module port plus Self-Paced Learning is done and fully
shipped — the codebase itself, not a plan doc, is the record of it now.

**Design-system modernization is the active track. Read
`plans/DESIGN-SYSTEM.md` first** for anything involving nav/chrome, page
layout, shared UI primitives, colors, motion, or auth. As of the editorial
dashboard redesign, that file documents the *current* design language —
masthead-style headers, hero+ledger asymmetric layouts, bento tiles sized
by importance, magazine-index lists — not the earlier "restyle every
page's cards" rollout, which it superseded. It covers the shared-primitive
registry, non-negotiables, the NextAuth architecture, and — important if
more than one agent session may be working this repo at once — a real,
previously-hit git-collision hazard and how to avoid it.

## Working rules

- **Work incrementally.** The per-page-plan workflow (`plans/0NN-*.md`)
  that carried the editorial redesign is retired — `plans/DESIGN-SYSTEM.md`
  is now the only file in `plans/`. Don't recreate that workflow for a new
  slice of work unless it's explicitly asked for again.
- **Never assume; confirm scope.** Ask before starting a slice with real
  blast radius, and flag ambiguities.
- **Use shadcn components throughout.** Rebuild every UI primitive/screen
  from the `base-vega` preset (Base UI primitives — `render` prop, not
  `asChild`). Do NOT hand-roll a primitive shadcn already provides, and
  check `plans/DESIGN-SYSTEM.md`'s shared-primitive registry before adding
  a new page-local one.
- **The brand colors are SmartHub's own** — maroon `#430330` (primary),
  orange `#F29913` (accent), restored by ADR 0015 in both light and dark.
  This *reverses* an earlier decision (ADR 0005) that kept the shadcn
  preset's stock colors instead — if you find guidance elsewhere in this
  repo implying the old maroon/orange should be avoided, it's stale;
  ADR 0015 and `plans/DESIGN-SYSTEM.md` are the current word. These are
  the one thing the editorial redesign did NOT change — what moved is
  layout and composition (masthead/ledger/bento/index-list over stacked
  cards), not the palette. See `plans/DESIGN-SYSTEM.md`'s non-negotiables
  for the specific rules (no raw Tailwind colors, solid active-states,
  `Select` for filters, one background per page, motion needs a reason).

## Source of truth for behavior/contracts

The old codebase stays OUTSIDE this repo, read-only, as reference:
`~/Documents/smarthub-projects/smarthub/smarthub-core-lms` (frontend) and
`~/Documents/smarthub-projects/smarthub/smarthub-api` (backend — the
contract source for every endpoint path/payload shape). Use them for API
contracts, module structure, business logic and screens — never copy the
frontend's design tokens or its Radix/Tailwind-v3 components. Verify every
endpoint path against the backend's actual route files before wiring a new
call; several real path/payload mismatches (wrong prefix, wrong field name,
missing required params) were found this way, not by guessing.

## Module pattern

Each domain module owns its `api/` (service + queries + normalise),
`components/`, `config/endpoints.ts`, and `types/` (api.types + index). See
`docs/adr/0003-module-per-domain-structure.md` for the rationale.

## Checks before claiming done

Always run `npm run typecheck` and `npm run lint`, and `npm run build` /
`npm run test` when feasible, with evidence in the output — see
`verification-before-completion`. Don't trust a summary of past work
(yours or another session's) without independently re-running these
yourself first.
