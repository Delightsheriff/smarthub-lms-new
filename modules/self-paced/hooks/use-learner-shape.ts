"use client";
import { useAuthStore } from "@/store/slices/authStore";
import { useCourses } from "@/modules/courses/api/courses.queries";
import { useSelfPacedCourses } from "../api/self-paced.queries";
import { useMyInstructorLinks } from "../api/instructor.queries";

export interface LearnerShape {
  hasSelfPaced: boolean;
  /** Holds self-paced courses and nothing cohort-shaped. Cohort-only
   *  surfaces (tasks, recordings, calendar…) are absent for them rather
   *  than rendered as empty shells. */
  selfPacedOnly: boolean;
  /** Teaches here and is named on at least one self-paced course (with
   *  or without a referral link yet). Drives the instructor nav entry. */
  teachesSelfPaced: boolean;
  isLoading: boolean;
}

/**
 * What kind of learner this is, for nav and dashboard composition.
 */
export function useLearnerShape(): LearnerShape {
  const user = useAuthStore((s) => s.user);
  const selfPaced = useSelfPacedCourses();
  const cohortCourses = useCourses();
  // Self-gates to accounts that teach; no request for pure learners.
  const instructorLinks = useMyInstructorLinks();

  const hasSelfPaced = (selfPaced.data?.length ?? 0) > 0;
  const roles = user?.roles ?? [];
  const onOtherStudentTrack =
    roles.includes("intern") || roles.includes("ambassador");
  const teaches = user?.lmsRole === "instructor" || user?.lmsRole === "both";

  const hasActiveCohort = (cohortCourses.data?.length ?? 0) > 0;

  const selfPacedOnly =
    hasSelfPaced &&
    !hasActiveCohort &&
    !onOtherStudentTrack &&
    !teaches;

  const teachesSelfPaced =
    teaches &&
    ((instructorLinks.data?.links.length ?? 0) > 0 ||
      (instructorLinks.data?.coursesWithoutLink.length ?? 0) > 0);

  return {
    hasSelfPaced,
    selfPacedOnly,
    teachesSelfPaced,
    isLoading: selfPaced.isLoading || cohortCourses.isLoading,
  };
}
