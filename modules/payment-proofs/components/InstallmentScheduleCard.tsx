"use client";

import { CalendarClock, CheckCircle2, CircleDot, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate, formatPrice } from "@/lib/utils";
import type {
  MyInstallmentPlanUi,
  PlanTrancheUi,
} from "../types";

const trancheTone = (t: PlanTrancheUi) => {
  if (t.status === "paid" || t.status === "waived")
    return "border-success/25 bg-success/5";
  if (t.status === "overdue") return "border-warning/30 bg-warning/5";
  return "border-border bg-muted/20";
};

const TrancheIcon = ({ status }: { status: PlanTrancheUi["status"] }) => {
  if (status === "paid" || status === "waived")
    return <CheckCircle2 className="h-4 w-4 text-success" />;
  if (status === "overdue")
    return <Clock className="h-4 w-4 text-warning" />;
  return <CircleDot className="h-4 w-4 text-muted-foreground" />;
};

/**
 * The learner's fee, broken into what's paid and what's still coming.
 *
 * Shows every tranche rather than only the next one: the point of a plan
 * is being able to see the whole commitment. "Pay this" hands the tranche
 * up to the submit form rather than opening its own — one payment form on
 * the page, prefilled.
 */
export function InstallmentScheduleCard({
  plan,
  onPayTranche,
}: {
  plan: MyInstallmentPlanUi;
  onPayTranche?: (tranche: PlanTrancheUi, plan: MyInstallmentPlanUi) => void;
}) {
  const settled = plan.amountDue <= 0;
  const paidPct =
    plan.totalAmount > 0
      ? Math.min(100, Math.round((plan.paidAmount / plan.totalAmount) * 100))
      : 0;

  return (
    <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Payment plan
            {plan.courseName ? (
              <span className="font-normal text-muted-foreground">
                {" "}
                · {plan.courseName}
              </span>
            ) : null}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {settled ? (
              <>You&apos;re all paid up — {formatPrice(plan.totalAmount)} settled.</>
            ) : (
              <>
                {formatPrice(plan.paidAmount)} of {formatPrice(plan.totalAmount)} paid ·{" "}
                <span className="font-medium text-foreground">
                  {formatPrice(plan.amountDue)} left
                </span>
              </>
            )}
          </p>
        </div>
        {plan.status === "defaulted" ? (
          <StatusBadge status="defaulted" label="Needs review" />
        ) : null}
      </div>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-success transition-all"
          style={{ width: `${paidPct}%` }}
        />
      </div>

      <ul className="mt-4 space-y-2">
        {plan.installments.map((t) => {
          const isNext = plan.nextDue?.id === t.id;
          return (
            <li
              key={t.id}
              className={`flex flex-wrap items-center gap-3 rounded-lg border p-3 ${trancheTone(t)}`}
            >
              <TrancheIcon status={t.status} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">
                  Payment {t.sequence} of {plan.installments.length} ·{" "}
                  {formatPrice(t.amount)}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t.status === "paid" ? (
                    <>
                      Paid {formatDate(t.paidAt, "long")}
                    </>
                  ) : t.status === "waived" ? (
                    <>Waived</>
                  ) : t.status === "overdue" ? (
                    <span className="text-warning">
                      Was due {formatDate(t.dueDate, "long")}
                      {t.graceEndsAt
                        ? ` · access pauses ${formatDate(t.graceEndsAt, "long")}`
                        : ""}
                    </span>
                  ) : (
                    <>
                      <CalendarClock className="mr-1 inline h-3 w-3" />
                      Due {formatDate(t.dueDate, "long")}
                    </>
                  )}
                </p>
              </div>
              {t.status === "pending" || t.status === "overdue" ? (
                <Button
                  type="button"
                  variant={isNext ? "default" : "outline"}
                  size="sm"
                  className="shrink-0"
                  onClick={() => onPayTranche?.(t, plan)}
                >
                  Pay this
                </Button>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
