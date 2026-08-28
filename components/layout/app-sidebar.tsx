"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

/**
 * Desktop application rail, built on shadcn's `Sidebar` primitives.
 * Full nav (logo header, role switcher, mode-scoped menu with inbox
 * badge) lands in Plan 003 commit 3 — this is the mounted scaffold so
 * the `(app)` shell can own the `SidebarProvider` + `SidebarInset`.
 */
export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" side="left">
      <SidebarHeader>{/* brand + role switcher in commit 3 */}</SidebarHeader>
      <SidebarContent>{/* nav groups in commit 3 */}</SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
