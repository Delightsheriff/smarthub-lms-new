"use client";
import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Logo } from "@/components/layout/logo";
import { RoleSwitcher } from "@/components/layout/role-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { SearchTrigger } from "@/components/layout/search-trigger";
import { NotificationBell } from "@/modules/notifications/components/NotificationBell";
import { useAuthStore } from "@/store/slices/authStore";
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
  const user = useAuthStore((s) => s.user);
  const { canSwitch } = useEffectiveMode();

  const firstName =
    user?.firstName || user?.email?.split("@")[0] || "there";

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

          {/* Logo only on mobile — the side rail owns the brand mark. */}
          <Link
            href="/dashboard"
            className="flex shrink-0 items-center md:hidden"
            aria-label="SmartHub"
          >
            <Logo size="sm" />
          </Link>

          <p className="hidden truncate text-sm text-muted-foreground lg:block">
            Hey {firstName} 👋
          </p>

          <SearchTrigger />
        </div>

        {/* Mobile-only role switcher — the rail's is desktop-only. */}
        {canSwitch && (
          <div className="max-w-50 flex-1 md:hidden">
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
