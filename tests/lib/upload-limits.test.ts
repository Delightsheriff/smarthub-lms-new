import { describe, expect, it } from "vitest";
import { formatFileSize, uploadSizeError } from "@/lib/utils";

const MB = 1024 * 1024;

describe("uploadSizeError", () => {
  it("caps documents at 10 MB", () => {
    expect(uploadSizeError({ type: "application/pdf", size: 10 * MB })).toBeNull();
    expect(uploadSizeError({ type: "application/pdf", size: 10 * MB + 1 })).toBe(
      "File is larger than 10 MB.",
    );
  });

  it("allows media up to 25 MB", () => {
    expect(uploadSizeError({ type: "video/mp4", size: 20 * MB })).toBeNull();
    expect(uploadSizeError({ type: "image/png", size: 26 * MB })).toBe(
      "File is larger than 25 MB.",
    );
  });
});

describe("formatFileSize", () => {
  it("formats bytes, KB and MB", () => {
    expect(formatFileSize(512)).toBe("512 B");
    expect(formatFileSize(2048)).toBe("2.0 KB");
    expect(formatFileSize(3 * MB)).toBe("3.0 MB");
  });
});
