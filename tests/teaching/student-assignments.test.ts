import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiClient } from "@/lib/api";
import { teachingService } from "@/modules/teaching/api/teaching.service";

vi.mock("@/lib/api", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    getPaginated: vi.fn(),
  },
}));

describe("Teaching Service - Student Assignments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls GET /lms/teaching/cohorts/:scheduleId/students/:studentId/assignments", async () => {
    const mockData = {
      courseId: "c_1",
      courseName: "Web Development",
      scopedEnrollment: true,
      summary: {
        total: 5,
        submitted: 3,
        graded: 2,
        missing: 2,
        pending: 1,
        late: 0,
        averagePercentage: 85,
      },
      assignments: [],
      student: { id: "u_1", name: "Jane Doe" },
    };

    vi.mocked(apiClient.get).mockResolvedValueOnce(mockData);

    const result = await teachingService.getCohortStudentAssignments("sched_1", "u_1");

    expect(apiClient.get).toHaveBeenCalledWith(
      "/lms/teaching/cohorts/sched_1/students/u_1/assignments",
    );
    expect(result).toEqual(mockData);
  });
});
