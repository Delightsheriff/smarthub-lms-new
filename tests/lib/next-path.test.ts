import { describe, it, expect } from "vitest";
import { safeNextPath, getNextPath } from "@/modules/auth/lib/next-path";

describe("safeNextPath", () => {
  it("allows safe relative paths", () => {
    expect(safeNextPath("/courses")).toBe("/courses");
    expect(safeNextPath("/dashboard")).toBe("/dashboard");
    expect(safeNextPath("/inbox?tab=unread")).toBe("/inbox?tab=unread");
    expect(safeNextPath("?next=/courses")).toBe("/courses");
  });

  it("rejects backslash tricks", () => {
    expect(safeNextPath("/\\evil.com")).toBeNull();
    expect(safeNextPath("/\\evil.com/path")).toBeNull();
    expect(safeNextPath("/path\\something")).toBeNull();
    expect(safeNextPath("?next=/\\evil.com")).toBeNull();
  });

  it("rejects protocol-relative URLs", () => {
    expect(safeNextPath("//evil.com")).toBeNull();
    expect(safeNextPath("//evil.com/path")).toBeNull();
    expect(safeNextPath("?next=//evil.com")).toBeNull();
  });

  it("rejects URLs containing schemes", () => {
    expect(safeNextPath("https://evil.com")).toBeNull();
    expect(safeNextPath("http://evil.com")).toBeNull();
    expect(safeNextPath("/https://evil.com")).toBeNull();
    expect(safeNextPath("?next=https://evil.com")).toBeNull();
  });

  it("rejects /login redirect loops", () => {
    expect(safeNextPath("/login")).toBeNull();
    expect(safeNextPath("/login?next=/dashboard")).toBeNull();
    expect(safeNextPath("/login/subroute")).toBeNull();
    expect(safeNextPath("?next=/login")).toBeNull();
  });

  it("returns null for non-relative paths and empty input", () => {
    expect(safeNextPath("evil.com")).toBeNull();
    expect(safeNextPath("")).toBeNull();
    expect(safeNextPath(null)).toBeNull();
    expect(safeNextPath(undefined)).toBeNull();
  });

  it("supports objects implementing get('next')", () => {
    const params = new URLSearchParams("?next=/profile");
    expect(safeNextPath(params)).toBe("/profile");

    const evilParams = new URLSearchParams("?next=/\\evil.com");
    expect(safeNextPath(evilParams)).toBeNull();
  });
});

describe("getNextPath", () => {
  it("falls back to /dashboard when next is unsafe or missing", () => {
    expect(getNextPath("/\\evil.com")).toBe("/dashboard");
    expect(getNextPath("//evil.com")).toBe("/dashboard");
    expect(getNextPath("/login")).toBe("/dashboard");
    expect(getNextPath(null)).toBe("/dashboard");
  });

  it("returns safe path when provided", () => {
    expect(getNextPath("/courses/web-dev")).toBe("/courses/web-dev");
  });
});
