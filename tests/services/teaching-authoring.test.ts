import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiClient } from "@/lib/api";
import { teachingService } from "@/modules/teaching/api/teaching.service";

vi.mock("@/lib/api", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

// Paths/verbs mirror smarthub-api lms-routes (assignments, recordings,
// materials, teaching). A drift here is a request the API will 404.
describe("teaching authoring contracts", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates and patches assignments on /lms/assignments", async () => {
    await teachingService.createAssignment({ title: "T", module: "m1" });
    expect(apiClient.post).toHaveBeenCalledWith("/lms/assignments", {
      title: "T",
      module: "m1",
    });
    await teachingService.updateAssignment("a1", { title: "U" });
    expect(apiClient.patch).toHaveBeenCalledWith("/lms/assignments/a1", {
      title: "U",
    });
  });

  it("attaches, edits and detaches an assignment per cohort", async () => {
    await teachingService.attachAssignmentToSchedule("a1", "s1", {
      dueDate: "2026-10-01T00:00:00.000Z",
    });
    expect(apiClient.post).toHaveBeenCalledWith(
      "/lms/assignments/a1/schedules/s1",
      { dueDate: "2026-10-01T00:00:00.000Z" },
    );
    await teachingService.updateAssignmentSchedule("a1", "s1", {
      isVisible: false,
    });
    expect(apiClient.patch).toHaveBeenCalledWith(
      "/lms/assignments/a1/schedules/s1",
      { isVisible: false },
    );
    await teachingService.detachAssignmentFromSchedule("a1", "s1");
    expect(apiClient.delete).toHaveBeenCalledWith(
      "/lms/assignments/a1/schedules/s1",
    );
  });

  it("uses PUT for recording and material updates", async () => {
    await teachingService.updateRecording("r1", { title: "R" });
    expect(apiClient.put).toHaveBeenCalledWith("/lms/recordings/r1", {
      title: "R",
    });
    await teachingService.updateMaterial("m1", { title: "M" });
    expect(apiClient.put).toHaveBeenCalledWith("/lms/materials/m1", {
      title: "M",
    });
  });

  it("attaches and detaches recordings per cohort", async () => {
    await teachingService.attachRecordingToSchedule("r1", "s1");
    expect(apiClient.post).toHaveBeenCalledWith(
      "/lms/recordings/r1/schedules/s1",
      {},
    );
    await teachingService.detachRecordingFromSchedule("r1", "s1");
    expect(apiClient.delete).toHaveBeenCalledWith(
      "/lms/recordings/r1/schedules/s1",
    );
  });

  it("reads the module library and cohort slack status", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce([]);
    await teachingService.getModuleAssignments("mod1");
    expect(apiClient.get).toHaveBeenCalledWith(
      "/lms/teaching/modules/mod1/assignments",
    );
    vi.mocked(apiClient.get).mockResolvedValueOnce(undefined);
    await expect(teachingService.getCohortSlackStatus("s1")).resolves.toEqual({
      connected: false,
    });
  });
});
