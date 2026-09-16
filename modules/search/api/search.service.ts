import { apiClient } from "@/lib/api/client";
import { SEARCH_ENDPOINTS } from "../config/endpoints";
import type { SearchGroup } from "../types";

/**
 * Only axios caller for the search module. Passes an AbortSignal so
 * TanStack can cancel a superseded request while the student keeps
 * typing — no stale response ever wins the race. Results are already
 * enrolment-scoped and mode-aware server-side.
 */
class SearchService {
  async query(q: string, _signal?: AbortSignal): Promise<SearchGroup[]> {
    const data = await apiClient.get<SearchGroup[]>(
      SEARCH_ENDPOINTS.QUERY,
      { params: { q }, silent: true }
    );
    return data || [];
  }
}

export const searchService = new SearchService();
