import type { NavItem } from "@/configs/nav";

export interface NavSection {
  group?: string;
  items: NavItem[];
}

/** Splits a flat, ordered nav-item list into contiguous runs sharing
 *  the same `group` — a pure rendering concern layered on top of
 *  `getNavItemsForMode`'s data, never a re-ordering of it. Runs, not
 *  a group-name merge: the ungrouped items at the top (Home, Ask
 *  Oreo) and the ungrouped footer items (Calendar, Inbox, …) stay in
 *  their original positions as two separate unlabeled sections,
 *  rather than collapsing into one bucket at the top. */
export function groupNavItems(items: NavItem[]): NavSection[] {
  const sections: NavSection[] = [];
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
