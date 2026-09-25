import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiClient } from "@/lib/api";
import { assignmentsService } from "@/modules/assignments/api/assignments.service";

vi.mock("@/lib/api", () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe("assignmentsService.getMySubmission", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("extracts the embedded submission from GET /lms/assignments/:id", async () => {
    const mockSubmission = {
      _id: "sub_123",
      assignment: "asgn_1",
      status: "submitted",
      files: [],
      score: null,
      submittedAt: "2026-09-20T10:00:00Z",
    };

    vi.mocked(apiClient.get).mockResolvedValueOnce({
      _id: "asgn_1",
      title: "Research Paper",
      submission: mockSubmission,
    });

    const res = await assignmentsService.getMySubmission("asgn_1");

    expect(apiClient.get).toHaveBeenCalledWith("/lms/assignments/asgn_1");
    expect(res).toEqual(mockSubmission);
  });

  it("returns null when no submission is embedded on the assignment", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      _id: "asgn_2",
      title: "Homework 1",
    });

    const res = await assignmentsService.getMySubmission("asgn_2");

    expect(apiClient.get).toHaveBeenCalledWith("/lms/assignments/asgn_2");
    expect(res).toBeNull();
  });
});
