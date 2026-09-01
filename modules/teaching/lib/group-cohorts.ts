import type { TeachingCohort } from "../types";

export interface CourseGroup {
  courseId: string;
  courseName: string;
  courseSlug?: string;
  courseMode?: string;
  courseImageUrl?: string;
  cohorts: TeachingCohort[];
}

export function isCohortEnded(endDate?: string): boolean {
  if (!endDate) return false;
  const end = new Date(endDate).getTime();
  if (Number.isNaN(end)) return false;
  return Date.now() >= end;
}

export function groupCohortsByCourse(cohorts: TeachingCohort[]): {
  active: CourseGroup[];
  past: CourseGroup[];
} {
  const activeMap = new Map<string, CourseGroup>();
  const pastMap = new Map<string, CourseGroup>();

  for (const cohort of cohorts) {
    const isEnded = isCohortEnded(cohort.endDate);
    const targetMap = isEnded ? pastMap : activeMap;
    const courseId = cohort.course.id || "course_unknown";

    const existing = targetMap.get(courseId);
    if (existing) {
      existing.cohorts.push(cohort);
    } else {
      targetMap.set(courseId, {
        courseId,
        courseName: cohort.course.name,
        courseSlug: cohort.course.slug,
        courseMode: cohort.course.mode,
        courseImageUrl: cohort.course.imageUrl,
        cohorts: [cohort],
      });
    }
  }

  // Sort cohorts inside groups: newest start date first
  const sortGroups = (map: Map<string, CourseGroup>) =>
    Array.from(map.values()).map((g) => ({
      ...g,
      cohorts: [...g.cohorts].sort(
        (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
      ),
    }));

  return {
    active: sortGroups(activeMap),
    past: sortGroups(pastMap),
  };
}
