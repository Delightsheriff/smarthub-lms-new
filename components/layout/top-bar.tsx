"use client";
import Link from "next/link";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Logo } from "@/components/layout/logo";
import { RoleSwitcher } from "@/components/layout/role-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { useUiStore } from "@/store/slices/uiStore";
import { useAuthStore } from "@/store/slices/authStore";
import { useEffectiveMode } from "@/hooks/use-effective-mode";

/**
 * Sticky top chrome, rendered inside `SidebarInset`. Greeting on the
 * left, notifications + avatar on the right.
 *
 * The search trigger only opens the global command palette's open flag
 * (`uiStore.searchOpen`) — the palette UI is a deferred plan. The bell
 * is a mount-only trigger; its dropdown + feed land with the
 * notifications plan (both otherwise live in their own modules).
 */
export function TopBar() {
  const user = useAuthStore((s) => s.user);
  const { canSwitch } = useEffectiveMode();
  const setSearchOpen = useUiStore((s) => s.setSearchOpen);

  const firstName =
    user?.firstName || user?.email?.split("@")[0] || "there";

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between gap-3 px-4">
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

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            className="rounded-full"
          >
            <Search className="h-[18px] w-[18px]" />
          </Button>
        </div>

        {/* Mobile-only role switcher — the rail's is desktop-only. */}
        {canSwitch && (
          <div className="max-w-[200px] flex-1 md:hidden">
            <RoleSwitcher variant="expanded" />
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Notifications"
            className="rounded-full"
          >
            <Bell className="h-[18px] w-[18px]" />
          </Button>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
