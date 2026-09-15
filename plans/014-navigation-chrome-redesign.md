# PLAN 014 — Navigation Chrome Redesign (Design System v2, Slice 1)

**Status:** Built — pending a live browser walkthrough to sign off
**Owner:** SmartHub design-system modernization (parallel track to the
porting plans; not part of the 001–012 sequence)
**Depends on:** ADR 0015 (brand colors restored) — this slice is the
first place those colors do real visual work, not just token values.

---

## 1. Goal

Restyle the app shell's navigation chrome — desktop sidebar, top bar,
mobile bottom nav, role switcher — into a bold, professional, modern
visual language built on `better-ui` and `emil-design-eng` principles,
while keeping every existing role/mode data seam (`configs/nav.ts`,
`useEffectiveMode`, `roleModeStore`) unchanged. This is the proving
ground for the design primitives (solid active-state fill, grouped
sections, segmented sliding indicators, motion rules) that later
page-by-page slices (starting with Settings) will reuse.

## 2. Scope

### In scope
- `configs/nav.ts`: add optional `group` metadata to `NavItem`; group
  student/instructor nav items into named sections (mirrors the
  inspiration CRM's sidebar grouping).
- `components/ui/sidebar.tsx`: the shared `sidebarMenuButtonVariants`
  active-state treatment — solid `bg-sidebar-primary` fill with
  `sidebar-primary-foreground` text, replacing the current
  `bg-sidebar-primary/15` tint. This is a shared primitive change, so
  every consumer picks it up consistently.
- `AppSidebar`: render grouped sections with `SidebarGroupLabel`
  (hidden in collapsed/icon mode per shadcn's own
  `group-data-[collapsible=icon]:hidden` pattern); add a footer
  identity card (avatar + name + mode) above the rail's bottom edge.
- `RoleSwitcher` (expanded variant): sliding solid-fill segmented
  control instead of a bordered dropdown button.
- `BottomNav`: solid active-state treatment (parity with the desktop
  rail) + scale-press feedback on tap.
- `TopBar`: visual polish pass — restyled search trigger (shows `⌘K`
  inline), tightened spacing, notification badge entrance animation.
- Collapsed-rail tooltips: instant-on-subsequent-hover within one
  hover session (`emil-design-eng` rule), first tooltip keeps its
  normal delay.
- Motion tokens added to `app/globals.css` for this slice's own use
  (durations/easings), not a full app-wide motion-token migration.

### Out of scope (explicitly deferred)
- Per-page segmented header tabs (e.g. Courses "All · In Progress ·
  Completed") — that's page-by-page work once we reach each page's own
  slice, not a chrome concern.
- The full profile "entity drawer" (the CRM's reusable
  avatar/stat-grid/list panel) — the sidebar footer card and header
  avatar open the *existing* `UserMenu` dropdown for now. The drawer
  itself is scoped to the Settings/Profile redesign slice, where it's
  actually needed end-to-end.
- Notification bell dropdown/feed redesign (only the unread-badge
  *entrance* animation is in scope here).
- Command palette (`CommandPalette`) internal redesign.
- Any change to `useEffectiveMode`, `roleModeStore`, or
  `getNavItemsForMode`'s branching logic — data/role seam is frozen.

## 3. Source reference

Inspiration: `https://sales-crm-kargulstudio.vercel.app` (grouped
sidebar sections with uppercase micro-labels, dense compound rows,
reusable entity-drawer pattern — walked interactively; see chat
history for the full breakdown). No legacy-codebase reference here —
`smarthub-core-lms` never had this visual language; this is a fresh
direction, not a port.

## 4. Target files / structure

```
configs/nav.ts                        # + group metadata
components/ui/sidebar.tsx             # sidebarMenuButtonVariants active state
components/layout/app-sidebar.tsx     # grouped rendering + footer card
components/layout/role-switcher.tsx   # sliding segmented control
components/layout/bottom-nav.tsx      # solid active state + scale-press
components/layout/top-bar.tsx         # search restyle, spacing, badge motion
app/globals.css                       # motion tokens (durations/easings)
```

## 5. shadcn components used (already installed, no new adds)

`sidebar` (`SidebarGroup`, `SidebarGroupLabel`, `SidebarGroupContent`,
`SidebarFooter`), `tabs` (Base UI — reference for the clip-path
segmented-indicator pattern used in `RoleSwitcher`), `badge`,
`dropdown-menu`, `avatar`, `tooltip`. Verified against current
ui.shadcn.com docs before implementation (Base UI-backed, `render`
prop not `asChild` — matches this repo's existing convention).

## 6. Steps

1. `configs/nav.ts` — add `group?: string` to `NavItem`; assign groups
   to `STUDENT_MODE_ITEMS` (LEARNING) and `INSTRUCTOR_MODE_ITEMS`
   (TEACHING); keep `COMMON_NAV_ITEMS`/`INTERN_NAV_ITEMS` as their own
   groups (footer / INTERNSHIP).
2. `app/globals.css` — add this slice's motion custom properties
   (`--ease-out-strong`, `--ease-drawer`, durations) per
   `emil-design-eng`.
3. `components/ui/sidebar.tsx` — flip `data-active:` classes on
   `sidebarMenuButtonVariants` to solid fill.
4. `AppSidebar` — group-aware rendering (`SidebarGroupLabel` per
   group, hidden when collapsed), footer identity card.
5. `RoleSwitcher` — sliding segmented control (expanded variant only;
   collapsed variant's two icon buttons already read fine solid).
6. `BottomNav` — solid active circle + `active:scale-[0.96]`.
7. `TopBar` — search trigger restyle, spacing tighten, notification
   badge entrance animation.
8. Verify in both themes, both roles (student/instructor), dual-role
   switch, collapsed rail, mobile width.

## 6.5 Architecture brief

1. **Deepen** — the real complexity here is *consistency*: one active-
   state definition (`sidebarMenuButtonVariants`) driving every nav
   surface, rather than each component reinventing its own "active"
   look. Fixing it at the shared-variant level is the deep-module move.
2. **Seams** — none new; this slice deliberately rides the existing
   `getNavItemsForMode`/`useEffectiveMode` seam rather than touching it.
3. **Testability** — nav grouping is pure data (`configs/nav.ts`);
   add a unit test asserting every mode's items carry a `group` and
   the group order is stable.
4. **ADR** — record the grouped-nav + solid-active-state decision once
   built (extends ADR 0007, doesn't reverse it).

## 7. Acceptance checks

- [x] `npm run typecheck` passes (repo-wide, aside from the concurrent
      self-paced session's own in-progress files, not part of this slice)
- [x] `npm run lint` passes for every file this slice touched
- [x] `npm run test` — 106/106 passing, incl. 8 new nav-grouping tests
- [x] Sidebar renders grouped sections (data-driven via `configs/nav.ts`
      + `groupNavItems`); collapse-to-icons hides labels via shadcn's
      own `group-data-[collapsible=icon]` pattern
- [x] Active nav item is a solid maroon fill (`sidebarMenuButtonVariants`
      + `BottomNav`'s own classes) — one shared definition on the rail
- [x] Role switcher shows a sliding solid indicator (Motion `layoutId`,
      spring duration 0.3 bounce 0), reduced-motion respected
- [x] Collapsed-rail tooltips grouped under one `TooltipProvider`
      (500ms first delay, Base UI's 400ms instant-reopen window)
- [x] Mobile bottom nav active state matches desktop treatment
      (solid fill + scale-press), "More" tab distinguishes persistent
      vs. transient state
- [ ] **Live walkthrough in the browser, both themes, both roles —
      pending a fresh login** (session doesn't persist across reloads;
      credential entry is the user's step, not mine — see chat)

## 8. Open questions / to confirm

- Sidebar footer identity card: confirmed to open the existing
  `UserMenu` dropdown for now (not a new drawer) — revisit once the
  Settings/Profile slice builds the real entity drawer.
