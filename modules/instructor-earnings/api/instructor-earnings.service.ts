import { apiClient } from "@/lib/api";
import { INSTRUCTOR_EARNINGS_ENDPOINTS } from "../config/endpoints";
import type { BreakdownCohort, InstructorEarnings } from "../types";

/**
 * Thin wrapper around the read-only instructor earnings surface.
 * The LMS bearer token (attached by the shared apiClient interceptor)
 * gates the request; the API resolves "me" from it. GET stays silent —
 * the page renders its own loading / empty / error states.
 */
class InstructorEarningsService {
  async getMine(): Promise<InstructorEarnings> {
    const data = await apiClient.get<InstructorEarnings | undefined>(
      INSTRUCTOR_EARNINGS_ENDPOINTS.ME,
    );
    return (
      data ?? {
        totals: { pendingNaira: 0, processingNaira: 0, paidNaira: 0 },
        cohorts: [],
        payouts: [],
      }
    );
  }

  async getMineBreakdown(): Promise<BreakdownCohort[]> {
    const data = await apiClient.get<BreakdownCohort[] | undefined>(
      INSTRUCTOR_EARNINGS_ENDPOINTS.BREAKDOWN,
    );
    return data ?? [];
  }
}

export const instructorEarningsService = new InstructorEarningsService();