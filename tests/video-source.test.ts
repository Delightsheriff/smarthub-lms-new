import { describe, expect, it } from "vitest";
import { classifyVideoUrl } from "@/modules/learning/utils/video-source";

describe("classifyVideoUrl", () => {
  it("classifies a direct mp4 file as kind 'video'", () => {
    expect(
      classifyVideoUrl("https://res.cloudinary.com/x/video/upload/v1/a.mp4"),
    ).toEqual({
      kind: "video",
      src: "https://res.cloudinary.com/x/video/upload/v1/a.mp4",
    });
  });

  it("classifies a webm file as kind 'video'", () => {
    expect(classifyVideoUrl("https://cdn.example.com/lesson.webm")).toEqual({
      kind: "video",
      src: "https://cdn.example.com/lesson.webm",
    });
  });

  it("builds a nocookie YouTube embed from a watch URL", () => {
    expect(classifyVideoUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toEqual(
      {
        kind: "youtube",
        src: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0",
      },
    );
  });

  it("supports youtu.be short links", () => {
    expect(classifyVideoUrl("https://youtu.be/dQw4w9WgXcQ")).toEqual({
      kind: "youtube",
      src: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0",
    });
  });

  it("rewrites an existing embed URL to the nocookie host", () => {
    expect(
      classifyVideoUrl("https://www.youtube.com/embed/dQw4w9WgXcQ"),
    ).toEqual({
      kind: "youtube",
      src: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    });
  });

  it("builds a Vimeo player embed from a /video/id URL", () => {
    expect(classifyVideoUrl("https://vimeo.com/video/123456789")).toEqual({
      kind: "vimeo",
      src: "https://player.vimeo.com/video/123456789",
    });
  });

  it("builds a Drive preview URL from a /file/d/.../view URL", () => {
    expect(
      classifyVideoUrl(
        "https://drive.google.com/file/d/AbC123XYZ/view?usp=sharing",
      ),
    ).toEqual({
      kind: "drive",
      src: "https://drive.google.com/file/d/AbC123XYZ/preview",
    });
  });

  it("falls back to 'external' for an unrecognised URL", () => {
    expect(classifyVideoUrl("https://example.com/some/page")).toEqual({
      kind: "external",
      src: "https://example.com/some/page",
    });
  });

  it("falls back to 'external' when a YouTube URL has no video id", () => {
    expect(classifyVideoUrl("https://youtube.com/channel/abc")).toEqual({
      kind: "external",
      src: "https://youtube.com/channel/abc",
    });
  });

  it("falls back to 'external' when a Drive URL is not a file share", () => {
    expect(classifyVideoUrl("https://drive.google.com/drive/folders/abc")).toEqual(
      {
        kind: "external",
        src: "https://drive.google.com/drive/folders/abc",
      },
    );
  });
});
