import { describe, expect, it } from "vitest";
import { getDeadlineStatus } from "@/modules/assignments/components/countdown-to-deadline";
import { normaliseSubmission } from "@/modules/assignments/api/normalise";
import type { ApiSubmission } from "@/modules/assignments/types/api.types";

describe("Countdown to Deadline date calculation", () => {
  it("returns Overdue status when due date is in the past", () => {
    const past = new Date(Date.now() - 3600 * 24 * 2 * 1000).toISOString();
    const status = getDeadlineStatus(past);
    expect(status.isOverdue).toBe(true);
    expect(status.isUrgent).toBe(true);
    expect(status.label).toContain("Past due");
  });

  it("returns Urgent status when due date is within 24 hours", () => {
    const soon = new Date(Date.now() + 3600 * 5 * 1000).toISOString();
    const status = getDeadlineStatus(soon);
    expect(status.isOverdue).toBe(false);
    expect(status.isUrgent).toBe(true);
    expect(status.label).toContain("Due in 5h");
  });

  it("returns Future status when due date is several days away", () => {
    const future = new Date(Date.now() + 3600 * 24 * 5 * 1000).toISOString();
    const status = getDeadlineStatus(future);
    expect(status.isOverdue).toBe(false);
    expect(status.isUrgent).toBe(false);
    expect(status.label).toContain("Due in 5d");
  });

  it("handles invalid dates gracefully", () => {
    const status = getDeadlineStatus("invalid-date-string");
    expect(status.isOverdue).toBe(false);
    expect(status.label).toBe("No due date");
  });
});

describe("normaliseSubmission", () => {
  it("normalises wire submission into clean UI structure", () => {
    const wire: ApiSubmission = {
      _id: "sub_100",
      assignment: "asgn_1",
      user: "usr_1",
      submissionType: "file",
      fileName: "solution.zip",
      fileUrl: "https://example.com/solution.zip",
      fileSize: 50000,
      fileMimeType: "application/zip",
      notes: "Attached final code",
      status: "graded",
      submittedAt: "2026-08-15T10:00:00.000Z",
      isLateSubmission: false,
      version: 2,
      previousVersionId: "sub_99",
      submissionHistory: [
        { action: "submitted", timestamp: "2026-08-10T10:00:00.000Z", notes: "v1" },
        { action: "resubmitted", timestamp: "2026-08-15T10:00:00.000Z", notes: "v2" },
      ],
      grade: {
        score: 95,
        totalPoints: 100,
        percentage: 95,
        letterGrade: "A",
        rubricScores: [
          { criterion: "Completeness", score: 50, totalPoints: 50, comment: "Perfect" },
        ],
      },
      feedback: { general: "Excellent job!" },
      gradedAt: "2026-08-16T12:00:00.000Z",
      gradedBy: "usr_instructor",
    };

    const ui = normaliseSubmission(wire);

    expect(ui.id).toBe("sub_100");
    expect(ui.assignmentId).toBe("asgn_1");
    expect(ui.userId).toBe("usr_1");
    expect(ui.submissionType).toBe("file");
    expect(ui.fileName).toBe("solution.zip");
    expect(ui.version).toBe(2);
    expect(ui.previousVersionId).toBe("sub_99");
    expect(ui.history).toHaveLength(2);
    expect(ui.grade?.letterGrade).toBe("A");
    expect(ui.grade?.rubricScores?.[0].criterion).toBe("Completeness");
    expect(ui.feedback?.general).toBe("Excellent job!");
  });
});
