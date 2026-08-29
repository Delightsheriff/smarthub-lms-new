"use client";
import { CheckCircle2, CreditCard } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn, formatPrice } from "@/lib/utils";
import type { BillingBreakdown } from "../types";

interface BillingSummaryCardProps {
  overall: BillingBreakdown["overall"];
}

/**
 * Headline rollup: total paid + outstanding + progress + next-due.
 * The "Contact admin to pay" CTA is a stub — payment collection
 * (Paystack / etc.) is a separate plan.
 */
export function BillingSummaryCard({ overall }: BillingSummaryCardProps) {
  const fullyPaid = overall.totalDue <= 0 && overall.totalAmount > 0;
  const hasDiscount = !!overall.totalDiscount && overall.totalDiscount > 0;

  return (
    <Card
      className={cn(
        "p-5 space-y-4 md:p-6",
        fullyPaid
          ? "border-success/20 bg-gradient-to-br from-success/10 via-background to-success/5"
          : "border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <p className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
            <CreditCard className="h-3 w-3" />
            Billing summary
          </p>
          <h2 className="text-xl font-semibold tabular-nums md:text-2xl">
            {formatPrice(overall.totalPaid)}
            <span className="text-sm font-medium text-muted-foreground">
              {" / "}
              {formatPrice(overall.totalAmount)}
            </span>
          </h2>
          {fullyPaid ? (
            <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-success">
              <CheckCircle2 className="h-4 w-4" />
              Paid in full
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {formatPrice(overall.totalDue)} outstanding
            </p>
          )}
        </div>
        {!fullyPaid && (
          <Button
            size="sm"
            className="shrink-0"
            render={
              <a
                href="mailto:info@smart-hub.academy?subject=Payment%20enquiry"
                rel="noopener noreferrer"
              />
            }
          >
            Contact admin to pay
          </Button>
        )}
      </div>

      {hasDiscount && (
        <p className="text-xs font-medium text-success">
          You saved {formatPrice(overall.totalDiscount)} with discounts
        </p>
      )}

      {!fullyPaid && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Overall progress</span>
            <span className="font-bold tabular-nums">
              {overall.paymentProgress}%
            </span>
          </div>
          <Progress value={overall.paymentProgress} />
        </div>
      )}
    </Card>
  );
}
