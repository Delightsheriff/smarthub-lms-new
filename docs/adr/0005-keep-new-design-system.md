# ADR 0005 — Keep the new `base-vega` design system

- **Status:** Accepted
- **Date:** 2026-08 (port kickoff)

## Context

The old SmartHub app uses a maroon (`#430330`) / orange (`#F29913`)
identity and hand-rolled Radix/Tailwind-v3 components. The new repo
ships already configured with the shadcn **`base-vega`** preset — a
magenta-primary token set in `app/globals.css` — and the port's ethos is
"rebuild every primitive on the new stack, never copy the old design".

## Decision

The `base-vega` tokens in `app/globals.css` are the design language.
We do **not** re-import the old maroon/orange theme or its
Tailwind-v3/Radix components. All UI is rebuilt from shadcn primitives
(via the shadcn MCP) against the new tokens. `configs/brand.ts` carries
only meta-tag values derived from the new `--primary`, never the old
brand palette.

## Consequences

- **Positive:** single modern design language; no legacy theme to
  maintain; observability of what changed versus the old app.
- **Positive:** maroon/orange usage is a red flag in review.
- **Negative:** the new look differs from the old product; treated as
  an intended refresh, explicitly requested.
