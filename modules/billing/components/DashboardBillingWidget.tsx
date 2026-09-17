"use client";
import { NagItem } from "@/components/ui/ledger";
import { formatPrice } from "@/lib/utils";
import { useBillingBreakdown } from "../api/billing.queries";

/**
 * Billing nudge in the dashboard's "Needs a look" ledger. Hidden
 * when the student has no outstanding balance — we don't add noise
 * for fully-paid students.
 *
 * Reads from `useBillingBreakdown()` (same hook as the /billing page)
 * so the dashboard widget and the dedicated billing surface share one
 * source of truth.
 */
export function DashboardBillingWidget() {
  const { data, isLoading } = useBillingBreakdown();

  if (isLoading || !data) return null;
  const totalDue = data.overall.totalDue;
  if (!totalDue || totalDue <= 0) return null;

  return (
    <NagItem
      tone="due"
      title={`${formatPrice(totalDue)} outstanding`}
      meta="Billing"
      href="/billing"
      cta="View →"
    />
  );
}
