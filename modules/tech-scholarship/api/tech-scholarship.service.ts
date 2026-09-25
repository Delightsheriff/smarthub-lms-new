import { apiClient, ApiError, uploadFile } from "@/lib/api";
import { SCHOLARSHIP_ENDPOINTS } from "../config/endpoints";
import type {
  ApiScholarshipApplication,
  ApiScholarshipBanner,
} from "../types/api.types";

class TechScholarshipService {
  /**
   * The caller's scholarship application, or null when they've never
   * applied. The API returns `data: null` for that case; a 404 is also
   * treated as null so the dashboard card stays invisible for plain LMS
   * students instead of surfacing an error. Silent: this runs on every
   * app entry (the photo gate) and a failure must never toast.
   */
  async getMine(): Promise<ApiScholarshipApplication | null> {
    try {
      const data = await apiClient.get<ApiScholarshipApplication | null>(
        SCHOLARSHIP_ENDPOINTS.ME,
        { silent: true },
      );
      return data ?? null;
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return null;
      throw err;
    }
  }

  /** The share-ready banner bundle. `force` regenerates the images.
   *  409s ("no photo" / "not awarded yet") — callers treat that as the
   *  "add a photo" state, so it's silent. */
  async getBanner(force = false): Promise<ApiScholarshipBanner> {
    return apiClient.get<ApiScholarshipBanner>(SCHOLARSHIP_ENDPOINTS.BANNER, {
      params: force ? { force: true } : undefined,
      silent: true,
    });
  }

  /** Upload an (already cropped) portrait, then persist it on the
   *  application. The API also stores it as `User.imageUrl` and clears the
   *  cached banner. Returns the uploaded URL. Both calls are silent so the
   *  caller shows one toast for the whole flow, not one per request. */
  async updatePhoto(file: File): Promise<string> {
    const imageUrl = await uploadFile(file, { silent: true });
    await apiClient.patch(
      SCHOLARSHIP_ENDPOINTS.PHOTO,
      { imageUrl },
      { silent: true },
    );
    return imageUrl;
  }
}

export const techScholarshipService = new TechScholarshipService();
