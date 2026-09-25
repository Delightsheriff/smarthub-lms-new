import { describe, expect, it } from "vitest";
import { apiErrorMessage } from "@/lib/api/client";

describe("apiErrorMessage", () => {
  it("reads express-validator field errors", () => {
    expect(
      apiErrorMessage({
        code: 400,
        errors: [{ type: "field", msg: "Due date must be in the future", path: "dueDate" }],
      }),
    ).toBe("Due date must be in the future");
  });

  it("joins distinct field errors", () => {
    expect(
      apiErrorMessage({ errors: [{ msg: "Title is required" }, { msg: "Title is required" }, { msg: "Pick a module" }] }),
    ).toBe("Title is required. Pick a module");
  });

  it("prefers a top-level message", () => {
    expect(apiErrorMessage({ message: "Not allowed", errors: [{ msg: "x" }] })).toBe("Not allowed");
    expect(apiErrorMessage({ message: ["a", "b"] })).toBe("a, b");
  });

  it("returns undefined for non-objects", () => {
    expect(apiErrorMessage(undefined)).toBeUndefined();
    expect(apiErrorMessage("oops")).toBeUndefined();
  });
});
