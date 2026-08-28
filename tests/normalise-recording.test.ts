import { describe, expect, it } from "vitest";
import { normaliseRecording } from "@/modules/learning/api/normalise";

describe("normaliseRecording", () => {
  it("formats a sub-minute duration as seconds", () => {
    const r = normaliseRecording({
      _id: "rec_1",
      title: "Intro",
      duration: 45,
    });
    expect(r.durationLabel).toBe("45 s");
  });

  it("formats a minute+ duration as minutes (rounded)", () => {
    const r = normaliseRecording({
      _id: "rec_1",
      title: "Long session",
      duration: 95,
    });
    expect(r.durationLabel).toBe("2 min");
  });

  it("prefers an explicit durationLabel over a computed one", () => {
    const r = normaliseRecording({
      _id: "rec_1",
      title: "Mixed",
      duration: 600,
      durationLabel: "10 min",
    });
    expect(r.durationLabel).toBe("10 min");
  });

  it("falls back to an empty label when no duration is present", () => {
    const r = normaliseRecording({ _id: "rec_1", title: "No duration" });
    expect(r.durationLabel).toBe("");
  });

  it("coerces watched and isLocked flags to booleans", () => {
    const r = normaliseRecording({
      _id: "rec_1",
      title: "Flags",
      watched: true,
      isLockedForViewer: true,
    });
    expect(r.watched).toBe(true);
    expect(r.isLocked).toBe(true);
  });

  it("defaults missing flags to false", () => {
    const r = normaliseRecording({ _id: "rec_1", title: "Flags" });
    expect(r.watched).toBe(false);
    expect(r.isLocked).toBe(false);
  });

  it("uses publishedAt when present, otherwise createdAt", () => {
    const fromPublished = normaliseRecording({
      _id: "a",
      title: "A",
      publishedAt: "2026-01-01",
    });
    const fromCreated = normaliseRecording({
      _id: "b",
      title: "B",
      createdAt: "2026-02-02",
    });
    expect(fromPublished.publishedAt).toBe("2026-01-01");
    expect(fromCreated.publishedAt).toBe("2026-02-02");
  });

  it("falls back to a single legacy link when links are absent but a videoUrl exists", () => {
    const r = normaliseRecording({
      _id: "rec_1",
      title: "Linked",
      videoUrl: "https://example.com/v.mp4",
    });
    expect(r.links).toEqual([
      { name: "Link 1", url: "https://example.com/v.mp4" },
    ]);
  });

  it("preserves explicit links over a legacy videoUrl", () => {
    const r = normaliseRecording({
      _id: "rec_1",
      title: "Explicit",
      videoUrl: "https://example.com/v.mp4",
      links: [{ name: "Slides", url: "https://example.com/s.pdf" }],
    });
    expect(r.links).toEqual([
      { name: "Slides", url: "https://example.com/s.pdf" },
    ]);
  });
});
