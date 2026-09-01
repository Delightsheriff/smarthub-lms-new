import { describe, expect, it } from "vitest";
import {
  getMonthDays,
  getWeekDays,
  isSameDay,
  formatHourLabel,
  calculateEventPosition,
} from "@/modules/calendar/components/grid-utils";

describe("Calendar grid-utils pure functions", () => {
  it("getMonthDays generates exactly 42 grid cells (6 rows × 7 days)", () => {
    const days = getMonthDays(2026, 7); // August 2026
    expect(days).toHaveLength(42);

    const currentMonthDays = days.filter((d) => d.isCurrentMonth);
    expect(currentMonthDays).toHaveLength(31); // 31 days in August
  });

  it("getWeekDays generates 7 days starting from Sunday", () => {
    const refDate = new Date(2026, 7, 15);
    const week = getWeekDays(refDate);
    expect(week).toHaveLength(7);
    expect(week[0].date.getDay()).toBe(0); // Sunday
    expect(week[6].date.getDay()).toBe(6); // Saturday
  });

  it("isSameDay checks date equality accurately", () => {
    const d1 = new Date(2026, 7, 15, 10, 30);
    const d2 = new Date(2026, 7, 15, 18, 45);
    const d3 = new Date(2026, 7, 16, 10, 30);

    expect(isSameDay(d1, d2)).toBe(true);
    expect(isSameDay(d1, d3)).toBe(false);
  });

  it("formatHourLabel formats 12-hour clock strings", () => {
    expect(formatHourLabel(0)).toBe("12 AM");
    expect(formatHourLabel(9)).toBe("9 AM");
    expect(formatHourLabel(12)).toBe("12 PM");
    expect(formatHourLabel(15)).toBe("3 PM");
  });

  it("calculateEventPosition returns topPercent and heightPercent", () => {
    const start = new Date(2026, 7, 15, 10, 0); // 10:00 AM
    const end = new Date(2026, 7, 15, 11, 30); // 11:30 AM (90 mins)

    const pos = calculateEventPosition(start, end, 8, 12); // Day 8am-8pm (12 hrs = 720 mins)
    // 10am is 2h (120m) after 8am. 120/720 = 16.66%
    expect(pos.topPercent).toBeCloseTo(16.66, 1);
    // 90m duration / 720m = 12.5%
    expect(pos.heightPercent).toBeCloseTo(12.5, 1);
  });
});
