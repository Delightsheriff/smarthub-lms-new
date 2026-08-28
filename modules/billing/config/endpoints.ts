import { LMS_PREFIX } from "@/lib/api/constants";

/**
 * Student-facing billing endpoints, all under `/lms/*`.
 * `summary` powers the dashboard widget; `breakdown` powers the
 * full billing page.
 */
export const BILLING_ENDPOINTS = {
  SUMMARY: `${LMS_PREFIX}/payments/summary`,
  BREAKDOWN: `${LMS_PREFIX}/billing/breakdown`,
  PAYMENTS: `${LMS_PREFIX}/payments`,
} as const;
