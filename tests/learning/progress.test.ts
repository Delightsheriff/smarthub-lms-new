import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiClient } from "@/lib/api";
import { learningService } from "@/modules/learning/api/learning.service";

vi.mock("@/lib/api", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("Learning progress service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches course-scoped progress via GET /lms/progress?courseId=...", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce([
      { contentType: "recording", contentId: "rec_1", completedAt: "2026-09-25T12:00:00Z" },
    ]);

    const result = await learningService.getCourseProgress("course_123");

    expect(apiClient.get).toHaveBeenCalledWith("/lms/progress", {
      params: { courseId: "course_123" },
    });
    expect(result).toHaveLength(1);
    expect(result[0].contentId).toBe("rec_1");
  });

  it("fetches all progress cross-course via GET /lms/progress", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce([
      { contentType: "recording", contentId: "rec_1", completedAt: "2026-09-25T12:00:00Z" },
      { contentType: "material", contentId: "mat_1", completedAt: "2026-09-25T12:05:00Z" },
    ]);

    const result = await learningService.getAllProgress();

    expect(apiClient.get).toHaveBeenCalledWith("/lms/progress");
    expect(result).toHaveLength(2);
  });

  it("marks content complete via POST /lms/progress with courseId, contentType, contentId", async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({});

    await learningService.markContentComplete({
      courseId: "course_123",
      contentType: "recording",
      contentId: "rec_1",
    });

    expect(apiClient.post).toHaveBeenCalledWith("/lms/progress", {
      courseId: "course_123",
      contentType: "recording",
      contentId: "rec_1",
    });
  });

  it("un-marks content complete via DELETE /lms/progress with data: { contentType, contentId }", async () => {
    vi.mocked(apiClient.delete).mockResolvedValueOnce({});

    await learningService.unmarkContentComplete({
      contentType: "recording",
      contentId: "rec_1",
    });

    expect(apiClient.delete).toHaveBeenCalledWith("/lms/progress", {
      data: {
        contentType: "recording",
        contentId: "rec_1",
      },
    });
  });
});
