import { describe, expect, it } from "vitest";
import { normaliseEvent } from "@/modules/calendar/api/normalise";
import type { ApiCalendarEvent } from "@/modules/calendar/types";

describe("normaliseEvent", () => {
  it("normalises wire calendar event into UI event with mapped tone & labels", () => {
    const wire: ApiCalendarEvent = {
      _id: "evt_100",
      type: "class-session",
      source: "auto",
      title: "React Workshop",
      description: "Live interactive coding session",
      location: "Google Meet",
      start: "2026-09-10T10:00:00.000Z",
      end: "2026-09-10T12:00:00.000Z",
      allDay: false,
      scope: "schedule",
      scopeId: "sched_1",
      isCancelled: false,
      sourceRef: { model: "ClassSession", id: "cs_99" },
      meta: { courseName: "Full-Stack Web Development", moduleTitle: "React Fundamentals" },
    };

    const ui = normaliseEvent(wire);

    expect(ui.id).toBe("evt_100");
    expect(ui.type).toBe("class-session");
    expect(ui.typeLabel).toBe("Class");
    expect(ui.typeTone).toBe("blue");
    expect(ui.start).toBeInstanceOf(Date);
    expect(ui.end).toBeInstanceOf(Date);
    expect(ui.sourceId).toBe("cs_99");
    expect(ui.courseName).toBe("Full-Stack Web Development");
    expect(ui.moduleTitle).toBe("React Fundamentals");
  });

  it("handles fallback tone and labels for unknown event types", () => {
    const wire: ApiCalendarEvent = {
      _id: "evt_101",
      type: "custom-hackathon",
      source: "manual",
      title: "Annual Hackathon",
      start: "2026-10-01T09:00:00.000Z",
      allDay: true,
      scope: "global",
      isCancelled: false,
    };

    const ui = normaliseEvent(wire);

    expect(ui.typeLabel).toBe("custom-hackathon");
    expect(ui.typeTone).toBe("muted");
    expect(ui.allDay).toBe(true);
  });
});
