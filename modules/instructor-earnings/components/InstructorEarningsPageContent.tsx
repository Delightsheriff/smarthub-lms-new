"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wallet, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, formatDate } from "@/lib/utils";
import { useBankingDetails } from "@/modules/referrals/queries/use-my-referrals";
import { useMyInstructorEarnings } from "../api/instructor-earnings.queries";
import type {
  EarningStream,
  EarningsCohortRow,
  EarningsPayout,
} from "../types";

/** "24 Nov 2026 – 14 Sep 2026" under the course name — the run-dates are
 *  what tell two cohorts of the same course apart. */
const cohortDates = (row: EarningsCohortRow): string | null => {
  if (!row.startDate) return null;
  const start = formatDate(row.startDate);
  return row.endDate ? `${start} – ${formatDate(row.endDate)}` : start;
};

const STREAM_LABELS: Record<EarningStream, string> = {
  course: "Course",
  siwes: "SIWES",
  foundational: "Foundational",
  scholarship: "Scholarship",
};

const PAYOUT_STATUS_STYLES: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  processing: "bg-muted text-muted-foreground",
  paid: "bg-success/10 text-success",
  failed: "bg-destructive/10 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
};

function PayoutStatusBadge({ status }: { status: string }) {
  const cls =
    PAYOUT_STATUS_STYLES[status?.toLowerCase()] ||
    "bg-muted text-muted-foreground";
  return (
    <span
      className={
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize " +
        cls
      }
    >
      {status || "unknown"}
    </span>
  );
}

/**
 * The instructor's read-only earnings view. Payouts are run by an
 * admin ("Run payout" on the admin instructor-pay page) — there is no
 * self-serve request here. This surface is transparency: what's
 * accrued (pending), what's bundled into a payout awaiting payment
 * (processing), and what's been paid, plus a per-cohort breakdown and
 * payout history.
 */
export function InstructorEarningsPageContent() {
  const { data, isLoading, error } = useMyInstructorEarnings();
  const banking = useBankingDetails();
  const router = useRouter();

  const hasBanking =
    !!banking.data?.bankName &&
    !!banking.data?.accountName &&
    !!banking.data?.accountNumber;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-40" />
        <div className="grid gap-3 sm:grid-cols-3">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  const totals = data?.totals ?? {
    pendingNaira: 0,
    processingNaira: 0,
    paidNaira: 0,
  };
  const cohorts = data?.cohorts ?? [];
  const payouts = data?.payouts ?? [];

  const nothingYet =
    totals.pendingNaira === 0 &&
    totals.processingNaira === 0 &&
    totals.paidNaira === 0 &&
    cohorts.length === 0 &&
    payouts.length === 0;

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Earnings"
          description="Your accrued earnings and payouts across the cohorts you teach."
        />
        <Card className="p-6 text-center space-y-2 border-destructive/20 bg-destructive/5">
          <p className="font-semibold">We couldn&apos;t load your earnings</p>
          <p className="text-sm text-muted-foreground">
            Please refresh the page. If this keeps happening, contact admin.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Earnings"
        description="Your accrued earnings and payouts across the cohorts you teach."
      />

      {/* Bank-details nudge — payouts land in the account on file, so
          an instructor with a pending balance and no banking would get
          skipped on the next admin run. Surface a live CTA, not a
          silent gap. */}
      {!banking.isLoading &&
        !hasBanking &&
        (totals.pendingNaira > 0 || totals.processingNaira > 0) && (
          <Card className="p-5 flex flex-wrap items-center justify-between gap-3 border-accent/30 bg-accent/5">
            <div className="space-y-1">
              <p className="font-semibold">Add your bank details</p>
              <p className="text-sm text-muted-foreground max-w-md">
                You have earnings accruing. Payouts are sent to the bank
                account on file — add yours so you aren&apos;t skipped on the
                next payout run.
              </p>
            </div>
            <Button
              variant="default"
              size="sm"
              render={<Link href="/profile?tab=banking" />}
            >
              Add bank details
            </Button>
          </Card>
        )}

      <div className="grid gap-3 sm:grid-cols-3">
        <Tile label="Pending" amount={totals.pendingNaira} tone="warning" />
        <Tile
          label="Processing"
          amount={totals.processingNaira}
          tone="neutral"
        />
        <Tile label="Paid" amount={totals.paidNaira} tone="success" />
      </div>

      <p className="text-xs text-muted-foreground">
        <strong>Pending</strong> — accrued from payments your cohorts have
        collected, awaiting the next payout run.{" "}
        <strong>Processing</strong> — bundled into a payout an admin has
        run, awaiting payment. <strong>Paid</strong> — settled to your
        bank. Payouts are run by an admin; there&apos;s nothing to request
        here.
      </p>

      {data?.byKind &&
        (data.byKind.baseNaira > 0 ||
          data.byKind.variableNaira > 0 ||
          data.byKind.bonusNaira > 0) && (
          <div className="grid gap-3 sm:grid-cols-3">
            <MiniStat
              label="Guaranteed base"
              amount={data.byKind.baseNaira}
              hint="Paid each cohort regardless of enrolment"
            />
            <MiniStat
              label="Revenue share"
              amount={data.byKind.variableNaira}
              hint="Your share of what the cohort collects"
            />
            <MiniStat
              label="Bonuses & fees"
              amount={data.byKind.bonusNaira}
              hint="Completion, conversion, session fees"
            />
          </div>
        )}

      {nothingYet ? (
        <EmptyState
          icon={Wallet}
          title="No earnings yet"
          description="You'll earn a share of the revenue your cohorts collect. As payments come in, your accrued earnings show up here."
        />
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              By cohort
            </h2>
            {cohorts.length === 0 ? (
              <Card className="px-5 py-10 text-center">
                <p className="text-sm text-muted-foreground">
                  No cohort earnings yet.
                </p>
              </Card>
            ) : (
              <Card className="overflow-hidden p-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border text-sm">
                    <thead className="bg-muted/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="px-5 py-3 sm:px-6">Cohort</th>
                        <th className="px-5 py-3 sm:px-6">Stream</th>
                        <th className="px-5 py-3 text-right sm:px-6">
                          Pending
                        </th>
                        <th className="px-5 py-3 text-right sm:px-6">Paid</th>
                        <th className="px-3 py-3 w-8" aria-label="Open" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-card">
                      {cohorts.map((row, i) => {
                        const clickable = !!row.scheduleId;
                        return (
                          <tr
                            key={`${row.scheduleId ?? row.course}-${i}`}
                            onClick={
                              clickable
                                ? () =>
                                    router.push(
                                      `/billing/cohort/${row.scheduleId}`,
                                    )
                                : undefined
                            }
                            className={
                              clickable
                                ? "cursor-pointer transition-colors hover:bg-muted/40"
                                : ""
                            }
                          >
                            <td className="px-5 py-3 sm:px-6">
                              <span className="block font-medium text-foreground">
                                {row.course}
                              </span>
                              {cohortDates(row) && (
                                <span className="block text-xs text-muted-foreground">
                                  {cohortDates(row)}
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-3 text-muted-foreground sm:px-6">
                              {row.stream ? STREAM_LABELS[row.stream] : "—"}
                            </td>
                            <td className="px-5 py-3 text-right tabular-nums text-foreground sm:px-6">
                              {formatPrice(row.pending)}
                            </td>
                            <td className="px-5 py-3 text-right tabular-nums text-foreground sm:px-6">
                              {formatPrice(row.paid)}
                            </td>
                            <td className="px-3 py-3 text-muted-foreground">
                              {clickable && (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
            <p className="text-xs text-muted-foreground">
              Tap a cohort to see who paid and your cut per student.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Payout history
            </h2>
            {payouts.length === 0 ? (
              <Card className="px-5 py-10 text-center">
                <p className="text-sm text-muted-foreground">
                  No payouts yet. When an admin runs a payout, it appears
                  here.
                </p>
              </Card>
            ) : (
              <Card className="overflow-hidden p-0">
                <PayoutsTable payouts={payouts} />
              </Card>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function MiniStat({
  label,
  amount,
  hint,
}: {
  label: string;
  amount: number;
  hint: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-xl font-bold tabular-nums text-foreground">
        {formatPrice(amount)}
      </p>
      <p className="mt-1 text-[11px] leading-tight text-muted-foreground">
        {hint}
      </p>
    </div>
  );
}

function Tile({
  label,
  amount,
  tone,
}: {
  label: string;
  amount: number;
  tone: "warning" | "neutral" | "success";
}) {
  const palette: Record<typeof tone, string> = {
    warning: "bg-warning/10 border-warning/30 text-warning",
    neutral: "bg-muted border-border text-foreground",
    success: "bg-success/10 border-success/30 text-success",
  };
  return (
    <div className={"rounded-lg border p-4 " + palette[tone]}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-80">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold tabular-nums">
        {formatPrice(amount)}
      </p>
    </div>
  );
}

function PayoutsTable({ payouts }: { payouts: EarningsPayout[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-muted/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-5 py-3 sm:px-6">Amount</th>
            <th className="px-5 py-3 sm:px-6">Bank</th>
            <th className="px-5 py-3 sm:px-6">Status</th>
            <th className="px-5 py-3 sm:px-6">Run</th>
            <th className="px-5 py-3 sm:px-6">Paid</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-card">
          {payouts.map((p) => (
            <tr key={p._id}>
              <td className="px-5 py-3 font-bold tabular-nums text-foreground sm:px-6">
                {formatPrice(p.totalAmount)}
              </td>
              <td className="px-5 py-3 text-muted-foreground sm:px-6">
                {p.bankName || "—"}
              </td>
              <td className="px-5 py-3 sm:px-6">
                <PayoutStatusBadge status={p.status} />
              </td>
              <td className="px-5 py-3 text-muted-foreground sm:px-6">
                {formatDate(p.createdAt)}
              </td>
              <td className="px-5 py-3 text-muted-foreground sm:px-6">
                {p.processedAt ? formatDate(p.processedAt) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}