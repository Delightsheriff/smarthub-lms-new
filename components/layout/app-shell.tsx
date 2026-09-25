"use client";
import type { ReactNode } from "react";
import { useSession } from "next-auth/react";
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
import { BirthdayGate } from "@/modules/profile/components/BirthdayGate";
import { PaymentGate } from "@/modules/payment-proofs/components/PaymentGate";
import { PaymentStatusBanner } from "@/modules/payment-proofs/components/PaymentStatusBanner";
import { useSidebarStore } from "@/store/slices/sidebarStore";
import { CONTENT_MAX_WIDTH } from "@/configs/brand";
import { cn } from "@/lib/utils";

/**
 * The `(app)` LMS shell.
 *
 * Owns the **gate**: redirects to `/login` once NextAuth's session is
 * *confirmed* absent (`status === "unauthenticated"`), exactly like a
 * middleware would for the protected region (the legacy used
 * `middleware.ts`; we gate in the layout shell instead — see ADR 0006 /
 * ADR 0007). Checking `status` rather than the Zustand `isAuthenticated`
 * flag directly matters: the root layout passes NextAuth's server-
 * fetched session into `SessionProvider`, so `status` is correct from
 * the first render — but the flag is populated by `AuthSessionBridge`
 * a tick later via `useEffect`, and gating on it directly would flash
 * every already-authenticated page load to /login before that effect
 * runs (this was the "logs out on every reload" bug).
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
import { redirect, usePathname, useSearchParams } from "next/navigation";
import { useMe } from "@/modules/auth/api/auth.queries";
import { InstallAppPrompt } from "@/modules/push/components/InstallAppPrompt";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { status } = useSession();
  useMe();
  const collapsed = useSidebarStore((s) => s.collapsed);
  const setCollapsed = useSidebarStore((s) => s.setCollapsed);

  if (status === "unauthenticated") {
    const search = searchParams?.toString();
    const fullPath = search ? `${pathname}?${search}` : pathname;
    const nextUrl = fullPath && fullPath !== "/dashboard" ? `/login?next=${encodeURIComponent(fullPath)}` : "/login";
    redirect(nextUrl);
  }

  return (
    <SidebarProvider
      open={!collapsed}
      onOpenChange={(open) => setCollapsed(!open)}
    >
      <ProfilePhotoGate />
      {/* Teaching staff only — self-gates to null for students. */}
      <BirthdayGate />
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
            // Extra bottom padding below md: BottomNav is `fixed`, so
            // it doesn't push content up the way static chrome would —
            // without this, a page's last bit of content renders right
            // under the nav bar instead of above it.
            "w-full flex-1 px-4 sm:px-6 lg:px-8 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-6 md:pb-6",
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
