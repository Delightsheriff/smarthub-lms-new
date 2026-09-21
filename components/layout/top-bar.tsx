"use client";
import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Logo } from "@/components/layout/logo";
import { RoleSwitcher } from "@/components/layout/role-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { SearchTrigger } from "@/components/layout/search-trigger";
import { NotificationBell } from "@/modules/notifications/components/NotificationBell";
import { useEffectiveMode } from "@/hooks/use-effective-mode";
import { CONTENT_MAX_WIDTH } from "@/configs/brand";
import { cn } from "@/lib/utils";

/**
 * Sticky top chrome, rendered inside `SidebarInset`. The inner row is
 * centered on the same `CONTENT_MAX_WIDTH` container as the page
 * content, so the logo + actions sit on the same vertical edges as the
 * content column.
 *
 * The search trigger opens the global command palette (`uiStore.searchOpen`,
 * ⌘K). The bell is a mount-only trigger; its dropdown + feed land with
 * the notifications plan.
 */
export function TopBar() {
  const { canSwitch } = useEffectiveMode();

  return (
    <header className="glass-scroll-edge glass-regular sticky top-0 z-30">
      <div
        className={cn(
          "flex h-14 w-full items-center justify-between gap-2 sm:gap-4 px-4 sm:px-6 lg:px-8",
          CONTENT_MAX_WIDTH
        )}
      >
        {/* Left: Sidebar trigger, mobile logo, search */}
        <div className="flex flex-1 items-center gap-2 sm:gap-3 min-w-0">
          <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors" />

          {/* Logo only on mobile — the side rail owns the brand mark. */}
          {!canSwitch && (
            <Link
              href="/dashboard"
              className="flex shrink-0 items-center md:hidden"
              aria-label="SmartHub"
            >
              <Logo size="sm" />
            </Link>
          )}

          <div className="hidden sm:block h-4 w-px bg-border/60 shrink-0" aria-hidden />

          <SearchTrigger />
        </div>

        {/* Center: Workspace Role Switcher (Anchored in the exact horizontal center via balanced flex-1 sides) */}
        {canSwitch && (
          <div className="flex shrink-0 items-center justify-center px-1 sm:px-2">
            <RoleSwitcher variant="expanded" />
          </div>
        )}

        {/* Right: Actions Cluster (Theme, Notifications, Profile) */}
        <div className="flex flex-1 items-center justify-end gap-1.5 sm:gap-2">
          <div className="flex items-center gap-0.5 sm:gap-1 rounded-full border border-border/60 bg-muted/25 p-0.5">
            <ThemeToggle />
            <NotificationBell />
          </div>

          <div className="h-4 w-px bg-border/60 mx-0.5 sm:mx-1 shrink-0" aria-hidden />

          <UserMenu />
        </div>
      </div>
    </header>
  );
}
