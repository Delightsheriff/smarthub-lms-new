import { apiClient } from "@/lib/api";
import type { PaginatedResponse } from "@/lib/api/types";
import { ACTIVITY_ENDPOINTS } from "../config/endpoints";
import type { RawActivityItem } from "../types";

class ActivityService {
  async getMyActivity(params?: {
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<RawActivityItem>> {
    return apiClient.getPaginated<RawActivityItem>(ACTIVITY_ENDPOINTS.ME, {
      params,
    });
  }
}

export const activityService = new ActivityService();
