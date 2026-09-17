"use client";
import Link from "next/link";
import { ArrowLeft, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { RefreshButton } from "@/components/ui/refresh-button";
import { formatPrice } from "@/lib/utils";
import { useMyInstructorRevenueBreakdown } from "../api/instructor-earnings.queries";

/**
 * A single cohort's revenue breakdown — who paid, how much, and (for the
 * flat 50/50 / micro-intake models) this instructor's cut of each
 * payment. Reached by tapping a cohort row on the Earnings page. Computed
 * live from current collections.
 */
export function CohortEarningsDetailContent({
  scheduleId,
}: {
  scheduleId: string;
}) {
  const { data, isLoading, isFetching, error, refetch } = useMyInstructorRevenueBreakdown();
  const cohort = (data ?? []).find((c) => c.scheduleId === scheduleId);

  const dateline = cohort
    ? `${formatPrice(cohort.totalRevenueNaira)} Total Collected`
    : undefined;

  return (
    <div className="space-y-6">
      <Link
        href="/billing"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to earnings
      </Link>

      <PageHeader
        variant="editorial"
        eyebrow="Teaching · Earnings"
        title={cohort?.course ?? "Cohort Earnings"}
        dateline={dateline}
        divider
        description={
          cohort
            ? cohort.isFlat
              ? `Your share is ${cohort.effectiveSharePct}% of what this cohort collects.`
              : "Your pay on this cohort is a base fee plus a share above a threshold."
            : "Review collection details and student revenue breakdown for this cohort."
        }
        actions={<RefreshButton loading={isFetching} onClick={refetch} />}
      />

      {isLoading ? (
        <Skeleton className="h-48 w-full rounded-2xl" />
      ) : error ? (
        <Card className="p-6 text-center text-sm text-destructive rounded-2xl border-destructive/20 bg-destructive/5">
          Couldn&apos;t load this cohort&apos;s breakdown. Please refresh.
        </Card>
      ) : !cohort ? (
        <Card className="p-10 text-center rounded-2xl">
          <Wallet className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="font-semibold">Nothing to show</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            No payments recorded for this cohort yet, or it isn&apos;t on a
            revenue-share model.
          </p>
        </Card>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Tile label="Collected" amount={cohort.totalRevenueNaira} />
            <Tile label="Your earnings" amount={cohort.yourEntitlementNaira} />
            {cohort.isFlat && (
              <Tile
                label="Your share"
                amount={cohort.effectiveSharePct}
                suffix="%"
              />
            )}
          </div>

          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Who paid
            </h2>
            <Card className="overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border text-sm">
                  <thead className="bg-muted/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3 sm:px-6">Student</th>
                      <th className="px-5 py-3 text-right sm:px-6">Paid</th>
                      {cohort.isFlat && (
                        <th className="px-5 py-3 text-right sm:px-6">
                          Your cut
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card">
                    {cohort.students.map((s, i) => (
                      <tr key={`${s.email ?? s.name}-${i}`}>
                        <td className="px-5 py-3 sm:px-6">
                          <p className="font-medium text-foreground">
                            {s.name}
                          </p>
                          {s.email && (
                            <p className="text-xs text-muted-foreground">
                              {s.email}
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-3 text-right tabular-nums text-foreground sm:px-6">
                          {formatPrice(s.paidNaira)}
                        </td>
                        {cohort.isFlat && (
                          <td className="px-5 py-3 text-right tabular-nums font-medium text-primary sm:px-6">
                            {formatPrice(s.yourCutNaira ?? 0)}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-border bg-muted/30 font-semibold">
                      <td className="px-5 py-3 sm:px-6">Total</td>
                      <td className="px-5 py-3 text-right tabular-nums sm:px-6">
                        {formatPrice(cohort.totalRevenueNaira)}
                      </td>
                      {cohort.isFlat && (
                        <td className="px-5 py-3 text-right tabular-nums text-primary sm:px-6">
                          {formatPrice(
                            cohort.students.reduce(
                              (a, s) => a + (s.yourCutNaira ?? 0),
                              0,
                            ),
                          )}
                        </td>
                      )}
                    </tr>
                  </tfoot>
                </table>
              </div>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}

function Tile({
  label,
  amount,
  suffix,
}: {
  label: string;
  amount: number;
  suffix?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold font-display tabular-nums text-foreground">
        {suffix ? `${amount}${suffix}` : formatPrice(amount)}
      </p>
    </div>
  );
}