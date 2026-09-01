import { describe, expect, it } from "vitest";
import {
  isCohortEnded,
  groupCohortsByCourse,
} from "@/modules/teaching/lib/group-cohorts";
import type { TeachingCohort } from "@/modules/teaching/types";

describe("isCohortEnded", () => {
  it("returns false for missing or unparseable end dates (running cohort)", () => {
    expect(isCohortEnded(undefined)).toBe(false);
    expect(isCohortEnded("invalid-date")).toBe(false);
  });

  it("classifies past end dates as ended and future end dates as active", () => {
    const pastDate = new Date(Date.now() - 86_400_000).toISOString();
    const futureDate = new Date(Date.now() + 86_400_000).toISOString();

    expect(isCohortEnded(pastDate)).toBe(true);
    expect(isCohortEnded(futureDate)).toBe(false);
  });
});

describe("groupCohortsByCourse", () => {
  it("groups active and past cohorts under course banners", () => {
    const cohorts: TeachingCohort[] = [
      {
        id: "c_1",
        startDate: "2026-08-01T00:00:00.000Z",
        endDate: new Date(Date.now() + 86_400_000 * 30).toISOString(),
        studentCount: 30,
        progress: 50,
        course: { id: "course_1", name: "Full-Stack Web Development" },
      },
      {
        id: "c_2",
        startDate: "2026-01-01T00:00:00.000Z",
        endDate: new Date(Date.now() - 86_400_000 * 10).toISOString(),
        studentCount: 25,
        progress: 100,
        course: { id: "course_1", name: "Full-Stack Web Development" },
      },
    ];

    const grouped = groupCohortsByCourse(cohorts);

    expect(grouped.active).toHaveLength(1);
    expect(grouped.active[0].cohorts[0].id).toBe("c_1");

    expect(grouped.past).toHaveLength(1);
    expect(grouped.past[0].cohorts[0].id).toBe("c_2");
  });
});
