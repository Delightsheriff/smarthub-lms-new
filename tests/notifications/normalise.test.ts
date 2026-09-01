import { describe, expect, it } from "vitest";
import { normaliseNotification } from "@/modules/notifications/api/normalise";
import type { ApiNotification } from "@/modules/notifications/types/api.types";

describe("normaliseNotification", () => {
  it("coalesces body/message/description and read/isRead fields", () => {
    const wire1: ApiNotification = {
      _id: "ntf_1",
      type: "grade",
      title: "Assignment Graded",
      message: "Scored 88% on Flexbox Project",
      createdAt: "2026-09-01T08:00:00.000Z",
      isRead: false,
    };

    const ui1 = normaliseNotification(wire1);
    expect(ui1.body).toBe("Scored 88% on Flexbox Project");
    expect(ui1.read).toBe(false);

    const wire2: ApiNotification = {
      _id: "ntf_2",
      type: "announcement",
      title: "New Announcement",
      description: "Submission deadline extended.",
      createdAt: "2026-09-01T09:00:00.000Z",
      read: true,
    };

    const ui2 = normaliseNotification(wire2);
    expect(ui2.body).toBe("Submission deadline extended.");
    expect(ui2.read).toBe(true);
  });
});
