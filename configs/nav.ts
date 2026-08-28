import {
  Activity,
  BookOpen,
  Briefcase,
  CalendarDays,
  ClipboardList,
  Home,
  Inbox,
  Library,
  Presentation,
  Receipt,
  Share2,
  Sparkles,
  User,
  Video,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { LmsMode } from "@/store/slices/roleModeStore";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

/** Cross-mode items — same affordance regardless of which role the
 *  user is operating as. Calendar is on this list because the
 *  backend auto-merges enrolment + teaching events; one view is
 *  enough. Inbox / Activity / Profile follow the same logic. */
const COMMON_NAV_ITEMS: NavItem[] = [
  { label: "Calendar", href: "/calendar", icon: CalendarDays },
  { label: "Inbox", href: "/inbox", icon: Inbox },
  { label: "Activity", href: "/activity", icon: Activity },
  { label: "Profile", href: "/profile", icon: User },
  { label: "Webinars", href: "/webinars", icon: Presentation },
];

/** Internship is its own track — surfaced only when the user has
 *  the `intern` role. Lives outside the student/instructor split
 *  because it isn't role-scoped the same way. */
const INTERN_NAV_ITEMS: NavItem[] = [
  { label: "Internship", href: "/internships", icon: Briefcase },
];

/** Mode-scoped items. Labels stay constant across modes — the
 *  destination page reads `useEffectiveMode()` and renders the
 *  right scope. */
const STUDENT_MODE_ITEMS: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Ask Oreo", href: "/oreo", icon: Sparkles },
  { label: "Courses", href: "/courses", icon: BookOpen },
  { label: "Recordings", href: "/recordings", icon: Video },
  { label: "Materials", href: "/materials", icon: Library },
  { label: "Tasks", href: "/assignments", icon: ClipboardList },
  { label: "Assigned to you", href: "/assigned", icon: Sparkles },
  { label: "Billing", href: "/billing", icon: Wallet },
  { label: "Payments", href: "/payments", icon: Receipt },
];

const INSTRUCTOR_MODE_ITEMS: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Ask Oreo", href: "/oreo", icon: Sparkles },
  { label: "Courses", href: "/courses", icon: BookOpen },
  { label: "Tasks", href: "/assignments", icon: ClipboardList },
  { label: "Earnings", href: "/billing", icon: Wallet },
];

/** The 4 items that are always pinned in the mobile bottom bar for
 *  each mode. Everything else spills into the "More" drawer. */
const STUDENT_PINNED: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Courses", href: "/courses", icon: BookOpen },
  { label: "Tasks", href: "/assignments", icon: ClipboardList },
  { label: "Inbox", href: "/inbox", icon: Inbox },
];

const INSTRUCTOR_PINNED: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Courses", href: "/courses", icon: BookOpen },
  { label: "Tasks", href: "/assignments", icon: ClipboardList },
  { label: "Inbox", href: "/inbox", icon: Inbox },
];

export const getPinnedNavItems = (mode: LmsMode): NavItem[] =>
  mode === "instructor" ? INSTRUCTOR_PINNED : STUDENT_PINNED;

const hasRole = (roles: string[] | undefined, role: string) =>
  Array.isArray(roles) && roles.includes(role);

const isReferralEligible = (
  user: { referralEligible?: boolean } | null | undefined
) => user?.referralEligible !== false;

const REFER_AND_EARN_NAV_ITEM: NavItem = {
  label: "Refer & earn",
  href: "/refer-and-earn",
  icon: Share2,
};

export const getNavItemsForMode = (
  mode: LmsMode,
  user: { roles?: string[]; referralEligible?: boolean } | null | undefined
): NavItem[] => {
  const isIntern = hasRole(user?.roles, "intern");

  const out: NavItem[] = [];
  if (mode === "instructor") {
    out.push(...INSTRUCTOR_MODE_ITEMS);
  } else {
    out.push(...STUDENT_MODE_ITEMS);
  }
  if (isIntern) out.push(...INTERN_NAV_ITEMS);
  out.push(...COMMON_NAV_ITEMS);
  if (isReferralEligible(user)) {
    const profileIdx = out.findIndex((i) => i.href === "/profile");
    if (profileIdx >= 0) {
      out.splice(profileIdx, 0, REFER_AND_EARN_NAV_ITEM);
    } else {
      out.push(REFER_AND_EARN_NAV_ITEM);
    }
  }
  return out;
};

/** @deprecated kept for any consumer still importing the union
 *  list. New code should use `getNavItemsForMode` + `useEffectiveMode`. */
export const NAV_ITEMS: NavItem[] = [
  ...STUDENT_MODE_ITEMS,
  ...COMMON_NAV_ITEMS,
];
