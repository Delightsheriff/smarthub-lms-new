import type { Assignment } from "@/modules/assignments/types";

export interface CourseProgressRow<C extends { id: string }> {
  course: C;
  total: number;
  done: number;
  /** 0–100, rounded. */
  pct: number;
}

/** Submitted, graded or returned all count as handed in. */
export const isAssignmentDone = (a: Pick<Assignment, "status">): boolean =>
  a.status === "submitted" || a.status === "graded" || a.status === "returned";

/**
 * Per-course assignment progress: how many of each course's assignments
 * the student has handed in. Highest completion first; empty when the
 * student has no assignments on any enrolled course.
 */
export function buildCourseProgress<C extends { id: string }>(
  items: ReadonlyArray<{ course: C; assignment: Pick<Assignment, "status"> }>,
): CourseProgressRow<C>[] {
  const byCourse = new Map<string, CourseProgressRow<C>>();
  for (const item of items) {
    const row = byCourse.get(item.course.id) ?? {
      course: item.course,
      total: 0,
      done: 0,
      pct: 0,
    };
    row.total += 1;
    if (isAssignmentDone(item.assignment)) row.done += 1;
    byCourse.set(item.course.id, row);
  }
  return Array.from(byCourse.values())
    .map((r) => ({
      ...r,
      pct: r.total === 0 ? 0 : Math.round((r.done / r.total) * 100),
    }))
    .sort((a, b) => b.pct - a.pct);
}
