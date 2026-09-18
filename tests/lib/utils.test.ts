import { describe, expect, it } from "vitest";
import { pluralize, getInitial, daysUntil, resolveStatus } from "@/lib/utils";

describe("pluralize", () => {
  it("uses the singular for exactly 1", () => {
    expect(pluralize(1, "task")).toBe("1 task");
  });

  it("uses the default plural (adds 's') for 0 and >1", () => {
    expect(pluralize(0, "task")).toBe("0 tasks");
    expect(pluralize(3, "task")).toBe("3 tasks");
  });

  it("accepts an irregular explicit plural", () => {
    expect(pluralize(1, "activity", "activities")).toBe("1 activity");
    expect(pluralize(2, "activity", "activities")).toBe("2 activities");
  });

  it("returns just the word (no count) when withCount is false", () => {
    expect(pluralize(1, "event", undefined, false)).toBe("event");
    expect(pluralize(5, "event", undefined, false)).toBe("events");
  });
});

describe("getInitial", () => {
  it("uppercases the first character of a name", () => {
    expect(getInitial("delight sheriff")).toBe("D");
  });

  it("falls back to '?' for empty, whitespace-only, or missing input", () => {
    expect(getInitial("")).toBe("?");
    expect(getInitial("   ")).toBe("?");
    expect(getInitial(undefined)).toBe("?");
    expect(getInitial(null)).toBe("?");
  });
});

describe("daysUntil", () => {
  it("is 0 for today, positive for the future, negative for the past", () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    expect(daysUntil(now)).toBe(0);
    expect(daysUntil(tomorrow)).toBe(1);
    expect(daysUntil(yesterday)).toBe(-1);
  });

  it("returns NaN for missing or invalid input", () => {
    expect(daysUntil(null)).toBeNaN();
    expect(daysUntil("not-a-date")).toBeNaN();
  });
});

describe("resolveStatus", () => {
  it("resolves a known status case-insensitively", () => {
    expect(resolveStatus("graded")).toEqual({ label: "Graded", tone: "success" });
    expect(resolveStatus("GRADED")).toEqual({ label: "Graded", tone: "success" });
    expect(resolveStatus("Late")).toEqual({ label: "Late", tone: "warning" });
  });

  it("falls back to a neutral tone with the raw string as label for unknown statuses", () => {
    expect(resolveStatus("some-made-up-status")).toEqual({
      label: "some-made-up-status",
      tone: "neutral",
    });
  });
});
