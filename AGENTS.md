<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# SmartHub Core LMS

Two initiatives have run in this repo. Read the one that matches your task
**first** — each is its own master context:

- **The porting project is done** (Plans 001–013 — the original 28-module
  port plus Self-Paced Learning). `plans/PORTING.md` is its master context;
  read it if you're touching a still-open porting detail or need the
  original module-shape rationale.
- **Design-system modernization & auth is the active track.**
  **Read `plans/DESIGN-SYSTEM.md` first** for anything involving nav/chrome,
  page restyling, shared UI primitives, colors, motion, or auth. It covers
  the design skills in use, the shared-primitive registry, non-negotiables,
  the NextAuth architecture, and — important if more than one agent session
  may be working this repo at once — a real, previously-hit git-collision
  hazard and how to avoid it.

## Working rules (both tracks)

- **Work incrementally.** A cross-cutting slice (new nav chrome, an auth
  swap) gets its own `plans/0NN-*.md`, confirmed by the user before code. A
  small single-page pass doesn't need one — check `plans/DESIGN-SYSTEM.md`
  §6 for the next free plan number before creating a file.
- **Never assume; confirm scope.** Ask before starting a slice with real
  blast radius, and flag ambiguities.
- **Use shadcn components throughout.** Rebuild every UI primitive/screen
  from the `base-vega` preset (Base UI primitives — `render` prop, not
  `asChild`). Do NOT hand-roll a primitive shadcn already provides, and
  check `plans/DESIGN-SYSTEM.md` §3 for a shared primitive before adding a
  new page-local one.
- **The brand colors are SmartHub's own** — maroon `#430330` (primary),
  orange `#F29913` (accent), restored by ADR 0015 in both light and dark.
  This *reverses* an earlier decision (ADR 0005) that kept the shadcn
  preset's stock colors instead — if you find guidance elsewhere in this
  repo implying the old maroon/orange should be avoided, it's stale;
  ADR 0015 and `plans/DESIGN-SYSTEM.md` are the current word. What's still
  fair game to modernize is everything *around* the colors: radius,
  elevation, motion, layout, shared components — see `plans/DESIGN-SYSTEM.md`
  §4 for the specific rules (no raw Tailwind colors, solid active-states,
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
`plans/PORTING.md` §4.

## Checks before claiming done

Always run `npm run typecheck` and `npm run lint`, and `npm run build` /
`npm run test` when feasible, with evidence in the output — see
`verification-before-completion`. Don't trust a summary of past work
(yours or another session's) without independently re-running these
yourself first.
