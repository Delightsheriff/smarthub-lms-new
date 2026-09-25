import type { AuthUser } from "@/types/auth";

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

export interface LearnerShapeInput {
  user: Pick<AuthUser, "roles" | "lmsRole"> | null | undefined;
  /** Undefined until `/lms/self-paced/courses` answers. */
  selfPacedCourseCount: number | undefined;
  /** Undefined until `/lms/me/access-status` answers. */
  hasActiveEnrolment: boolean | undefined;
  instructorLinks:
    | { links: unknown[]; coursesWithoutLink: unknown[] }
    | undefined;
  isLoading: boolean;
}

/**
 * Pure derivation behind `useLearnerShape`. `selfPacedOnly` needs a
 * positive answer from both endpoints — an unanswered access-status is
 * treated as "might have a cohort", never as "has none".
 */
export function deriveLearnerShape(input: LearnerShapeInput): LearnerShape {
  const hasSelfPaced = (input.selfPacedCourseCount ?? 0) > 0;
  const roles = input.user?.roles ?? [];
  const onOtherStudentTrack =
    roles.includes("intern") || roles.includes("ambassador");
  const lmsRole = input.user?.lmsRole;
  const teaches = lmsRole === "instructor" || lmsRole === "both";

  const selfPacedOnly =
    hasSelfPaced &&
    input.hasActiveEnrolment === false &&
    !onOtherStudentTrack &&
    !teaches;

  const teachesSelfPaced =
    teaches &&
    ((input.instructorLinks?.links.length ?? 0) > 0 ||
      (input.instructorLinks?.coursesWithoutLink.length ?? 0) > 0);

  return {
    hasSelfPaced,
    selfPacedOnly,
    teachesSelfPaced,
    isLoading: input.isLoading,
  };
}
