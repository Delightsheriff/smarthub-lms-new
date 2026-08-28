import { describe, expect, it } from "vitest";
import { normaliseMaterial } from "@/modules/learning/api/normalise";

describe("normaliseMaterial", () => {
  it("maps a pdf mime to type 'pdf'", () => {
    const m = normaliseMaterial({
      _id: "mat_1",
      title: "Syllabus",
      fileType: "application/pdf",
    });
    expect(m.type).toBe("pdf");
  });

  it("maps a PowerPoint mime to type 'slide'", () => {
    const m = normaliseMaterial({
      _id: "mat_1",
      title: "Deck",
      fileType:
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    });
    expect(m.type).toBe("slide");
  });

  it("treats any external http file URL without a known mime as a 'link'", () => {
    const m = normaliseMaterial({
      _id: "mat_1",
      title: "Article",
      fileUrl: "https://external.com/notes",
    });
    expect(m.type).toBe("link");
  });

  it("defaults a Cloudinary-hosted file to 'pdf' when the mime is unknown", () => {
    const m = normaliseMaterial({
      _id: "mat_1",
      title: "Unknown",
      fileUrl: "https://res.cloudinary.com/x/image/upload/v1/file.weird",
    });
    expect(m.type).toBe("pdf");
  });

  it("formats file size in bytes", () => {
    const m = normaliseMaterial({
      _id: "mat_1",
      title: "Tiny",
      fileSize: 512,
    });
    expect(m.size).toBe("512 B");
  });

  it("formats file size in kilobytes", () => {
    const m = normaliseMaterial({
      _id: "mat_1",
      title: "Mid",
      fileSize: 2048,
    });
    expect(m.size).toBe("2.0 KB");
  });

  it("formats file size in megabytes", () => {
    const m = normaliseMaterial({
      _id: "mat_1",
      title: "Big",
      fileSize: 5 * 1024 * 1024,
    });
    expect(m.size).toBe("5.0 MB");
  });

  it("leaves size undefined when no fileSize is present", () => {
    const m = normaliseMaterial({ _id: "mat_1", title: "No size" });
    expect(m.size).toBeUndefined();
  });

  it("falls back to a single legacy link when links are absent but a fileUrl exists", () => {
    const m = normaliseMaterial({
      _id: "mat_1",
      title: "File",
      fileUrl: "https://example.com/f.pdf",
    });
    expect(m.links).toEqual([
      { name: "Link 1", url: "https://example.com/f.pdf" },
    ]);
  });
});
