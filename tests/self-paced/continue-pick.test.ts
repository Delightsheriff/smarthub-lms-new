import { describe, expect, it } from "vitest";
import { pickContinueCourses } from "@/modules/self-paced/lib/continue-pick";
import type { SelfPacedCourseSummary } from "@/modules/self-paced/types";

const course = (
  id: string,
  over: Partial<SelfPacedCourseSummary> = {},
): SelfPacedCourseSummary => ({
  id,
  name: id,
  slug: id,
  description: "",
  progress: { totalLessons: 10, completedLessons: 0, percent: 0 },
  nextLesson: { id: `${id}-l1`, title: "Lesson" },
  ...over,
});

describe("pickContinueCourses", () => {
  it("drops completed courses and those with no next lesson", () => {
    const picked = pickContinueCourses([
      course("done", { completedAt: "2026-09-01T00:00:00Z" }),
      course("none", { nextLesson: undefined }),
      course("open"),
    ]);
    expect(picked.map((c) => c.id)).toEqual(["open"]);
  });

  it("puts the most recently worked-on course first (lastActivityAt)", () => {
    const picked = pickContinueCourses([
      course("older", { lastActivityAt: "2026-09-01T00:00:00Z" }),
      course("newer", { lastActivityAt: "2026-09-10T00:00:00Z" }),
    ]);
    expect(picked[0].id).toBe("newer");
  });

  it("falls back to started-before-unstarted, then most recently granted", () => {
    const picked = pickContinueCourses([
      course("fresh-new", { grantedAt: "2026-09-20T00:00:00Z" }),
      course("started", {
        grantedAt: "2026-08-01T00:00:00Z",
        progress: { totalLessons: 10, completedLessons: 3, percent: 30 },
      }),
      course("fresh-old", { grantedAt: "2026-09-01T00:00:00Z" }),
    ]);
    expect(picked.map((c) => c.id)).toEqual(["started", "fresh-new", "fresh-old"]);
  });
});
