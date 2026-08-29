import { apiClient, uploadFile } from "@/lib/api";
import { SCHOLARSHIP_ENDPOINTS } from "../config/endpoints";
import type {
  ApiScholarshipApplication,
  ApiScholarshipBanner,
} from "../types/api.types";

class TechScholarshipService {
  /** The applicant's scholarship, or null when not a (awarded) scholar. */
  async getMine(): Promise<ApiScholarshipApplication | null> {
    return apiClient.get<ApiScholarshipApplication | null>(
      SCHOLARSHIP_ENDPOINTS.ME,
    );
  }

  /** The share-ready banner bundle. `force` regenerates the images. */
  async getBanner(force = false): Promise<ApiScholarshipBanner> {
    return apiClient.get<ApiScholarshipBanner>(
      SCHOLARSHIP_ENDPOINTS.BANNER,
      { params: { force } },
    );
  }

  /** Upload a portrait via the storage seam, then persist it on the
   *  application so the banner can use it. */
  async updatePhoto(file: File): Promise<void> {
    const imageUrl = await uploadFile(file);
    if (!imageUrl) {
      throw new Error("Upload succeeded but no URL was returned");
    }
    await apiClient.patch(SCHOLARSHIP_ENDPOINTS.PHOTO, { imageUrl });
  }
}

export const techScholarshipService = new TechScholarshipService();