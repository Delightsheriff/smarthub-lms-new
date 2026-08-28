# PLAN 000 — Plan Template

> Every slice of the port gets one plan file, numbered (`001`, `002`, …).
> Copy this template, fill it out, and get it **confirmed** before executing.

**Status:** Draft / Confirmed / In progress / Done
**Owner:** SmartHub port
**Depends on:** `<plan numbers>`

---

## 1. Goal

> What this slice delivers, in one or two sentences.

## 2. Scope

### In scope
- Bulleted list of what we actually build.

### Out of scope (explicitly deferred)
- Bulleted list of what we deliberately do NOT do here (so nobody "helps").

## 3. Source reference

> Which part(s) of `smarthub-core-lms` this port pulls behavior/contracts from.
> Paths under `~/Documents/smarthub/smarthub-core-lms/src/...`.

## 4. Target files / structure

> Files and folders created in this repo, plus the module shape
> (api/service + queries + normalise + config/endpoints + types + components).

## 5. shadcn components to use (via MCP)

> The exact base-vega components this slice pulls from the registry, e.g.
> `button`, `card`, `dialog`, `tabs`, `input`, `label`.

## 6. Steps

1. Install deps...
2. Port ... 
3. Build components...
4. Wire pages/routes...

## 6.5 Architecture brief (see `ARCHITECTURE.md`)

1. **Deepen** — deletion-test the source module; where is the real complexity?
2. **Seams** — any adapter to slot? (one → note, don't abstract; two → introduce the seam)
3. **Testability** — the interface design that makes it testable through the seam; what new tests the slice ships.
4. **ADR** — does a decision crystallize here worth recording in `docs/adr/`?

## 7. Acceptance checks

> How we prove this is done and "verified before completion":
> - [ ] `npm run typecheck` passes
> - [ ] `npm run lint` passes
> - [ ] relevant screens render in `npm run dev`
> - [ ] behaviors X, Y, Z work

## 8. Open questions / to confirm

> Anything ambiguous for the user to decide before/during execution.
