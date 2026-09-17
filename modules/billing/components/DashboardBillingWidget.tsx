"use client";
import Link from "next/link";
import { ArrowRight, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";
import { useBillingBreakdown } from "../api/billing.queries";

/**
 * Compact billing nudge under the dashboard welcome card. Hidden
 * when the student has no outstanding balance — we don't add noise
 * for fully-paid students.
 *
 * Reads from `useBillingBreakdown()` (same hook as the /billing page)
 * so the dashboard widget and the dedicated billing surface share one
 * source of truth.
 */
export function DashboardBillingWidget() {
  const { data, isLoading } = useBillingBreakdown();

  if (isLoading) {
    return <Skeleton className="h-[76px] w-full rounded-2xl" />;
  }

  if (!data) return null;
  const totalDue = data.overall.totalDue;
  if (!totalDue || totalDue <= 0) return null;

  return (
    <Card className="rounded-2xl border-warning/30 bg-warning/5 p-4 md:p-5 shadow-sm hover:border-warning/50 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-warning/15 text-warning">
            <CreditCard className="h-4 w-4" />
          </div>
          <div className="min-w-0 space-y-0.5">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
              Outstanding balance
            </p>
            <p className="text-base font-semibold tabular-nums text-foreground">
              {formatPrice(totalDue)}
            </p>
          </div>
        </div>
        <Button
          render={<Link href="/billing" />}
          size="sm"
          variant="outline"
          className="shrink-0"
        >
          View billing <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </Card>
  );
}
