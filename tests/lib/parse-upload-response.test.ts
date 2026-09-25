import { describe, expect, it } from "vitest";
import { parseUploadResponse } from "@/lib/api/client";

describe("parseUploadResponse", () => {
  it("reads the URL from the envelope's data string (the API's real shape)", () => {
    expect(
      parseUploadResponse({
        message: "File uploaded successfully",
        data: "https://res.cloudinary.com/x/raw/upload/v1/report.pdf",
        type: "raw",
        size: 2048,
        mime: "application/pdf",
        filename: "report.pdf",
        extension: "pdf",
      }),
    ).toEqual({
      url: "https://res.cloudinary.com/x/raw/upload/v1/report.pdf",
      type: "raw",
      size: 2048,
      mime: "application/pdf",
      filename: "report.pdf",
      extension: "pdf",
    });
  });

  it("accepts a { url } or { secure_url } object in data", () => {
    expect(parseUploadResponse({ data: { url: "https://a" } })?.url).toBe("https://a");
    expect(parseUploadResponse({ data: { secure_url: "https://b" } })?.url).toBe("https://b");
  });

  it("returns null when no URL is present", () => {
    expect(parseUploadResponse({ data: {} })).toBeNull();
    expect(parseUploadResponse(null)).toBeNull();
    expect(parseUploadResponse("nope")).toBeNull();
  });
});
