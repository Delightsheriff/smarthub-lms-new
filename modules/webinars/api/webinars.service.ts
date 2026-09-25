import { apiClient } from "@/lib/api";
import type { PaginatedResponse } from "@/lib/api/types";
import { WEBINAR_ENDPOINTS } from "../config/endpoints";
import type { ApiWebinar } from "../types/api.types";

class WebinarsService {
  async list(sort: "upcoming" | "past"): Promise<ApiWebinar[]> {
    return apiClient.get<ApiWebinar[]>(WEBINAR_ENDPOINTS.LIST, {
      params: { sort },
    });
  }

  async listPaginated(
    sort: "upcoming" | "past",
    { page, pageSize }: { page: number; pageSize: number },
  ): Promise<PaginatedResponse<ApiWebinar>> {
    return apiClient.getPaginated<ApiWebinar>(WEBINAR_ENDPOINTS.LIST, {
      params: { sort, page, pageSize },
    });
  }
}

export const webinarsService = new WebinarsService();
