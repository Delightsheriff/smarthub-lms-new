import { describe, expect, it } from "vitest";
import {
  normaliseCohort,
  normaliseCohortDetail,
} from "@/modules/teaching/api/normalise";
import type {
  ApiTeachingCohort,
  ApiTeachingCohortDetail,
} from "@/modules/teaching/types/api.types";

describe("normaliseCohort", () => {
  it("normalises wire teaching cohort to UI shape", () => {
    const wire: ApiTeachingCohort = {
      _id: "sched_100",
      startDate: "2026-08-01T00:00:00.000Z",
      endDate: "2026-12-01T00:00:00.000Z",
      duration: "4 months",
      studentCount: 40,
      progress: 35,
      course: {
        _id: "c_100",
        name: "Full-Stack Development",
        nameSlug: "full-stack-dev",
        mode: "online",
      },
    };

    const ui = normaliseCohort(wire);

    expect(ui.id).toBe("sched_100");
    expect(ui.studentCount).toBe(40);
    expect(ui.progress).toBe(35);
    expect(ui.course.name).toBe("Full-Stack Development");
    expect(ui.course.slug).toBe("full-stack-dev");
  });

  it("normalises cohort detail including module density counts", () => {
    const wireDetail: ApiTeachingCohortDetail = {
      _id: "sched_100",
      startDate: "2026-08-01T00:00:00.000Z",
      studentCount: 40,
      course: { _id: "c_100", name: "Full-Stack Development" },
      modules: [
        {
          _id: "m_1",
          title: "React & Next.js",
          titleSlug: "react-nextjs",
          order: 1,
          assignmentCount: 3,
          recordingCount: 4,
        },
      ],
    };

    const uiDetail = normaliseCohortDetail(wireDetail);

    expect(uiDetail.modules).toHaveLength(1);
    expect(uiDetail.modules[0].id).toBe("m_1");
    expect(uiDetail.modules[0].title).toBe("React & Next.js");
    expect(uiDetail.modules[0].assignmentCount).toBe(3);
    expect(uiDetail.modules[0].recordingCount).toBe(4);
  });
});
