import { apiClient } from "@/lib/api";
import { PROGRESS_ENDPOINTS } from "../config/endpoints";
import type { Achievement, ProgressPulse } from "../types";

class ProgressService {
  async getAchievements(): Promise<Achievement[]> {
    return apiClient.get<Achievement[]>(PROGRESS_ENDPOINTS.ACHIEVEMENTS, { silent: true });
  }

  async getPulse(): Promise<ProgressPulse> {
    return apiClient.get<ProgressPulse>(PROGRESS_ENDPOINTS.PULSE, { silent: true });
  }
}

export const progressService = new ProgressService();
