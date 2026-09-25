import { describe, expect, it } from "vitest";
import {
  addDaysToLocalInput,
  dateToLocalInput,
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

  it("extends by whole days", () => {
    expect(addDaysToLocalInput("2026-09-29T23:00", 3)).toBe("2026-10-02T23:00");
  });
});
