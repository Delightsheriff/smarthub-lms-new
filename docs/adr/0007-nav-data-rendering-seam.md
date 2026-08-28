# ADR 0007 — Nav data / nav rendering seam

- **Status:** Accepted
- **Date:** 2026-08 (Plan 003)

## Context

The shell renders the same navigation in two places — the desktop side
rail and the mobile bottom nav + "More" sheet — and a third view (the
future command palette) will consume it too. In the legacy codebase the
nav items were data embedded in the render components, so each chrome
element had to duplicate role/eligibility logic, and adding an item meant
touching every component.

## Decision

Split nav into a **pure data layer** and a **pure rendering layer**:

1. **Nav data lives in `configs/nav.ts`** — `NavItem` + the pure functions
   `getNavItemsForMode(mode, user)` and `getPinnedNavItems(mode)`. These own
   every rule: which items exist per mode (student vs instructor), the
   cross-mode `COMMON_NAV_ITEMS`, the `intern`-role items, the
   `referralEligible` gate, and the 4 pinned bottom-bar items per mode.

2. **Render components are dumb consumers.** `AppSidebar` and `BottomNav`
   call these functions and only *arrange* the returned items — active
   state, badges, tooltips, collapse. Adding a menu item is a one-line
   change in `configs/nav.ts`, never a render-component edit.

3. **Mode and user are read once** via `useEffectiveMode()` +
   `useAuthStore`, and passed down to the pure functions — no render
   component re-derives eligibility on its own.

4. **Collapse state is owned by `sidebarStore`** (persisted), and the
   shadcn `SidebarProvider` is **controlled** (`open`/`onOpenChange`
   bound to `collapsed`). The legacy `uiStore.sideNavCollapsed`
   duplicate was removed — a single source of truth for the rail.

5. **Auth gating stays in the shell** (`AppShell`, `redirect("/login")`)
   — see ADR 0006. Nav data never assumes a user is signed in; components
   guard at the shell boundary.

## Consequences

- **Positive:** `configs/nav.ts` is pure and deterministic — the ideal
  unit-test surface. When the Vitest harness lands (Plan 005) the
  composition rules (per mode / roles / referral eligibility) are tested
  in isolation with no React.
- **Positive:** one definition of an item; rail, bottom nav, and the
  future command palette stay in lockstep automatically.
- **Positive:** reversible/reorderable nav is a data change, not a
  component change.
- **Negative:** an extra indirection vs. inline arrays — worth it because
  three render surfaces share the same rules.
