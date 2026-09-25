import { describe, it, expect } from "vitest";
import {
  shouldToast,
  parseContentDispositionFilename,
  is402,
} from "@/lib/api/client";

// ─── shouldToast ──────────────────────────────────────────────────────────────

describe("shouldToast", () => {
  it("does NOT toast on GET requests", () => {
    expect(shouldToast("get", undefined)).toBe(false);
    expect(shouldToast("GET", undefined)).toBe(false);
  });

  it("toasts on POST, PUT, PATCH, DELETE when not silent", () => {
    expect(shouldToast("post", undefined)).toBe(true);
    expect(shouldToast("put", undefined)).toBe(true);
    expect(shouldToast("patch", undefined)).toBe(true);
    expect(shouldToast("delete", undefined)).toBe(true);
    // Uppercase method names are normalised.
    expect(shouldToast("POST", undefined)).toBe(true);
  });

  it("does NOT toast when silent=true, regardless of method", () => {
    expect(shouldToast("post", true)).toBe(false);
    expect(shouldToast("get", true)).toBe(false);
    expect(shouldToast("delete", true)).toBe(false);
  });

  it("toasts when silent=false (explicit opt-in)", () => {
    expect(shouldToast("post", false)).toBe(true);
  });

  it("falls back to 'get' behaviour for an empty string method", () => {
    expect(shouldToast("", undefined)).toBe(false);
  });
});

// ─── parseContentDispositionFilename ─────────────────────────────────────────

describe("parseContentDispositionFilename", () => {
  it("returns undefined for null/undefined/empty header", () => {
    expect(parseContentDispositionFilename(null)).toBeUndefined();
    expect(parseContentDispositionFilename(undefined)).toBeUndefined();
    expect(parseContentDispositionFilename("")).toBeUndefined();
  });

  it("parses a plain filename= token", () => {
    expect(parseContentDispositionFilename('attachment; filename="report.pdf"')).toBe(
      "report.pdf",
    );
  });

  it("parses a plain filename= without quotes", () => {
    expect(parseContentDispositionFilename("attachment; filename=report.pdf")).toBe(
      "report.pdf",
    );
  });

  it("parses the RFC 5987 filename*=UTF-8'' form", () => {
    const header = "attachment; filename*=UTF-8''Data%20Science%20Curriculum.pdf";
    expect(parseContentDispositionFilename(header)).toBe(
      "Data Science Curriculum.pdf",
    );
  });

  it("prefers filename*= over filename= when both are present", () => {
    const header =
      "attachment; filename=\"curriculum.pdf\"; filename*=UTF-8''Curriculum%202025.pdf";
    expect(parseContentDispositionFilename(header)).toBe("Curriculum 2025.pdf");
  });

  it("returns undefined when the header has no filename token", () => {
    expect(parseContentDispositionFilename("inline")).toBeUndefined();
  });
});

// ─── is402 ───────────────────────────────────────────────────────────────────

describe("is402", () => {
  it("returns true for status 402", () => {
    expect(is402(402)).toBe(true);
  });

  it("returns false for other statuses", () => {
    expect(is402(401)).toBe(false);
    expect(is402(403)).toBe(false);
    expect(is402(500)).toBe(false);
    expect(is402(200)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(is402(undefined)).toBe(false);
  });
});
