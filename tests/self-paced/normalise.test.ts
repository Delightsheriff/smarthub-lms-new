import { describe, expect, it } from "vitest";
import {
  normaliseCompletion,
  normaliseCourseDetail,
  normaliseCourseSummary,
  normaliseNudge,
  normalisePass,
  normalisePlayback,
  normaliseUpgradeCredits,
} from "@/modules/self-paced/api/normalise";
import type {
  ApiCourseFaq,
  ApiLessonCompletion,
  ApiLessonPlayback,
  ApiNudge,
  ApiPassState,
  ApiSelfPacedCourseDetail,
  ApiSelfPacedCourseSummary,
  ApiUpgradeCredits,
} from "@/modules/self-paced/types/api.types";

describe("normaliseCourseSummary", () => {
  it("normalises summary wire shape and clamps progress", () => {
    const wire: ApiSelfPacedCourseSummary = {
      _id: "sp_1",
      name: "Docker for Beginners",
      slug: "docker-for-beginners",
      description: "Learn docker containerization",
      imageUrl: "https://res.cloudinary.com/demo/image/upload/v1/sample.jpg",
      grantedAt: "2026-09-01T10:00:00.000Z",
      progress: {
        totalLessons: 10,
        completedLessons: 4,
        percent: 40,
      },
      nextLesson: { _id: "less_5", title: "Volumes & Mounts" },
    };

    const ui = normaliseCourseSummary(wire);
    expect(ui.id).toBe("sp_1");
    expect(ui.name).toBe("Docker for Beginners");
    expect(ui.slug).toBe("docker-for-beginners");
    expect(ui.progress.percent).toBe(40);
    expect(ui.nextLesson?.id).toBe("less_5");
    expect(ui.nextLesson?.title).toBe("Volumes & Mounts");
  });
});

describe("normaliseCourseDetail", () => {
  it("sorts lessons by order and filters empty FAQs", () => {
    const wire: ApiSelfPacedCourseDetail = {
      _id: "sp_2",
      name: "Kubernetes in Production",
      slug: "k8s-prod",
      lessons: [
        {
          _id: "l_2",
          title: "Pods and ReplicaSets",
          order: 2,
          durationSeconds: 600,
          durationMinutes: 10,
          isPreview: false,
          completed: true,
          assetCount: 1,
        },
        {
          _id: "l_1",
          title: "Cluster Architecture",
          order: 1,
          durationSeconds: 300,
          durationMinutes: 5,
          isPreview: true,
          completed: true,
          assetCount: 0,
        },
      ],
      faqs: [
        { _id: "f_1", question: "Is this advanced?", answer: "Yes", order: 2 },
        { _id: "f_empty", question: "", answer: "No question", order: 1 } as ApiCourseFaq,
      ],
      progress: { totalLessons: 2, completedLessons: 2, percent: 100 },
      cohortTrack: { name: "Cloud Engineering", slug: "cloud-engineering" },
    };

    const ui = normaliseCourseDetail(wire);
    expect(ui.lessons).toHaveLength(2);
    expect(ui.lessons[0].id).toBe("l_1");
    expect(ui.lessons[1].id).toBe("l_2");
    expect(ui.faqs).toHaveLength(1);
    expect(ui.faqs[0].id).toBe("f_1");
    expect(ui.cohortTrack?.slug).toBe("cloud-engineering");
  });
});

describe("normalisePlayback", () => {
  it("maps streamPath and formats playback expiry", () => {
    const wire: ApiLessonPlayback = {
      kind: "direct",
      streamPath: "/self-paced-stream/token123",
      expiresAt: "2026-09-15T18:00:00.000Z",
      assets: [{ label: "Slide Deck", url: "https://cdn.example.com/slides.pdf" }],
    };

    const ui = normalisePlayback(wire);
    expect(ui.kind).toBe("direct");
    expect(ui.streamUrl).toContain("/self-paced-stream/token123");
    expect(ui.expiresAt).toBe(new Date("2026-09-15T18:00:00.000Z").getTime());
    expect(ui.assets).toHaveLength(1);
    expect(ui.assets[0].label).toBe("Slide Deck");
  });
});

describe("normaliseNudge", () => {
  it("normalises nudge and translates legacy actionUrl", () => {
    const wire: ApiNudge = {
      _id: "n_1",
      kind: "inactivity",
      course: { _id: "c_1", name: "Python 101", slug: "python-101" },
      actionUrl: "/self-paced/python-101?lesson=60c72b2f9b1d8b2bad9a9999",
      sentAt: "2026-09-10T12:00:00.000Z",
    };

    const ui = normaliseNudge(wire);
    expect(ui.id).toBe("n_1");
    expect(ui.href).toBe("/learn/python-101/lessons/60c72b2f9b1d8b2bad9a9999");
    expect(ui.title).toBe("Keep going with Python 101");
  });
});

describe("normaliseUpgradeCredits", () => {
  it("filters out lapsed and non-available credits", () => {
    const now = new Date("2026-09-15T12:00:00.000Z").getTime();
    const wire: ApiUpgradeCredits = {
      windowDays: 90,
      credits: [
        {
          orderId: "ord_1",
          reference: "REF1",
          itemType: "course",
          itemName: "Self-Paced Python",
          state: "available",
          valueMinor: 5000000,
          currency: "NGN",
          valueNaira: 50000,
          anyCohort: false,
          expiresAt: "2026-10-01T00:00:00.000Z", // future
          eligibleTracks: [{ _id: "t_1", name: "Data Science", slug: "data-science" }],
        },
        {
          orderId: "ord_2",
          reference: "REF2",
          itemType: "course",
          itemName: "Expired Course",
          state: "available",
          valueMinor: 3000000,
          currency: "NGN",
          valueNaira: 30000,
          anyCohort: true,
          expiresAt: "2026-08-01T00:00:00.000Z", // past
          eligibleTracks: [],
        },
        {
          orderId: "ord_3",
          reference: "REF3",
          itemType: "course",
          itemName: "Consumed Course",
          state: "consumed",
          valueMinor: 4000000,
          currency: "NGN",
          valueNaira: 40000,
          anyCohort: true,
          eligibleTracks: [],
        },
      ],
    };

    const ui = normaliseUpgradeCredits(wire, now);
    expect(ui).toHaveLength(1);
    expect(ui[0].orderId).toBe("ord_1");
    expect(ui[0].valueMinor).toBe(5000000);
  });
});

describe("normalisePass", () => {
  it("normalises pass state", () => {
    const wire: ApiPassState = {
      active: true,
      expiresAt: "2027-09-15T00:00:00.000Z",
      excludes: ["live-instruction", "mentorship"],
    };

    const ui = normalisePass(wire);
    expect(ui.active).toBe(true);
    expect(ui.excludes).toContain("live-instruction");
  });
});

describe("normaliseCompletion", () => {
  it("normalises lesson completion response", () => {
    const wire: ApiLessonCompletion = {
      lessonId: "less_10",
      completed: true,
      courseCompleted: true,
      progress: { totalLessons: 10, completedLessons: 10, percent: 100 },
    };

    const ui = normaliseCompletion(wire);
    expect(ui.lessonId).toBe("less_10");
    expect(ui.completed).toBe(true);
    expect(ui.courseCompleted).toBe(true);
    expect(ui.progress.percent).toBe(100);
  });
});
