import { apiClient } from "@/lib/api";
import { BILLING_ENDPOINTS } from "../config/endpoints";
import type {
  ApiBillingBreakdown,
  ApiBillingSummary,
} from "../types/api.types";

class BillingService {
  /** Lightweight rollup for the dashboard widget. */
  async getSummary(): Promise<ApiBillingSummary> {
    return apiClient.get<ApiBillingSummary>(BILLING_ENDPOINTS.SUMMARY);
  }

  /** Per-registration breakdown for the /billing page. */
  async getBreakdown(): Promise<ApiBillingBreakdown> {
    return apiClient.get<ApiBillingBreakdown>(BILLING_ENDPOINTS.BREAKDOWN);
  }
}

export const billingService = new BillingService();
