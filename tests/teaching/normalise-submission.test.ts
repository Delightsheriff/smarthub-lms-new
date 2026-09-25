import { describe, expect, it } from "vitest";
import { normaliseCohortSubmissionRow } from "@/modules/teaching/api/normalise";
import type { ApiCohortSubmissionRow } from "@/modules/teaching/types/api.types";

describe("normaliseCohortSubmissionRow", () => {
  it("maps the wire _ids to id so grading targets a real submission", () => {
    const wire: ApiCohortSubmissionRow = {
      _id: "sub_1",
      assignment: { _id: "asg_1", title: "Week 1", totalPoints: 100 },
      student: { _id: "usr_9", name: "Ada Obi", email: "ada@example.com" },
      submittedAt: "2026-09-01T10:00:00.000Z",
      status: "submitted",
      isLate: true,
      submissionType: "url",
      externalUrl: "https://example.com/work",
    };

    const row = normaliseCohortSubmissionRow(wire);

    expect(row.id).toBe("sub_1");
    expect(row.assignment).toEqual({ id: "asg_1", title: "Week 1", totalPoints: 100 });
    expect(row.student).toEqual({ id: "usr_9", name: "Ada Obi", email: "ada@example.com" });
    expect(row.isLate).toBe(true);
    expect(row.externalUrl).toBe("https://example.com/work");
  });

  it("falls back to placeholders when populated refs are empty", () => {
    const row = normaliseCohortSubmissionRow({
      _id: "sub_2",
      assignment: { _id: "" },
      student: { _id: "", name: "" },
      isLate: false,
    });
    expect(row.assignment.title).toBe("Untitled");
    expect(row.student.name).toBe("Unnamed");
  });
});
