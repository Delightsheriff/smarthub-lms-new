"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getNavItemsForMode } from "@/configs/nav";
import { useAuthStore } from "@/store/slices/authStore";
import { useEffectiveMode } from "@/hooks/use-effective-mode";
import { useInboxUnreadCount } from "@/hooks/use-inbox-unread-count";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/layout/logo";
import { RoleSwitcher } from "@/components/layout/role-switcher";

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
  const inboxUnread = useInboxUnreadCount();

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(`${href}/`);

  return (
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
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
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
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
