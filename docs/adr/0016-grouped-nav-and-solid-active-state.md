# ADR 0016 — Grouped nav sections and a solid active-state fill

- **Status:** Accepted
- **Date:** 2026-09
- **Extends:** [0007 — Nav data / nav rendering seam](0007-nav-data-rendering-seam.md)
  (does not reverse it — the data/rendering split stays intact)

## Context

Plan 014 (navigation chrome redesign) needed the sidebar to read as a
workspace with real hierarchy — grouped sections with section labels,
inspired by dense CRM-style sidebars — instead of one flat list. It
also needed the active-nav-item treatment to be unmistakable (a solid
brand-maroon fill) rather than the original 15%-opacity tint, now that
ADR 0015 restored the real brand colors.

Two implementation questions this ADR settles:

1. Where does "which group does this item belong to" live?
2. Where does the active-state visual definition live, given it's
   consumed by more than one component?

## Decision

**Grouping is data, addable to `NavItem` without touching the render
seam.** `configs/nav.ts`'s `NavItem` gained an optional `group?:
string` field. `getNavItemsForMode` still owns every eligibility rule
exactly as ADR 0007 describes — grouping is metadata riding on the
existing pure-data items, not a new branch of logic. `AppSidebar` still
only *arranges* what it's given: a new pure function,
`groupNavItems` (`lib/nav-grouping.ts`, unit-tested independently of
the component), splits the flat item list into contiguous runs sharing
a `group` value. It is a **run-split, not a group-name merge** — two
separate ungrouped runs (Home/Ask Oreo at the top, the common footer
items at the bottom) stay as two distinct unlabeled sections in their
original positions, rather than collapsing into one bucket. This
matters: a naive "bucket by group name" implementation would silently
reorder the footer items to the top of the list.

**The active-state fill is a shared-primitive change, not a per-
consumer override.** `sidebarMenuButtonVariants` in
`components/ui/sidebar.tsx` — the one variant definition every
`SidebarMenuButton` consumer already goes through — now renders
`data-active` as a solid `bg-sidebar-primary` fill instead of a 15%
tint. `BottomNav` (which doesn't use `SidebarMenuButton` — it's a
plain mobile nav, not built on the sidebar primitive) mirrors the same
solid-fill rule by hand, since it has no shared component to inherit
from; if a third nav surface appears, extracting a shared "nav-active"
style token becomes worth doing.

**Tooltips group under one `TooltipProvider`.** The collapsed rail's
icon tooltips previously rendered with no `Provider` ancestor at all,
so Base UI's un-configured 600ms delay applied independently to every
icon with no "recently open, skip the delay" behavior. Wrapping
`AppSidebar` in one `TooltipProvider` (`delay=500`, Base UI's own
`timeout=400` default) makes a fast pass down the rail feel
continuous — first hover waits, everything shortly after is instant.

## Consequences

- **Positive:** adding a new nav item's group is a one-line change in
  `configs/nav.ts`; the render/grouping logic never needs touching.
- **Positive:** `groupNavItems` is independently unit-tested (`tests/
  nav/grouping.test.ts`) without rendering `AppSidebar`.
- **Positive:** every `SidebarMenuButton` consumer gets the bold active
  state automatically — no risk of one surface being restyled and
  another forgotten.
- **Negative / watch-list:** `BottomNav`'s active-state classes are
  hand-duplicated rather than shared with `sidebarMenuButtonVariants`
  (it isn't built on the same primitive). If a third surface needs the
  same treatment, extract a shared token instead of a third copy.
