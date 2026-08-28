"use client";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { MessageToastListener } from "@/components/layout/message-toast-listener";
import { CommandPaletteListener } from "@/components/layout/command-palette-listener";
import { useAuthStore } from "@/store/slices/authStore";
import { useSidebarStore } from "@/store/slices/sidebarStore";

/**
 * The `(app)` LMS shell.
 *
 * Owns the **gate**: redirects to `/login` when `isAuthenticated` is not
 * set, exactly like a middleware would for the protected region (the
 * legacy used `middleware.ts`; we gate in the layout shell instead — see
 * ADR 0006 / ADR 0007).
 *
 * Then it hosts the navigation chrome:
 * - `SidebarProvider` — **controlled** and bound to the persisted
 *   `sidebarStore.collapsed` flag, so desktop collapse is durable and the
 *   store is the single source of truth (the legacy `uiStore.sideNavCollapsed`
 *   duplicate was removed — see ADR 0007 §4).
 * - Desktop rail (`AppSidebar`) + `SidebarInset` wrapping `TopBar` + the
 *   scrolled page region.
 * - Mobile pinned `BottomNav`.
 * - App-wide socket + keyboard listeners (`MessageToastListener`,
 *   `CommandPaletteListener`).
 */
export function AppShell({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const collapsed = useSidebarStore((s) => s.collapsed);
  const setCollapsed = useSidebarStore((s) => s.setCollapsed);

  if (!isAuthenticated) {
    redirect("/login");
  }

  return (
    <SidebarProvider
      open={!collapsed}
      onOpenChange={(open) => setCollapsed(!open)}
    >
      <AppSidebar />
      <SidebarInset>
        <TopBar />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
          {children}
        </main>
      </SidebarInset>
      <BottomNav />
      <MessageToastListener />
      <CommandPaletteListener />
    </SidebarProvider>
  );
}
