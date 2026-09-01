import { apiClient } from "@/lib/api";
import { ACTIVITY_ENDPOINTS } from "../config/endpoints";
import type { PaginatedActivityResponse } from "../types";

class ActivityService {
  async getMyActivity(params?: {
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedActivityResponse> {
    return apiClient.get<PaginatedActivityResponse>(ACTIVITY_ENDPOINTS.ME, {
      params,
    });
  }
}

export const activityService = new ActivityService();
