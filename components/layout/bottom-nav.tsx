"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { RoleSwitcher } from "@/components/layout/role-switcher";
import { getPinnedNavItems, getNavItemsForMode } from "@/configs/nav";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/slices/authStore";
import { useEffectiveMode } from "@/hooks/use-effective-mode";
import { useInboxUnreadCount } from "@/hooks/use-inbox-unread-count";
import { useLearnerShape } from "@/modules/self-paced/hooks/use-learner-shape";

/**
 * Mobile-first bottom nav. Hidden on md+ where the side rail takes over.
 * Honours the iOS home-bar safe area via `env(safe-area-inset-bottom)`.
 *
 * Shows 4 mode-aware pinned items + a "More" tab that opens a bottom
 * sheet with the role switcher (dual-role users) and all remaining
 * destinations — every route stays reachable from mobile regardless of
 * how many nav items exist.
 */
export function BottomNav() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const { mode, canSwitch } = useEffectiveMode();
  const inboxUnread = useInboxUnreadCount();
  const learner = useLearnerShape();
  const [moreOpen, setMoreOpen] = useState(false);

  const pinned = getPinnedNavItems(mode, learner);
  const allItems = getNavItemsForMode(mode, user, learner);
  const pinnedHrefs = new Set(pinned.map((i) => i.href));
  const overflow = allItems.filter((i) => !pinnedHrefs.has(i.href));

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(`${href}/`);

  const moreIsActive = overflow.some((i) => isActive(i.href));

  const getBadge = (href: string) =>
    href === "/inbox" && inboxUnread > 0 ? inboxUnread : 0;

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
        aria-label="Primary navigation"
      >
        <ul className="container flex items-stretch justify-around gap-1 py-1.5">
          {pinned.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            const badge = getBadge(item.href);
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  className={cn(
                    "group flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 transition-colors active:scale-[0.96]",
                    active
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "relative flex h-7 w-7 items-center justify-center rounded-full transition-colors duration-150",
                      active && "bg-primary text-primary-foreground shadow-sm"
                    )}
                  >
                    <Icon className="h-4.5 w-4.5" />
                    {badge > 0 && (
                      <Badge className="absolute -right-1.5 -top-1.5 h-3.5 min-w-3.5 justify-center px-1 text-[9px] leading-none border-transparent bg-accent text-white">
                        {badge > 9 ? "9+" : badge}
                      </Badge>
                    )}
                  </span>
                  <span className="text-[10px] font-medium leading-none">
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}

          <li className="flex-1">
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              className={cn(
                "flex w-full flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 transition-colors active:scale-[0.96]",
                moreIsActive || moreOpen
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span
                className={cn(
                  "relative flex h-7 w-7 items-center justify-center rounded-full transition-colors duration-150",
                  // Solid fill only for "you're on one of these pages"
                  // (persistent state); the sheet merely being open is
                  // transient and gets a lighter ring instead.
                  moreIsActive && "bg-primary text-primary-foreground shadow-sm",
                  !moreIsActive && moreOpen && "ring-2 ring-primary/30"
                )}
              >
                <MoreHorizontal className="h-4.5 w-4.5" />
              </span>
              <span className="text-[10px] font-medium leading-none">More</span>
            </button>
          </li>
        </ul>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="max-h-[78vh] justify-start rounded-t-2xl px-0 pb-[env(safe-area-inset-bottom)]"
        >
          <div className="mx-auto mt-3 mb-1 h-1 w-10 shrink-0 rounded-full bg-muted-foreground/20" />

          <SheetHeader className="shrink-0 border-b px-5 pb-3 pt-1">
            <SheetTitle className="text-sm font-semibold">Menu</SheetTitle>
            <SheetDescription className="sr-only">
              Navigation menu
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            {canSwitch && (
              <div className="border-b px-4 py-3">
                <RoleSwitcher variant="expanded" />
              </div>
            )}

            <div className="grid grid-cols-3 gap-1 p-3">
              {overflow.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                const badge = getBadge(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 rounded-2xl px-2 py-4 transition-colors active:scale-[0.97]",
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <span className="relative">
                      <Icon className="h-5 w-5" />
                      {badge > 0 && (
                        <Badge className="absolute -right-2 -top-2 h-3.5 min-w-3.5 justify-center px-1 text-[9px] leading-none border-transparent bg-accent text-white">
                          {badge > 9 ? "9+" : badge}
                        </Badge>
                      )}
                    </span>
                    <span className="text-center text-xs font-medium leading-tight">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
