import { apiClient } from "@/lib/api";
import { HELP_ENDPOINTS } from "../config/endpoints";
import type { ApiHelpResource } from "../types/api.types";

class HelpService {
  /** The library sorted by category, filtered by audience for the
   *  current mode. */
  async getLibrary(mode: "student" | "instructor"): Promise<ApiHelpResource[]> {
    return apiClient.get<ApiHelpResource[]>(HELP_ENDPOINTS.BASE, {
      params: { mode },
    });
  }
}

export const helpService = new HelpService();