import {
  Activity,
  BookOpen,
  Briefcase,
  CalendarDays,
  CircleHelp,
  ClipboardList,
  Home,
  Inbox,
  Library,
  Link2,
  PlayCircle,
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
  /** Section this item renders under in the sidebar (uppercase micro-
   *  label, CRM-style grouping). Omit for the ungrouped top/footer
   *  items — `AppSidebar` renders those with no label at all. */
  group?: string;
}

/** Cross-mode items — same affordance regardless of which role the
 *  user is operating as. Calendar is on this list because the
 *  backend auto-merges enrolment + teaching events; one view is
 *  enough. Inbox / Activity / Profile follow the same logic.
 *  Deliberately ungrouped — this is the constant footer every mode
 *  shares, not a section of its own. */
const COMMON_NAV_ITEMS: NavItem[] = [
  { label: "Calendar", href: "/calendar", icon: CalendarDays },
  { label: "Inbox", href: "/inbox", icon: Inbox },
  { label: "Activity", href: "/activity", icon: Activity },
  { label: "Profile", href: "/profile", icon: User },
  { label: "Webinars", href: "/webinars", icon: Presentation },
  { label: "Help", href: "/help", icon: CircleHelp },
];

/** Internship is its own track — surfaced only when the user has
 *  the `intern` role. Lives outside the student/instructor split
 *  because it isn't role-scoped the same way. */
const INTERN_NAV_ITEMS: NavItem[] = [
  { label: "Internship", href: "/internships", icon: Briefcase, group: "Internship" },
];

/** Mode-scoped items. Labels stay constant across modes — the
 *  destination page reads `useEffectiveMode()` and renders the
 *  right scope. Home + Ask Oreo stay ungrouped (the two things
 *  opened most); everything else groups under "Learning". */
const STUDENT_MODE_ITEMS: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Ask Oreo", href: "/oreo", icon: Sparkles },
  { label: "Courses", href: "/courses", icon: BookOpen, group: "Learning" },
  { label: "Recordings", href: "/recordings", icon: Video, group: "Learning" },
  { label: "Materials", href: "/materials", icon: Library, group: "Learning" },
  { label: "Tasks", href: "/assignments", icon: ClipboardList, group: "Learning" },
  { label: "Assigned to you", href: "/assigned", icon: Sparkles, group: "Learning" },
  { label: "Billing", href: "/billing", icon: Wallet, group: "Money" },
  { label: "Payments", href: "/payments", icon: Receipt, group: "Money" },
];

const INSTRUCTOR_MODE_ITEMS: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Ask Oreo", href: "/oreo", icon: Sparkles },
  { label: "Courses", href: "/courses", icon: BookOpen, group: "Teaching" },
  { label: "Tasks", href: "/assignments", icon: ClipboardList, group: "Teaching" },
  { label: "Earnings", href: "/billing", icon: Wallet, group: "Teaching" },
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

/** What the nav needs to know about the learner's courses. Optional so
 *  callers that don't care keep the cohort-shaped nav unchanged. */
export interface NavLearnerShape {
  hasSelfPaced?: boolean;
  selfPacedOnly?: boolean;
  /** Teaches here and is named on at least one self-paced course. */
  teachesSelfPaced?: boolean;
}

/** Instructor mode only, and only for instructors named on a self-paced
 *  course — everyone else would land on an empty links list. */
const INSTRUCTOR_SELF_PACED_NAV_ITEM: NavItem = {
  label: "Self-paced sales",
  href: "/teach/self-paced",
  icon: Link2,
  group: "Teaching",
};

/** Shown only to learners who hold a self-paced course, so a cohort
 *  learner never gets an entry that leads to an empty page. */
const SELF_PACED_NAV_ITEM: NavItem = {
  label: "Self-paced",
  href: "/learn",
  icon: PlayCircle,
  group: "Learning",
};

/** Cohort-only destinations. A self-paced-only learner has nothing on
 *  any of these, so they're absent rather than empty shells. */
const COHORT_ONLY_HREFS = new Set([
  "/recordings",
  "/materials",
  "/assignments",
  "/assigned",
  "/billing",
  "/calendar",
]);

const SELF_PACED_PINNED: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Courses", href: "/courses", icon: BookOpen },
  SELF_PACED_NAV_ITEM,
  { label: "Inbox", href: "/inbox", icon: Inbox },
];

export const getPinnedNavItems = (
  mode: LmsMode,
  learner?: NavLearnerShape
): NavItem[] => {
  if (mode === "instructor") return INSTRUCTOR_PINNED;
  return learner?.selfPacedOnly ? SELF_PACED_PINNED : STUDENT_PINNED;
};

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
  user: { roles?: string[]; referralEligible?: boolean } | null | undefined,
  learner?: NavLearnerShape
): NavItem[] => {
  const isIntern = hasRole(user?.roles, "intern");

  const out: NavItem[] = [];
  if (mode === "instructor") {
    out.push(...INSTRUCTOR_MODE_ITEMS);
    if (learner?.teachesSelfPaced) {
      // Next to Earnings: both are "what I've made".
      const earningsIdx = out.findIndex((i) => i.href === "/billing");
      out.splice(
        earningsIdx >= 0 ? earningsIdx : out.length,
        0,
        INSTRUCTOR_SELF_PACED_NAV_ITEM
      );
    }
  } else {
    out.push(
      ...STUDENT_MODE_ITEMS.filter(
        (i) => !learner?.selfPacedOnly || !COHORT_ONLY_HREFS.has(i.href)
      )
    );
    if (learner?.hasSelfPaced) {
      const coursesIdx = out.findIndex((i) => i.href === "/courses");
      out.splice(coursesIdx + 1, 0, SELF_PACED_NAV_ITEM);
    }
  }
  if (isIntern) out.push(...INTERN_NAV_ITEMS);
  out.push(
    ...COMMON_NAV_ITEMS.filter(
      (i) =>
        mode === "instructor" ||
        !learner?.selfPacedOnly ||
        !COHORT_ONLY_HREFS.has(i.href)
    )
  );
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
