import { describe, expect, it } from "vitest";
import { buildCourseProgress } from "@/modules/dashboard/lib/course-progress";

const a = { id: "a", name: "Alpha" };
const b = { id: "b", name: "Beta" };

describe("buildCourseProgress", () => {
  it("counts submitted, graded and returned as done, per course", () => {
    const rows = buildCourseProgress([
      { course: a, assignment: { status: "submitted" } },
      { course: a, assignment: { status: "graded" } },
      { course: a, assignment: { status: "draft" } },
      { course: a, assignment: { status: "overdue" } },
      { course: b, assignment: { status: "returned" } },
    ]);
    expect(rows).toEqual([
      { course: b, total: 1, done: 1, pct: 100 },
      { course: a, total: 4, done: 2, pct: 50 },
    ]);
  });

  it("is empty with no assignments", () => {
    expect(buildCourseProgress([])).toEqual([]);
  });

  it("rounds the percentage", () => {
    const [row] = buildCourseProgress([
      { course: a, assignment: { status: "graded" } },
      { course: a, assignment: { status: "draft" } },
      { course: a, assignment: { status: "draft" } },
    ]);
    expect(row.pct).toBe(33);
  });
});
