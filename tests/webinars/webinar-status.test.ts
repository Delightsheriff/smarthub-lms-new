import { describe, expect, it } from "vitest";
import {
  webinarStatus,
  isJoinWindowOpen,
  WEBINAR_DURATION_MS,
} from "@/modules/webinars/lib/webinar-status";

describe("Webinar status and join window helpers", () => {
  it("determines webinar status correctly", () => {
    const futureDate = new Date(Date.now() + 86_400_000).toISOString();
    const ongoingDate = new Date(Date.now() - 1800_000).toISOString(); // 30 mins ago
    const pastDate = new Date(Date.now() - WEBINAR_DURATION_MS - 1000).toISOString();

    expect(webinarStatus(futureDate)).toBe("upcoming");
    expect(webinarStatus(ongoingDate)).toBe("ongoing");
    expect(webinarStatus(pastDate)).toBe("passed");
  });

  it("handles missing or invalid date gracefully", () => {
    expect(webinarStatus(null)).toBe("upcoming");
    expect(webinarStatus("invalid-date")).toBe("upcoming");
  });

  it("checks join window openness boundaries", () => {
    const fiveMinsBefore = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    const twoHoursBefore = new Date(Date.now() + 2 * 3600 * 1000).toISOString();

    expect(isJoinWindowOpen(fiveMinsBefore)).toBe(true);
    expect(isJoinWindowOpen(twoHoursBefore)).toBe(false);
  });
});
