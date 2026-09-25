"use client";
import { useAuthStore } from "@/store/slices/authStore";
import { useAccessStatus } from "@/modules/access/api/access.queries";
import { useSelfPacedCourses } from "../api/self-paced.queries";
import { useMyInstructorLinks } from "../api/instructor.queries";
import { deriveLearnerShape, type LearnerShape } from "../lib/learner-shape";

export type { LearnerShape } from "../lib/learner-shape";

/**
 * What kind of learner this is, for nav and dashboard composition.
 *
 * Deliberately built on endpoints outside the cohort payment gate
 * (`/lms/me/access-status`, `/lms/self-paced/courses`): it runs on every
 * page, and a 402 from `/lms/courses` would bounce a suspended learner
 * off pages they're allowed to be on.
 *
 * `selfPacedOnly` stays false until both answers are in, so a slow
 * response never hides a cohort learner's nav or dashboard widgets.
 */
export function useLearnerShape(): LearnerShape {
  const user = useAuthStore((s) => s.user);
  const selfPaced = useSelfPacedCourses();
  const access = useAccessStatus();
  // Self-gates to accounts that teach; no request for pure learners.
  const instructorLinks = useMyInstructorLinks();

  return deriveLearnerShape({
    user,
    selfPacedCourseCount: selfPaced.data?.length,
    hasActiveEnrolment: access.data?.hasActiveEnrolment,
    instructorLinks: instructorLinks.data,
    isLoading: selfPaced.isLoading || access.isLoading,
  });
}
