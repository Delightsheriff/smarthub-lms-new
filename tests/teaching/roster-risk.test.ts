import { describe, expect, it } from "vitest";
import { filterRoster } from "@/modules/teaching/lib/roster-risk";

const now = new Date("2026-09-25T12:00:00Z").getTime();
const rows = [
  { studentId: "a", name: "A", lastSubmittedAt: null, submissionCount: 0 },
  { studentId: "b", name: "B", lastSubmittedAt: "2026-09-20T12:00:00Z", submissionCount: 2 },
  { studentId: "c", name: "C", lastSubmittedAt: "2026-09-01T12:00:00Z", submissionCount: 1 },
];

describe("filterRoster", () => {
  it("keeps everyone for all", () => {
    expect(filterRoster(rows, "all", now)).toHaveLength(3);
  });
  it("finds students with nothing submitted", () => {
    expect(filterRoster(rows, "no-activity", now).map((r) => r.studentId)).toEqual(["a"]);
  });
  it("finds students quiet for 14+ days, including never-submitted", () => {
    expect(filterRoster(rows, "quiet", now).map((r) => r.studentId)).toEqual(["a", "c"]);
  });
});
