import { describe, expect, it } from "vitest";
import {
  computeProgress,
  normaliseWorkspace,
} from "@/modules/internships/api/normalise";
import type { ApiInternship } from "@/modules/internships/types/api.types";

const baseInternship: ApiInternship = {
  _id: "int_1",
  internName: "Ade Balogun",
  internEmail: "ade.balogun@example.com",
  product: { key: "course", name: "Full-Stack Web Development" },
  mentor: { name: "Tunde Ojo", email: "tunde.ojo@example.com" },
  startDate: "2026-08-01",
  endDate: "2027-01-31",
  status: "active",
  progressPercent: 15,
  checkIns: [],
  tasks: [],
};

describe("computeProgress", () => {
  it("is 0 for an empty task list", () => {
    expect(computeProgress([])).toBe(0);
  });

  it("weighs statuses (todo < in_progress < submitted < done)", () => {
    expect(
      computeProgress([
        { _id: "t1", internship: "int_1", title: "A", status: "todo", order: 0 },
        { _id: "t2", internship: "int_1", title: "B", status: "done", order: 1 },
      ]),
    ).toBe(50);
  });

  it("rounds to a whole percent", () => {
    expect(
      computeProgress([
        { _id: "t1", internship: "int_1", title: "A", status: "in_progress", order: 0 },
        { _id: "t2", internship: "int_1", title: "B", status: "submitted", order: 1 },
      ]),
    ).toBe(55); // (0.4 + 0.7) / 2 = 0.55
  });
});

describe("normaliseWorkspace", () => {
  it("returns null for a null payload (no placement)", () => {
    expect(normaliseWorkspace(null)).toBeNull();
  });

  it("sorts tasks by order and keeps the server progressPercent", () => {
    const ws = normaliseWorkspace({
      ...baseInternship,
      tasks: [
        { _id: "t2", internship: "int_1", title: "B", status: "todo", order: 2 },
        { _id: "t1", internship: "int_1", title: "A", status: "todo", order: 1 },
      ],
    });
    expect(ws?.tasks.map((t) => t.title)).toEqual(["A", "B"]);
    expect(ws?.progressPercent).toBe(15);
  });

  it("sorts check-ins newest-first", () => {
    const ws = normaliseWorkspace({
      ...baseInternship,
      checkIns: [
        { _id: "c1", submittedAt: "2026-08-01T10:00:00Z", summary: "old" },
        { _id: "c2", submittedAt: "2026-08-08T10:00:00Z", summary: "new" },
      ],
    });
    expect(ws?.checkIns.map((c) => c._id)).toEqual(["c2", "c1"]);
  });
});