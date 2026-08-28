import { describe, expect, it } from "vitest";
import { normaliseModuleContent } from "@/modules/learning/api/normalise";

describe("normaliseModuleContent", () => {
  it("uses titleSlug when present, otherwise the raw id as slug", () => {
    const withSlug = normaliseModuleContent(
      { _id: "mod_1", title: "W", titleSlug: "week-1" },
      "course_1",
      [],
      [],
      [],
    );
    const withoutSlug = normaliseModuleContent(
      { _id: "mod_2", title: "W" },
      "course_1",
      [],
      [],
      [],
    );
    expect(withSlug.slug).toBe("week-1");
    expect(withoutSlug.slug).toBe("mod_2");
  });

  it("falls back to order+1 when order is absent", () => {
    const m = normaliseModuleContent(
      { _id: "mod_1", title: "W" },
      "course_1",
      [],
      [],
      [],
      /* fallbackOrder */ 3,
    );
    expect(m.order).toBe(4);
  });

  it("honours an explicit order over the fallback", () => {
    const m = normaliseModuleContent(
      { _id: "mod_1", title: "W", order: 2 },
      "course_1",
      [],
      [],
      [],
      /* fallbackOrder */ 99,
    );
    expect(m.order).toBe(2);
  });

  it("defaults learning objectives to an empty array", () => {
    const m = normaliseModuleContent(
      { _id: "mod_1", title: "W" },
      "course_1",
      [],
      [],
      [],
    );
    expect(m.learningObjectives).toEqual([]);
  });

  it("coerces cohort start/complete timestamps (defaulting to null)", () => {
    const m = normaliseModuleContent(
      {
        _id: "mod_1",
        title: "W",
        cohortStartedAt: "2026-01-01T00:00:00Z",
      },
      "course_1",
      [],
      [],
      [],
    );
    expect(m.cohortStartedAt).toBe("2026-01-01T00:00:00Z");
    expect(m.cohortCompletedAt).toBeNull();
  });

  it("normalises child recordings, materials, and assignments", () => {
    const m = normaliseModuleContent(
      { _id: "mod_1", title: "W" },
      "course_1",
      [
        {
          _id: "rec_1",
          title: "Intro",
          duration: 90,
          watched: true,
        },
      ],
      [
        {
          _id: "mat_1",
          title: "Notes",
          fileType: "application/pdf",
        },
      ],
      [
        {
          _id: "ass_1",
          title: "Task",
          dueDate: "2026-03-01",
        },
      ],
    );

    expect(m.recordings[0]).toMatchObject({
      id: "rec_1",
      durationLabel: "2 min",
      watched: true,
    });
    expect(m.materials[0]).toMatchObject({ id: "mat_1", type: "pdf" });
    expect(m.assignments[0]).toMatchObject({ id: "ass_1", title: "Task" });
  });
});
