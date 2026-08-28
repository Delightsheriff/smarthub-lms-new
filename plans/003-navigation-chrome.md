# PLAN 003 — Navigation Chrome (Sidebar / Mobile Menu / Top Bar)

**Status:** Draft (awaiting confirmation)
**Owner:** SmartHub port
**Depends on:** 001, 002

---

## 1. Goal

Recreate the app's navigation layer on the **new** shadcn `base-vega` system:
a desktop side rail, a top bar, and a mobile bottom nav / drawer menu — all
driven by the mode-aware nav config from `configs/nav.ts` and the Zustand
stores. **UI-first:** roles/mode come from the **mock-seeded** session
(`authStore` seeded with a dual-role student+instructor user), so the role
switcher and both navs render meaningfully without a backend.

## 2. Scope

### In scope

- Mobile-first layout: bottom nav pinned on phones; side rail on `md:` up.
- `SideRail` — desktop rail, collapsible to icon-only (via `sidebarStore`),
  renders items from `getNavItemsForMode(mode, user)`.
- `TopBar` — title / page context, search trigger, notification bell,
  theme toggle, user menu, role switcher (student/instructor for dual-role).
- `BottomNav` — pinned mobile items from `getPinnedNavItems(mode)` + "More"
  drawer for the rest.
- `role-switcher`, `user-menu`, `theme-toggle`, `logo`.
- `MessageToastListener` + `CommandPaletteListener` mounts (palette dialog
  itself in a later plan).
- Uses the new design system tokens / base-vega components throughout.

### Out of scope (explicitly deferred)

- The ⌘K command palette contents/search wiring (later plan).
- Notification bell feed logic (later plan — this plan mounts the trigger).
- **Real auth — final plan (Auth/API swap).** Chrome reads roles/mode from the
  mock-seeded session / existing stores.
- Specific page content.

## 3. Source reference

- `smarthub-core-lms/src/components/layout/{side-rail,top-bar,bottom-nav,logo,user-menu,theme-toggle,role-switcher,message-toast-listener,command-palette-listener}.tsx`
- `smarthub-core-lms/src/configs/nav.ts`
- `smarthub-core-lms/src/store/slices/{sidebarStore,roleModeStore,uiStore}.ts`

## 3.5 Mock/type input (Foundation) it consumes

- `authStore` seeded from `mockDatabase` users (`AuthUser`: roles, `lmsRole`
  = student|instructor|both, `referralEligible`, `isITStudent`).
- `configs/nav.ts` mode/role filtering driven by those fields — no backend.

## 4. Target files / structure

```
components/layout/
  side-rail.tsx
  top-bar.tsx
  bottom-nav.tsx
  logo.tsx
  user-menu.tsx
  theme-toggle.tsx
  role-switcher.tsx
  message-toast-listener.tsx
  command-palette-listener.tsx
```

## 5. shadcn components to use (via MCP)

- `button`, `sheet` (mobile "More" drawer / rail), `dropdown-menu`,
  `avatar`, `separator`, `tooltip`, `badge` (notification dot),
  `collapsible`/`navigation-menu` if needed for rail sections.

## 6. Steps

1. Port nav config + stores (already foundation) — confirm shape.
2. Build `SideRail` (desktop) — collapse, active state, mode items.
3. Build `BottomNav` + mobile sheet drawer.
4. Build `TopBar` (search trigger, bell, theme, user menu, role switcher).
5. Mount all in the `(app)` shell from Plan 002.
6. Wire `useEffectiveMode` / `useCurrentUser` reads.

## 7. Acceptance checks

## 6.5 Architecture brief (see `ARCHITECTURE.md`)

1. **Deepen** — `nav.ts` is pure **data**; components are **rendering**. This
   is a genuine seam: keep nav config testable in isolation (pure function of
   mode + roles), and rendering decoupled from it. Don't let layout logic leak
   into nav data or vice-versa.
2. **Seams** — `sidebarStore` (persisted collapse) + `uiStore` (search open)
   are small state seams; keep them behind their hooks, not passed as props.
3. **Testability** — `getNavItemsForMode(mode, user)` and
   `getPinnedNavItems(mode)` are pure → unit-test the composition (which items
   appear per mode/roles/referral-eligibility). Rendering is smoke-tested.
4. **ADR** — record the nav-data/nav-rendering separation once stable.

- [ ] Mobile shows bottom nav; desktop shows side rail (responsive)
- [ ] Dual-role users can switch student/instructor via role switcher
- [ ] Nav collapses to icon-only on desktop
- [ ] "More" drawer shows overflow items on mobile
- [ ] `npm run typecheck` / `npm run lint` pass

## 8. Open questions / to confirm

- Confirm desktop side rail semantics: always-visible + collapsible, vs auto
  hide? (mirroring source's SideRail.)
- Which routes should pin to the mobile bottom bar (source pinned 4)? Confirm.
