import { describe, expect, it } from "vitest";
import { deriveLearnerShape } from "@/modules/self-paced/lib/learner-shape";

const base = {
  user: { roles: ["student"], lmsRole: "student" as const },
  selfPacedCourseCount: 2,
  hasActiveEnrolment: false,
  instructorLinks: undefined,
  isLoading: false,
};

describe("deriveLearnerShape", () => {
  it("flags a self-paced buyer with no cohort as self-paced-only", () => {
    const shape = deriveLearnerShape(base);
    expect(shape.hasSelfPaced).toBe(true);
    expect(shape.selfPacedOnly).toBe(true);
  });

  it("is not self-paced-only with an active cohort enrolment", () => {
    expect(
      deriveLearnerShape({ ...base, hasActiveEnrolment: true }).selfPacedOnly
    ).toBe(false);
  });

  it("stays false until access-status answers (no cohort-widget flash)", () => {
    expect(
      deriveLearnerShape({ ...base, hasActiveEnrolment: undefined }).selfPacedOnly
    ).toBe(false);
    expect(
      deriveLearnerShape({ ...base, selfPacedCourseCount: undefined }).selfPacedOnly
    ).toBe(false);
  });

  it("never treats interns, ambassadors or teaching staff as self-paced-only", () => {
    expect(
      deriveLearnerShape({ ...base, user: { roles: ["student", "intern"], lmsRole: "student" } })
        .selfPacedOnly
    ).toBe(false);
    expect(
      deriveLearnerShape({ ...base, user: { roles: ["ambassador"], lmsRole: "student" } })
        .selfPacedOnly
    ).toBe(false);
    expect(
      deriveLearnerShape({ ...base, user: { roles: ["instructor"], lmsRole: "both" } })
        .selfPacedOnly
    ).toBe(false);
  });

  it("marks teachesSelfPaced only for teaching staff named on a course", () => {
    const links = { links: [], coursesWithoutLink: [{}] };
    expect(
      deriveLearnerShape({
        ...base,
        user: { roles: ["instructor"], lmsRole: "instructor" },
        instructorLinks: links,
      }).teachesSelfPaced
    ).toBe(true);
    expect(
      deriveLearnerShape({ ...base, instructorLinks: links }).teachesSelfPaced
    ).toBe(false);
  });
});
