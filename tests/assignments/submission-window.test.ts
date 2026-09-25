import { describe, it, expect } from "vitest";
import {
  isSubmissionWindowClosed,
  canResubmitSubmission,
} from "@/modules/assignments/lib/submission-window";

describe("Submission window predicate", () => {
  const now = 1_000_000;
  const futureDue = new Date(now + 10_000);
  const pastDue = new Date(now - 10_000);

  it("returns false (window open) before deadline regardless of submission", () => {
    expect(isSubmissionWindowClosed({ dueAt: futureDue, now })).toBe(false);
    expect(
      isSubmissionWindowClosed({
        dueAt: futureDue,
        allowLateSubmission: false,
        submission: null,
        now,
      }),
    ).toBe(false);
  });

  it("returns false (window open) past deadline when allowLateSubmission is true", () => {
    expect(
      isSubmissionWindowClosed({
        dueAt: pastDue,
        allowLateSubmission: true,
        submission: null,
        now,
      }),
    ).toBe(false);
  });

  it("returns true (window closed) past deadline when late disallowed and no submission", () => {
    expect(
      isSubmissionWindowClosed({
        dueAt: pastDue,
        allowLateSubmission: false,
        submission: null,
        now,
      }),
    ).toBe(true);
  });

  it("returns true (window closed) past deadline when late disallowed and submission is pending/graded >= 70%", () => {
    expect(
      isSubmissionWindowClosed({
        dueAt: pastDue,
        allowLateSubmission: false,
        submission: { status: "submitted" },
        now,
      }),
    ).toBe(true);

    expect(
      isSubmissionWindowClosed({
        dueAt: pastDue,
        allowLateSubmission: false,
        submission: { status: "graded", grade: { percentage: 85 } },
        now,
      }),
    ).toBe(true);
  });

  it("returns false (window open) past deadline if submission was returned for revision", () => {
    expect(
      isSubmissionWindowClosed({
        dueAt: pastDue,
        allowLateSubmission: false,
        submission: { status: "returned" },
        now,
      }),
    ).toBe(false);
  });

  it("returns false (window open) past deadline if graded submission scored < 70%", () => {
    expect(
      isSubmissionWindowClosed({
        dueAt: pastDue,
        allowLateSubmission: false,
        submission: { status: "graded", grade: { percentage: 55 } },
        now,
      }),
    ).toBe(false);
  });

  it("determines canResubmitSubmission accurately", () => {
    expect(canResubmitSubmission({ dueAt: futureDue, submission: null, now })).toBe(false);
    expect(
      canResubmitSubmission({
        dueAt: futureDue,
        submission: { status: "submitted" },
        now,
      }),
    ).toBe(true);
    expect(
      canResubmitSubmission({
        dueAt: pastDue,
        allowLateSubmission: false,
        submission: { status: "submitted" },
        now,
      }),
    ).toBe(false);
  });
});
