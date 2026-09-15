"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getNavItemsForMode, type NavItem } from "@/configs/nav";
import { useAuthStore } from "@/store/slices/authStore";
import { useEffectiveMode } from "@/hooks/use-effective-mode";
import { useInboxUnreadCount } from "@/hooks/use-inbox-unread-count";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Logo } from "@/components/layout/logo";
import { RoleSwitcher } from "@/components/layout/role-switcher";
import { UserMenu } from "@/components/layout/user-menu";

/** Splits a flat, ordered nav-item list into contiguous runs sharing
 *  the same `group` — a pure rendering concern layered on top of
 *  `getNavItemsForMode`'s data, never a re-ordering of it. Runs, not
 *  a group-name merge: the ungrouped items at the top (Home, Ask
 *  Oreo) and the ungrouped footer items (Calendar, Inbox, …) stay in
 *  their original positions as two separate unlabeled sections,
 *  rather than collapsing into one bucket at the top. */
function groupNavItems(items: NavItem[]): { group?: string; items: NavItem[] }[] {
  const sections: { group?: string; items: NavItem[] }[] = [];
  for (const item of items) {
    const last = sections[sections.length - 1];
    if (last && last.group === item.group) {
      last.items.push(item);
    } else {
      sections.push({ group: item.group, items: [item] });
    }
  }
  return sections;
}

/**
 * Desktop application rail (shadcn `Sidebar`). Two states, handled by the
 * primitive's `collapsible="icon"` mode: expanded (icon + label) and a
 * narrow icon-only rail that shows tooltips on hover. Collapse state is
 * owned by `SidebarProvider` (wired to `sidebarStore` in the shell).
 *
 * Nav is pure data from `getNavItemsForMode(mode, user)` — this
 * component only *renders* it (see ADR 0007 for the nav-data/nav-rendering
 * seam). Dual-role users get a Student / Teaching switcher scoping the
 * items below it.
 */
export function AppSidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const { mode, canSwitch } = useEffectiveMode();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navItems = getNavItemsForMode(mode, user);
  const sections = groupNavItems(navItems);
  const inboxUnread = useInboxUnreadCount();

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(`${href}/`);

  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.email ||
    "";

  return (
    // One provider so the collapsed rail's icon tooltips group: the
    // first hover waits 500ms, then any tooltip opened within 400ms of
    // the last one closing (Base UI's own `timeout` default) shows
    // instantly — the rail should feel expensive to use, not laggy
    // per-item, without risking accidental activation on the first hover.
    <TooltipProvider delay={500}>
      <Sidebar collapsible="icon" side="left">
        <SidebarHeader className="gap-2 p-2">
          <div className="flex justify-center">
            <Link href="/dashboard" aria-label="SmartHub" className="block">
              <Logo size="sm" />
            </Link>
          </div>
          {canSwitch && (
            <RoleSwitcher variant={collapsed ? "collapsed" : "expanded"} />
          )}
        </SidebarHeader>

        <SidebarContent>
          {sections.map((section, i) => (
            <SidebarGroup key={section.group ?? `ungrouped-${i}`}>
              {section.group && (
                <SidebarGroupLabel className="uppercase tracking-wider text-[10.5px] font-semibold text-sidebar-foreground/50">
                  {section.group}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;
                    const isInbox = item.href === "/inbox";
                    const badge = isInbox ? inboxUnread : 0;
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          render={
                            <Link href={item.href}>
                              <Icon />
                              <span>{item.label}</span>
                            </Link>
                          }
                          isActive={active}
                          tooltip={item.label}
                        />
                        {badge > 0 && (
                          <SidebarMenuBadge>
                            {badge > 99 ? "99+" : badge}
                          </SidebarMenuBadge>
                        )}
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        {/* Identity card — the avatar opens the existing quick-action
            menu (UserMenu). A dedicated profile drawer replaces this
            once the Settings/Profile slice builds it end-to-end. */}
        <SidebarFooter className="border-t border-sidebar-border p-2 group-data-[collapsible=icon]:items-center">
          <div className="flex items-center gap-2.5 rounded-xl p-1.5 group-data-[collapsible=icon]:justify-center">
            <UserMenu />
            <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-sm font-semibold text-sidebar-foreground">
                {fullName || "—"}
              </p>
              <p className="truncate text-xs text-sidebar-foreground/60">
                {mode === "instructor" ? "Instructor" : "Student"}
              </p>
            </div>
          </div>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>
    </TooltipProvider>
  );
}
