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
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div
        className={cn(
          "mx-auto flex h-14 w-full items-center justify-between gap-3 px-4",
          CONTENT_MAX_WIDTH
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          <SidebarTrigger className="-ml-1" />

          {/* Logo only on mobile — the side rail owns the brand mark.
              Dropped entirely once a dual-role switcher is also
              competing for this row's space: sidebar-trigger + the
              switcher's own icons already say "this is the app," and
              opening the rail shows the full lockup anyway. */}
          {!canSwitch && (
            <Link
              href="/dashboard"
              className="flex shrink-0 items-center md:hidden"
              aria-label="SmartHub"
            >
              <Logo size="sm" />
            </Link>
          )}

          <SearchTrigger />
        </div>

        {/* Lives in the header, not the sidebar — a dual-role user
            switches often enough that it belongs beside search, and
            keeping it out of the rail keeps the rail from growing a
            second header row above the nav. */}
        {canSwitch && (
          <div className="w-20 shrink-0 sm:w-44">
            <RoleSwitcher variant="expanded" />
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <NotificationBell />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
