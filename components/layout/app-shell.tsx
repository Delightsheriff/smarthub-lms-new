"use client";
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
import { ProfilePhotoGate } from "@/modules/profile/components/ProfilePhotoGate";
import { PaymentGate } from "@/modules/payment-proofs/components/PaymentGate";
import { PaymentStatusBanner } from "@/modules/payment-proofs/components/PaymentStatusBanner";
import { useAuthStore } from "@/store/slices/authStore";
import { useSidebarStore } from "@/store/slices/sidebarStore";
import { CONTENT_MAX_WIDTH } from "@/configs/brand";
import { cn } from "@/lib/utils";

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
import { redirect, usePathname } from "next/navigation";

import { InstallAppPrompt } from "@/modules/push/components/InstallAppPrompt";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const collapsed = useSidebarStore((s) => s.collapsed);
  const setCollapsed = useSidebarStore((s) => s.setCollapsed);

  if (!isAuthenticated) {
    const nextUrl = pathname && pathname !== "/dashboard" ? `/login?next=${encodeURIComponent(pathname)}` : "/login";
    redirect(nextUrl);
  }

  return (
    <SidebarProvider
      open={!collapsed}
      onOpenChange={(open) => setCollapsed(!open)}
    >
      <ProfilePhotoGate />
      <AppSidebar />
      <SidebarInset>
        <TopBar />
        {/* Late-payment nudge while access is still open. Silent
            otherwise, and replaced by the paywall once access is
            actually paused — a banner on top of a paywall is just
            shouting. */}
        <PaymentStatusBanner />
        <main
          className={cn(
            "mx-auto w-full flex-1 px-4 py-6",
            CONTENT_MAX_WIDTH
          )}
        >
          {/* Server-side 402s are the authority; this gives a
              suspended learner one clear screen instead of the
              dashboard of failed requests. */}
          <PaymentGate>{children}</PaymentGate>
        </main>
      </SidebarInset>
      <BottomNav />
      <MessageToastListener />
      <CommandPaletteListener />
      <InstallAppPrompt />
    </SidebarProvider>
  );
}
