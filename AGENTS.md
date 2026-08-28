<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# SmartHub Core LMS — Porting Project

We are porting the SmartHub LMS into this repo incrementally. **Read
`plans/PORTING.md` first** — it is the master context (stacks, module shape,
route map, delivery order, conventions).

## Working rules

- **Work incrementally, one plan at a time.** Every slice lives in `plans/`
  (e.g. `001-foundation.md`, `003-navigation-chrome.md`). A plan must be
  **confirmed by the user before any code for that slice is written.**
- **Never assume; confirm scope.** Use the `question` tool / ask before
  starting a slice, and flag ambiguities.
- **Use shadcn components throughout** via the shadcn MCP (configured in
  `opencode.json`). Rebuild every UI primitive/screen from the new
  `base-vega` preset. Do NOT hand-roll primitives shadcn provides.
- **Keep the new design system.** The `base-vega` preset + current
  `app/globals.css` tokens are the design language. Do NOT re-import the old
  repo's maroon/orange theme.

## Source of truth for behavior/contracts

The old codebase stays OUTSIDE this repo, read-only, as reference:
`~/Documents/smarthub/smarthub-core-lms`. Use it for API contracts, module
structure, business logic and screens — never copy its design tokens or its
Radix/Tailwind-v3 components.

## Module pattern (port this, not the old implementation)

Each domain module owns its `api/` (service + queries + normalise),
`components/`, `config/endpoints.ts`, and `types/` (api.types + index). See
`plans/PORTING.md` §4.

## Checks before claiming done

Always run `npm run typecheck` and `npm run lint`, and build if feasible,
with evidence in the output — see `verification-before-completion`.
