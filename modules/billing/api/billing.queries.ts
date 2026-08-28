"use client";
import { useQuery } from "@tanstack/react-query";
import { billingService } from "./billing.service";
import { normaliseBreakdown } from "./normalise";
import type { BillingBreakdown } from "../types";
import type { ApiBillingSummary } from "../types/api.types";

export const BILLING_QUERY_KEYS = {
  summary: ["billing", "summary"] as const,
  breakdown: ["billing", "breakdown"] as const,
} as const;

/**
 * @deprecated Reads `/lms/payments/summary` which counts ALL
 * registrations regardless of stage — diverges from the canonical
 * `useBillingBreakdown()`. New surfaces MUST read
 * `useBillingBreakdown().data.overall`.
 */
export function useBillingSummary() {
  return useQuery<ApiBillingSummary>({
    queryKey: BILLING_QUERY_KEYS.summary,
    queryFn: () => billingService.getSummary(),
  });
}

export function useBillingBreakdown() {
  return useQuery<BillingBreakdown>({
    queryKey: BILLING_QUERY_KEYS.breakdown,
    queryFn: async () => {
      const raw = await billingService.getBreakdown();
      return normaliseBreakdown(raw);
    },
  });
}
