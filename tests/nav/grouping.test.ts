import { describe, expect, it } from "vitest";
import { groupNavItems } from "@/lib/nav-grouping";
import { getNavItemsForMode } from "@/configs/nav";
import type { NavItem } from "@/configs/nav";

// Shared reference so two `item("Home")` calls are deep-equal (a fresh
// function per call would make `toEqual` fail on identity alone).
const DUMMY_ICON = (() => null) as unknown as NavItem["icon"];

const item = (label: string, group?: string): NavItem => ({
  label,
  href: `/${label.toLowerCase()}`,
  icon: DUMMY_ICON,
  group,
});

describe("groupNavItems", () => {
  it("keeps items with no group as their own unlabeled section", () => {
    const sections = groupNavItems([item("Home"), item("Oreo")]);
    expect(sections).toEqual([
      { group: undefined, items: [item("Home"), item("Oreo")] },
    ]);
  });

  it("splits into contiguous runs, one section per group change", () => {
    const sections = groupNavItems([
      item("Home"),
      item("Courses", "Learning"),
      item("Tasks", "Learning"),
      item("Billing", "Money"),
    ]);
    expect(sections.map((s) => s.group)).toEqual([
      undefined,
      "Learning",
      "Money",
    ]);
    expect(sections[1].items.map((i) => i.label)).toEqual(["Courses", "Tasks"]);
  });

  it("does NOT merge two non-adjacent runs of the same group — the top-of-list ungrouped items and the footer ungrouped items stay as two separate sections in their original positions", () => {
    const sections = groupNavItems([
      item("Home"), // ungrouped, top
      item("Oreo"), // ungrouped, top
      item("Courses", "Learning"),
      item("Calendar"), // ungrouped, footer
      item("Inbox"), // ungrouped, footer
    ]);
    expect(sections).toHaveLength(3);
    expect(sections[0].items.map((i) => i.label)).toEqual(["Home", "Oreo"]);
    expect(sections[1].group).toBe("Learning");
    expect(sections[2].group).toBeUndefined();
    expect(sections[2].items.map((i) => i.label)).toEqual([
      "Calendar",
      "Inbox",
    ]);
  });

  it("returns nothing for an empty list", () => {
    expect(groupNavItems([])).toEqual([]);
  });
});

describe("getNavItemsForMode grouping (real nav config)", () => {
  it("student mode: Home and Ask Oreo stay ungrouped, then Learning, then Money", () => {
    const items = getNavItemsForMode("student", { roles: [] });
    const sections = groupNavItems(items);
    const groupOrder = sections.map((s) => s.group);
    expect(groupOrder[0]).toBeUndefined();
    expect(groupOrder).toContain("Learning");
    expect(groupOrder).toContain("Money");
    // Learning must come before Money, matching the intended reading order.
    expect(groupOrder.indexOf("Learning")).toBeLessThan(
      groupOrder.indexOf("Money"),
    );
  });

  it("instructor mode: everything mode-scoped groups under Teaching", () => {
    const items = getNavItemsForMode("instructor", { roles: [] });
    const teaching = items.filter((i) => i.group === "Teaching");
    expect(teaching.map((i) => i.label)).toEqual([
      "Courses",
      "Tasks",
      "Earnings",
    ]);
  });

  it("intern role adds a distinct Internship group, not folded into Learning", () => {
    const items = getNavItemsForMode("student", { roles: ["intern"] });
    const internship = items.find((i) => i.group === "Internship");
    expect(internship?.label).toBe("Internship");
  });

  it("every mode-scoped or intern item carries a group; common footer items never do", () => {
    const items = getNavItemsForMode("student", { roles: ["intern"] });
    const footerLabels = [
      "Calendar",
      "Inbox",
      "Activity",
      "Profile",
      "Webinars",
      "Help",
      "Refer & earn",
    ];
    for (const i of items) {
      if (footerLabels.includes(i.label) || i.label === "Home" || i.label === "Ask Oreo") {
        expect(i.group).toBeUndefined();
      } else {
        expect(i.group).toBeDefined();
      }
    }
  });
});
