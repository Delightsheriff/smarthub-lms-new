"use client";

import Link from "next/link";
import { AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate, formatPrice } from "@/lib/utils";
import { useMyInstallmentPlans } from "../api/payment-proofs.queries";

/**
 * The persistent nudge while a payment is late but access is still open.
 *
 * Only shown during grace — once access is actually suspended the
 * paywall screen takes over. Silent when nothing is overdue, so a scholar
 * who's up to date never sees a payment reminder.
 *
 * Rendered inside the LMS shell, so it follows the learner around rather
 * than living only on the payments page they may never open.
 */
export function PaymentStatusBanner() {
  const { data: plans } = useMyInstallmentPlans();

  const overdue = (plans ?? []).find(
    (p) =>
      p.accessStatus === "active" &&
      p.nextDue &&
      p.nextDue.status === "overdue",
  );
  if (!overdue?.nextDue) return null;

  const { nextDue } = overdue;
  const pausesOn = nextDue.graceEndsAt;

  return (
    <div className="border-b border-warning/20 bg-warning/10">
      <div className="flex w-full flex-wrap items-center gap-x-3 gap-y-2 px-4 sm:px-6 lg:px-8 py-2.5 text-sm">
        <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
        <p className="min-w-0 flex-1 text-foreground">
          <span className="font-medium">
            Payment {nextDue.sequence} · {formatPrice(nextDue.amount)}
          </span>{" "}
          is past due.
          {pausesOn ? (
            <>
              {" "}
              <Clock className="mr-0.5 inline h-3 w-3" />
              Your access pauses on {formatDate(pausesOn, "long")}.
            </>
          ) : null}
        </p>
        <Button
          size="sm"
          className="shrink-0"
          nativeButton={false} render={<Link href="/payments" />}
        >
          Make a payment
        </Button>
      </div>
    </div>
  );
}
