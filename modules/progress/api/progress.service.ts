import { apiClient } from "@/lib/api";
import { PROGRESS_ENDPOINTS } from "../config/endpoints";
import type {
  Achievement,
  CohortPulse,
  ProgressSnapshot,
} from "../types";

class ProgressService {
  async pulse(): Promise<ProgressSnapshot> {
    return apiClient.get<ProgressSnapshot>(PROGRESS_ENDPOINTS.PULSE);
  }
  async achievements(): Promise<Achievement[]> {
    return apiClient.get<Achievement[]>(PROGRESS_ENDPOINTS.ACHIEVEMENTS);
  }
  async cohortPulse(): Promise<CohortPulse[]> {
    return apiClient.get<CohortPulse[]>(PROGRESS_ENDPOINTS.COHORT_PULSE);
  }
}

export const progressService = new ProgressService();
