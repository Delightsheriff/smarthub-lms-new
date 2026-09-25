import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiClient } from "@/lib/api";
import { activityService } from "@/modules/activity/api/activity.service";
import { oreoService } from "@/modules/oreo/api/oreo.service";
import { pushService } from "@/modules/push/api/push.service";
import { webinarsService } from "@/modules/webinars/api/webinars.service";
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

describe("F4 Endpoint contract tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Activity service", () => {
    it("calls getPaginated with /lms/activities/me and pagination params", async () => {
      vi.mocked(apiClient.getPaginated).mockResolvedValueOnce({
        data: [],
        meta: { totalItems: 0, totalPages: 1, currentPage: 1, pageSize: 20 },
      });

      await activityService.getMyActivity({ page: 2, pageSize: 10 });

      expect(apiClient.getPaginated).toHaveBeenCalledWith("/lms/activities/me", {
        params: { page: 2, pageSize: 10 },
      });
    });
  });

  describe("Oreo service", () => {
    it("calls POST /lms/oreo with {question, history, mode} and 120s timeout", async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        answer: "Test answer",
        data: [],
        toolsUsed: [],
      });

      const history = [{ role: "user" as const, content: "Previous question" }];
      await oreoService.ask("New question", history, "student");

      expect(apiClient.post).toHaveBeenCalledWith(
        "/lms/oreo",
        {
          question: "New question",
          history,
          mode: "student",
        },
        { timeout: 120_000 },
      );
    });

    it("calls GET /lms/oreo/usage for usage summary", async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        tokensUsed: 10,
        tokensLimit: 100,
        tokensLeft: 90,
        unlimited: false,
        blocked: false,
        monthStart: "2026-09-01",
      });

      await oreoService.getUsage();

      expect(apiClient.get).toHaveBeenCalledWith("/lms/oreo/usage");
    });
  });

  describe("Push service", () => {
    it("calls GET /push/config", async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        enabled: true,
        publicKey: "vapid-key-test",
      });

      await pushService.config();

      expect(apiClient.get).toHaveBeenCalledWith("/push/config", { silent: true });
    });

    it("calls POST /push/subscribe with surface: lms and subscription payload", async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce(undefined);

      await pushService.subscribe({
        endpoint: "https://push.example.com/sub/123",
        keys: { p256dh: "key-dh", auth: "key-auth" },
      });

      expect(apiClient.post).toHaveBeenCalledWith("/push/subscribe", {
        surface: "lms",
        endpoint: "https://push.example.com/sub/123",
        keys: { p256dh: "key-dh", auth: "key-auth" },
      });
    });

    it("calls DELETE /push/subscribe with endpoint in body (data)", async () => {
      vi.mocked(apiClient.delete).mockResolvedValueOnce(undefined);

      await pushService.unsubscribe("https://push.example.com/sub/123");

      expect(apiClient.delete).toHaveBeenCalledWith("/push/subscribe", {
        data: { endpoint: "https://push.example.com/sub/123" },
      });
    });
  });

  describe("Webinars service", () => {
    it("calls GET /lms/webinars with upcoming sort param", async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce([]);

      await webinarsService.list("upcoming");

      expect(apiClient.get).toHaveBeenCalledWith("/lms/webinars", {
        params: { sort: "upcoming" },
      });
    });

    it("calls getPaginated with /lms/webinars and pagination params for past sort", async () => {
      vi.mocked(apiClient.getPaginated).mockResolvedValueOnce({
        data: [],
        meta: { totalItems: 0, totalPages: 1, currentPage: 1, pageSize: 12 },
      });

      await webinarsService.listPaginated("past", { page: 3, pageSize: 12 });

      expect(apiClient.getPaginated).toHaveBeenCalledWith("/lms/webinars", {
        params: { sort: "past", page: 3, pageSize: 12 },
      });
    });
  });

  describe("Teaching service", () => {
    it("calls PATCH /lms/assignments/:assignmentId/schedules/:scheduleId with patch body", async () => {
      vi.mocked(apiClient.patch).mockResolvedValueOnce({ success: true });

      await teachingService.updateAssignmentSchedule("asgn_123", "sched_456", {
        isVisible: false,
      });

      expect(apiClient.patch).toHaveBeenCalledWith(
        "/lms/assignments/asgn_123/schedules/sched_456",
        { isVisible: false },
        { silent: true },
      );
    });
  });
});

