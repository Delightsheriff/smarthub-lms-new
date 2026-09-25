import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient, ApiError } from "@/lib/api";
import { techScholarshipService } from "@/modules/tech-scholarship/api/tech-scholarship.service";
import {
  isActiveScholar,
  scholarshipTierLabel,
  scholarshipTrackLabel,
} from "@/modules/tech-scholarship/types";
import type { ApiScholarshipApplication } from "@/modules/tech-scholarship/types/api.types";

vi.mock("@/lib/api", async () => {
  const { ApiError } = await import("@/lib/api/types");
  return {
    ApiError,
    apiClient: { get: vi.fn(), patch: vi.fn() },
    uploadFile: vi.fn(),
  };
});

const app = (
  stage: ApiScholarshipApplication["stage"],
): ApiScholarshipApplication => ({
  _id: "a1",
  cohort: "2026-W1",
  track: "web-dev",
  stage,
});

describe("scholarship labels", () => {
  it("uses the backend seed track labels", () => {
    expect(scholarshipTrackLabel("ai-engineering")).toBe("AI Engineering");
    expect(scholarshipTrackLabel("product-design")).toBe("Product Design");
    expect(scholarshipTrackLabel("devops")).toBe("DevOps Engineering");
  });

  it("humanises unknown track and tier keys", () => {
    expect(scholarshipTrackLabel("cloud-native_ops")).toBe("Cloud native ops");
    expect(scholarshipTierLabel("gold-tier")).toBe("Gold tier");
    expect(scholarshipTierLabel("standard")).toBe("Standard scholarship");
    expect(scholarshipTierLabel(null)).toBeUndefined();
  });
});

describe("isActiveScholar", () => {
  it("is true only for admitted and enrolled", () => {
    expect(isActiveScholar(app("admitted"))).toBe(true);
    expect(isActiveScholar(app("enrolled"))).toBe(true);
    expect(isActiveScholar(app("applied"))).toBe(false);
    expect(isActiveScholar(app("rejected"))).toBe(false);
    expect(isActiveScholar(app("withdrawn"))).toBe(false);
    expect(isActiveScholar(null)).toBe(false);
  });
});

describe("techScholarshipService.getMine", () => {
  beforeEach(() => vi.clearAllMocks());

  it("is silent and returns the application", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce(app("enrolled"));
    await expect(techScholarshipService.getMine()).resolves.toMatchObject({
      stage: "enrolled",
    });
    expect(apiClient.get).toHaveBeenCalledWith("/scholarship-applications/me", {
      silent: true,
    });
  });

  it("treats a 404 as not a scholar", async () => {
    vi.mocked(apiClient.get).mockRejectedValueOnce(new ApiError("Not found", 404));
    await expect(techScholarshipService.getMine()).resolves.toBeNull();
  });

  it("rethrows other failures", async () => {
    vi.mocked(apiClient.get).mockRejectedValueOnce(new ApiError("Boom", 500));
    await expect(techScholarshipService.getMine()).rejects.toThrow("Boom");
  });
});
