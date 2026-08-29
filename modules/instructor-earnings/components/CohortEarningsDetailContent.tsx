"use client";
import Link from "next/link";
import { ArrowLeft, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
  const { data, isLoading, error } = useMyInstructorRevenueBreakdown();
  const cohort = (data ?? []).find((c) => c.scheduleId === scheduleId);

  return (
    <div className="space-y-6">
      <Link
        href="/billing"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to earnings
      </Link>

      {isLoading ? (
        <Skeleton className="h-48 w-full rounded-2xl" />
      ) : error ? (
        <Card className="p-6 text-center text-sm text-destructive">
          Couldn&apos;t load this cohort&apos;s breakdown. Please refresh.
        </Card>
      ) : !cohort ? (
        <Card className="p-10 text-center">
          <Wallet className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="font-semibold">Nothing to show</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            No payments recorded for this cohort yet, or it isn&apos;t on a
            revenue-share model.
          </p>
        </Card>
      ) : (
        <>
          <header className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight">
              {cohort.course}
            </h1>
            <p className="text-sm text-muted-foreground">
              {cohort.isFlat
                ? `Your share is ${cohort.effectiveSharePct}% of what this cohort collects.`
                : "Your pay on this cohort is a base fee plus a share above a threshold — see your total below."}
            </p>
          </header>

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
    <div className="rounded-lg border p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold tabular-nums">
        {suffix ? `${amount}${suffix}` : formatPrice(amount)}
      </p>
    </div>
  );
}