"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { getNavItemsForMode, type NavItem } from "@/configs/nav";
import { groupNavItems, type NavSection } from "@/lib/nav-grouping";
import { useAuthStore } from "@/store/slices/authStore";
import { useEffectiveMode } from "@/hooks/use-effective-mode";
import { useInboxUnreadCount } from "@/hooks/use-inbox-unread-count";
import { useLearnerShape } from "@/modules/self-paced/hooks/use-learner-shape";
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Logo } from "@/components/layout/logo";
import { UserMenu } from "@/components/layout/user-menu";

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
  const { mode } = useEffectiveMode();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const learner = useLearnerShape();
  const navItems = getNavItemsForMode(mode, user, learner);
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
        <SidebarHeader className="border-b border-sidebar-border/60 p-2 pb-3">
          <div className="flex justify-center">
            <Link href="/dashboard" aria-label="SmartHub" className="block">
              <Logo size="sm" />
            </Link>
          </div>
        </SidebarHeader>

        <SidebarContent>
          {sections.map((section, i) => (
            <NavSectionGroup
              key={section.group ?? `ungrouped-${i}`}
              section={section}
              isActive={isActive}
              inboxUnread={inboxUnread}
              railCollapsed={collapsed}
            />
          ))}
        </SidebarContent>

        {/* Identity card — the avatar opens the existing quick-action
            menu (UserMenu). A dedicated profile drawer replaces this
            once the Settings/Profile slice builds it end-to-end. */}
        <SidebarFooter className="border-t border-sidebar-border/80 p-2 group-data-[collapsible=icon]:items-center">
          <div className="flex items-center gap-2.5 rounded-xl p-1.5 transition-colors hover:bg-sidebar-accent/50 group-data-[collapsible=icon]:justify-center">
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

/** One nav section. Ungrouped runs (no `group` label — Home/Ask Oreo up
 *  top, the common items at the footer) render as a plain, always-open
 *  group, same as before. Labeled sections (Learning, Money, Teaching,
 *  Internship) are individually collapsible via a chevron on the label,
 *  matching shadcn's own documented `Collapsible` + `SidebarGroupLabel`
 *  pattern (ui.shadcn.com/docs/components/sidebar).
 *
 *  Collapse state is forced open whenever the rail itself is in
 *  icon-only mode — a group the user closed while expanded must not
 *  swallow its own icons once there's no label left to reopen it by. */
function NavSectionGroup({
  section,
  isActive,
  inboxUnread,
  railCollapsed,
}: {
  section: NavSection;
  isActive: (href: string) => boolean;
  inboxUnread: number;
  railCollapsed: boolean;
}) {
  const [open, setOpen] = useState(true);
  const effectiveOpen = railCollapsed || open;

  const menu = (
    <SidebarMenu>
      {section.items.map((item) => (
        <NavMenuRow
          key={item.href}
          item={item}
          active={isActive(item.href)}
          badge={item.href === "/inbox" ? inboxUnread : 0}
        />
      ))}
    </SidebarMenu>
  );

  if (!section.group) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>{menu}</SidebarGroupContent>
      </SidebarGroup>
    );
  }

  return (
    <Collapsible
      open={effectiveOpen}
      onOpenChange={railCollapsed ? undefined : setOpen}
      className="group/collapsible"
    >
      <SidebarGroup>
        <SidebarGroupLabel
          render={<CollapsibleTrigger />}
          className="cursor-pointer uppercase tracking-wider text-[11px] font-semibold text-sidebar-foreground/60 hover:text-sidebar-foreground/90 transition-colors select-none py-1.5"
        >
          {section.group}
          <ChevronDown className="ml-auto h-3.5 w-3.5 shrink-0 transition-transform duration-150 ease-out group-data-open/collapsible:rotate-180" />
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent>{menu}</SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}

function NavMenuRow({
  item,
  active,
  badge,
}: {
  item: NavItem;
  active: boolean;
  badge: number;
}) {
  const Icon = item.icon;
  return (
    <SidebarMenuItem>
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
        <SidebarMenuBadge className="font-mono text-[10px] font-semibold">
          {badge > 99 ? "99+" : badge}
        </SidebarMenuBadge>
      )}
    </SidebarMenuItem>
  );
}
