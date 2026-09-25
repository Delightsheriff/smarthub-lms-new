import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/api/client";
import { jobsService } from "@/modules/jobs/api/jobs.service";

vi.mock("@/lib/api/client", () => ({
  apiClient: { get: vi.fn() },
}));

describe("jobsService.companies", () => {
  beforeEach(() => vi.clearAllMocks());

  it("falls back to [] when the API sends data: null", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce(null);
    await expect(jobsService.companies()).resolves.toEqual([]);
  });

  it("returns the company list", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce(["Acme", "Globex"]);
    await expect(jobsService.companies()).resolves.toEqual(["Acme", "Globex"]);
  });
});
