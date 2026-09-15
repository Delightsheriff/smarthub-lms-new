"use client";
import { useState } from "react";
import { Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pager } from "@/components/ui/pager";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import {
  SHARES_PAGE_SIZE,
  useMySelfPacedEarnings,
} from "../api/instructor.queries";
import { formatBps, formatMinor } from "../lib/format";
import type {
  EarningsTotals,
  SelfPacedShareRow,
} from "../types/instructor.types";

/**
 * The API's ledger buckets, turned into the vocabulary the cohort
 * Earnings page already uses:
 *
 *  Pending      accrued, not yet bundled into a payout
 *  Processing   bundled into a payout pay item, not yet paid
 *  Paid         pay item paid
 *  Clawed back  refunded before any money left
 *  Under review refunded after payout — an admin settles it by hand
 */
const buckets = (t: EarningsTotals) => ({
  pending: Math.max(0, t.accruedMinor - t.materialisedMinor),
  processing: Math.max(0, t.materialisedMinor - t.paidOutMinor),
  paid: t.paidOutMinor,
  clawedBack: t.clawedBackMinor,
  review: t.clawbackReviewMinor,
});

const REASON_COPY: Record<string, string> = {
  tripwire: "Entry-price course — earns no share",
  "no-share-agreed": "No revenue share agreed for this course",
  "never-published": "Course not published when sold",
  "window-ended": "Sold after the share window ended",
  "no-instructor": "No instructor to attribute",
  "course-missing": "Course no longer exists",
  "zero-share": "Share rounded to zero",
};

const saleSourceLabel = (source: string) =>
  source.includes("instructor") ? "Your link" : "SmartHub channels";

function ShareStatus({ row }: { row: SelfPacedShareRow }) {
  switch (row.status) {
    case "accrued":
      return <AccruedStatus row={row} />;
    case "clawed-back":
      return <Badge variant="secondary">Clawed back</Badge>;
    case "clawback-review":
      return (
        <Badge
          variant="outline"
          className="border-destructive/30 text-destructive bg-destructive/10"
        >
          Under review
        </Badge>
      );
    case "not-eligible":
      return <Badge variant="outline">No share</Badge>;
    default:
      return <Badge variant="outline">{row.status}</Badge>;
  }
}

/**
 * A live share, labelled by where its money is — the same words as the
 * tiles above: Pending (not in a payout yet), Processing (in one, not
 * paid), Paid. A pay item waiting to be bundled still counts toward the
 * Processing tile, so it reads "Processing" here too, with the
 * distinction in the tooltip.
 */
function AccruedStatus({ row }: { row: SelfPacedShareRow }) {
  const state =
    row.payoutState ?? (row.materialisedAt ? "processing" : "not-materialised");
  switch (state) {
    case "paid":
      return (
        <Badge
          variant="outline"
          className="border-success/30 text-success bg-success/10"
        >
          Paid
        </Badge>
      );
    case "processing":
    case "pending":
      return (
        <Badge
          variant="outline"
          className="border-primary/30 text-primary bg-primary/10"
          title={
            state === "pending"
              ? "Approved for payout; waiting to be included in the next one"
              : "Included in a payout that hasn't been paid yet"
          }
        >
          Processing
        </Badge>
      );
    case "cancelled":
      return <Badge variant="secondary">Cancelled</Badge>;
    default:
      return (
        <Badge
          variant="outline"
          className="border-warning/30 text-warning bg-warning/10"
        >
          Pending
        </Badge>
      );
  }
}

const courseName = (row: SelfPacedShareRow) =>
  row.course && typeof row.course === "object" ? row.course.name : undefined;

/**
 * Revenue share on self-paced sales: totals per currency, the per-course
 * split, and the share ledger itself. Read-only — shares reach a payout
 * when an admin bundles them, same as cohort earnings.
 */
export function InstructorSelfPacedEarnings() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error, refetch } = useMySelfPacedEarnings(page);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-3">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="p-6 text-center space-y-3 border-destructive/20 bg-destructive/5">
        <p className="font-semibold">We couldn&apos;t load your self-paced earnings</p>
        <Button size="sm" onClick={() => void refetch()}>
          Try again
        </Button>
      </Card>
    );
  }

  const { config, totalsByCurrency, courses, recentShares } = data.data;
  const total = data.meta.total;
  const totalPages = Math.max(
    1,
    Math.ceil(total / (data.meta.limit || SHARES_PAGE_SIZE))
  );

  const rates = config ? (
    <p className="text-xs text-muted-foreground">
      You earn <strong>{formatBps(config.instructorReferralBps)}</strong> of
      the net on sales through your own link and{" "}
      <strong>{formatBps(config.ownChannelBps)}</strong> on sales we bring in,
      within each course&apos;s share window (
      {config.defaultWindowMonths} months from first publishing unless your
      agreement says otherwise). Net is the price less payment fees and
      taxes; a refund reverses the share.
    </p>
  ) : null;

  if (totalsByCurrency.length === 0 && recentShares.length === 0) {
    return (
      <div className="space-y-3">
        <Card className="p-10 text-center">
          <Wallet className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="font-semibold">No self-paced earnings yet</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            When a course you teach sells, your share of the sale is recorded
            here.
          </p>
        </Card>
        {rates}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {totalsByCurrency.map((t) => {
        const b = buckets(t);
        return (
          <section key={t.currency} className="space-y-3">
            {totalsByCurrency.length > 1 && (
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t.currency}
              </h2>
            )}
            <div className="grid gap-3 sm:grid-cols-3">
              <Tile label="Pending" tone="warning" value={formatMinor(b.pending, t.currency)} />
              <Tile label="Processing" tone="primary" value={formatMinor(b.processing, t.currency)} />
              <Tile label="Paid" tone="success" value={formatMinor(b.paid, t.currency)} />
            </div>
            {(b.clawedBack > 0 || b.review > 0 || t.notEligibleCount > 0) && (
              <p className="text-xs text-muted-foreground">
                {b.clawedBack > 0 &&
                  `${formatMinor(b.clawedBack, t.currency)} clawed back after refunds. `}
                {b.review > 0 &&
                  `${formatMinor(b.review, t.currency)} refunded after payout — an admin will settle it with you. `}
                {t.notEligibleCount > 0 &&
                  `${t.notEligibleCount} ${t.notEligibleCount === 1 ? "sale" : "sales"} earned no share (see reasons below).`}
              </p>
            )}
          </section>
        );
      })}

      {rates}

      {courses.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            By course
          </h2>
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border text-sm">
                <thead className="bg-muted/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 sm:px-6">Course</th>
                    <th className="px-5 py-3 text-right sm:px-6">Pending</th>
                    <th className="px-5 py-3 text-right sm:px-6">Processing</th>
                    <th className="px-5 py-3 text-right sm:px-6">Paid</th>
                    <th className="px-5 py-3 text-right sm:px-6">Clawed back</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {courses.flatMap((row) =>
                    row.totalsByCurrency.map((t, i) => {
                      const b = buckets(t);
                      return (
                        <tr key={`${row.course._id}-${t.currency}`}>
                          <td className="px-5 py-3 sm:px-6">
                            {i === 0 ? (
                              <>
                                <span className="block font-medium text-foreground">
                                  {row.course.name ?? "Course"}
                                </span>
                                <span className="block text-xs text-muted-foreground">
                                  {row.course.isTripwire
                                    ? "Entry-price course — no share"
                                    : row.course.revenueShareMonths === 0
                                      ? "No share agreed"
                                      : typeof row.course.revenueShareMonths === "number"
                                        ? `${row.course.revenueShareMonths}-month share window`
                                        : null}
                                  {row.totalsByCurrency.length > 1 ? ` · ${t.currency}` : ""}
                                </span>
                              </>
                            ) : (
                              <span className="block text-xs text-muted-foreground">
                                {t.currency}
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3 text-right tabular-nums sm:px-6">
                            {formatMinor(b.pending, t.currency)}
                          </td>
                          <td className="px-5 py-3 text-right tabular-nums sm:px-6">
                            {formatMinor(b.processing, t.currency)}
                          </td>
                          <td className="px-5 py-3 text-right tabular-nums sm:px-6">
                            {formatMinor(b.paid, t.currency)}
                          </td>
                          <td className="px-5 py-3 text-right tabular-nums text-muted-foreground sm:px-6">
                            {formatMinor(b.clawedBack + b.review, t.currency)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Sales and your share
        </h2>
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-muted/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 sm:px-6">Sale</th>
                  <th className="px-5 py-3 sm:px-6">Source</th>
                  <th className="px-5 py-3 text-right sm:px-6">Net</th>
                  <th className="px-5 py-3 text-right sm:px-6">Rate</th>
                  <th className="px-5 py-3 text-right sm:px-6">Your share</th>
                  <th className="px-5 py-3 sm:px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {recentShares.map((row) => {
                  const reversed =
                    row.status === "clawed-back" ||
                    row.status === "clawback-review";
                  return (
                    <tr key={row._id}>
                      <td className="px-5 py-3 sm:px-6">
                        <span className="block font-medium text-foreground">
                          {courseName(row) ?? "Course"}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {formatDate(row.paidAt)} ·{" "}
                          <span className="font-mono">{row.orderReference}</span>
                        </span>
                        {row.status === "not-eligible" && row.reason && (
                          <span className="block text-xs text-muted-foreground">
                            {REASON_COPY[row.reason] ?? row.reason}
                          </span>
                        )}
                        {reversed && row.clawedBackAt && (
                          <span className="block text-xs text-muted-foreground">
                            Refunded {formatDate(row.clawedBackAt)}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground whitespace-nowrap sm:px-6">
                        {saleSourceLabel(row.saleSource)}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-muted-foreground sm:px-6">
                        {formatMinor(row.netMinor, row.currency)}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-muted-foreground sm:px-6">
                        {formatBps(row.rateBps)}
                      </td>
                      <td
                        className={
                          "px-5 py-3 text-right font-semibold tabular-nums sm:px-6 " +
                          (reversed ? "text-muted-foreground line-through" : "text-foreground")
                        }
                      >
                        {formatMinor(row.shareMinor, row.currency)}
                      </td>
                      <td className="px-5 py-3 sm:px-6">
                        <ShareStatus row={row} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
        <Pager
          page={page}
          totalPages={totalPages}
          onPage={setPage}
          label={`${total} ${total === 1 ? "sale" : "sales"}`}
        />
      </section>
    </div>
  );
}

function Tile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "warning" | "primary" | "success";
}) {
  // Same three states AccruedStatus's badges use, same colors: Paid is
  // success everywhere in this file now, not primary in one place and
  // emerald in another.
  const palette: Record<typeof tone, string> = {
    warning: "bg-warning/10 border-warning/30 text-warning",
    primary: "bg-primary/10 border-primary/30 text-primary",
    success: "bg-success/10 border-success/30 text-success",
  };
  return (
    <div className={"rounded-lg border p-4 " + palette[tone]}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-80">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
    </div>
  );
}
