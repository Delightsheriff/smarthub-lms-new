import type { SelfPacedCourseSummary } from "../types";

const time = (iso?: string) => (iso ? new Date(iso).getTime() || 0 : 0);

/**
 * Unfinished self-paced courses in the order to put them in front of
 * the learner: the one most recently worked on (`lastActivityAt`, the
 * latest lesson completion) first. Without that — nothing completed
 * yet, or an API that doesn't send it — a course already under way
 * beats one not started, then the most recently granted wins.
 */
export function pickContinueCourses(
  courses: readonly SelfPacedCourseSummary[],
): SelfPacedCourseSummary[] {
  return courses
    .filter((c) => !c.completedAt && c.nextLesson)
    .sort((a, b) => {
      const activity = time(b.lastActivityAt) - time(a.lastActivityAt);
      if (activity !== 0) return activity;
      const startedA = a.progress.completedLessons > 0 ? 1 : 0;
      const startedB = b.progress.completedLessons > 0 ? 1 : 0;
      if (startedA !== startedB) return startedB - startedA;
      return time(b.grantedAt) - time(a.grantedAt);
    });
}
