import { describe, expect, it } from "vitest";
import {
  addDaysToLocalInput,
  dateToLocalInput,
  isFutureLocalInput,
  isoToLocalInput,
} from "@/modules/teaching/components/authoring/datetime-local";

describe("datetime-local helpers", () => {
  it("formats a local date for the input", () => {
    expect(dateToLocalInput(new Date(2026, 8, 5, 7, 3))).toBe("2026-09-05T07:03");
  });

  it("round-trips an ISO string through local time", () => {
    const d = new Date(2026, 9, 1, 18, 30);
    expect(isoToLocalInput(d.toISOString())).toBe("2026-10-01T18:30");
    expect(isoToLocalInput(undefined)).toBe("");
    expect(isoToLocalInput("not a date")).toBe("");
  });

  it("extends a future date by whole days", () => {
    const now = new Date(2026, 8, 1, 12, 0);
    expect(addDaysToLocalInput("2026-09-29T23:00", 3, now)).toBe("2026-10-02T23:00");
  });

  it("extends from now when the current date has already passed", () => {
    const now = new Date(2026, 8, 25, 9, 30);
    expect(addDaysToLocalInput("2026-05-24T01:00", 1, now)).toBe("2026-09-26T09:30");
  });

  it("detects future values", () => {
    const now = new Date(2026, 8, 25, 9, 30);
    expect(isFutureLocalInput("2026-09-25T09:31", now)).toBe(true);
    expect(isFutureLocalInput("2026-09-25T09:30", now)).toBe(false);
    expect(isFutureLocalInput("", now)).toBe(false);
  });
});
