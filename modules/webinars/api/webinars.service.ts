import { apiClient } from "@/lib/api";
import { WEBINAR_ENDPOINTS } from "../config/endpoints";
import type {
  ApiWebinar,
  PaginatedWebinarsResponse,
} from "../types/api.types";

class WebinarsService {
  async list(sort: "upcoming" | "past"): Promise<ApiWebinar[]> {
    return apiClient.get<ApiWebinar[]>(
      `${WEBINAR_ENDPOINTS.LIST}?sort=${sort}`,
    );
  }

  async listPaginated(
    sort: "upcoming" | "past",
    { page, pageSize }: { page: number; pageSize: number },
  ): Promise<{ data: ApiWebinar[]; meta: PaginatedWebinarsResponse["meta"] }> {
    const res = await apiClient.get<PaginatedWebinarsResponse>(
      `${WEBINAR_ENDPOINTS.LIST}?sort=${sort}&page=${page}&pageSize=${pageSize}`,
    );
    return {
      data: res.data || [],
      meta: res.meta,
    };
  }
}

export const webinarsService = new WebinarsService();
