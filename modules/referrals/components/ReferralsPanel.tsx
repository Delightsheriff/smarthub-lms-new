"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { formatPrice } from "@/lib/utils";
import {
  useBankingDetails,
  useCancelPayout,
  useMyPayouts,
  useMyReferrals,
  useRequestPayout,
} from "../queries/use-my-referrals";
import type { BankingDetails, Payout, ReferralRecord } from "../types";
import { CopyableCode } from "./CopyableCode";
import { ProgramShareLink } from "./ProgramShareLink";

const formatRelative = (iso?: string): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const diff = Date.now() - d.getTime();
  const sec = Math.round(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${day}d ago`;
  return d.toLocaleDateString();
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  processing: "bg-muted text-muted-foreground",
  qualified: "bg-primary/10 text-primary",
  earned: "bg-success/10 text-success",
  paid: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
  failed: "bg-destructive/10 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
};

function StatusBadge({ status }: { status: string }) {
  const cls =
    STATUS_STYLES[status?.toLowerCase()] || "bg-muted text-muted-foreground";
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

type TabKey = "share" | "earnings" | "ledger" | "payouts";

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: "share", label: "Share" },
  { key: "earnings", label: "Earnings" },
  { key: "ledger", label: "Ledger" },
  { key: "payouts", label: "Payouts" },
];

/**
 * Share / Earnings / Ledger tabs with a persistent code-pill header.
 * Mirrors the consumer client's Referrals page but rendered with the
 * LMS's shadcn primitives and brand tokens (no inline hex).
 */
export function ReferralsPanel() {
  const { data, isLoading, error } = useMyReferrals();
  const [tab, setTab] = useState<TabKey>("share");
  const banking = useBankingDetails();
  const payouts = useMyPayouts();
  const requestPayout = useRequestPayout();
  const cancelPayout = useCancelPayout();

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center space-y-2 border-destructive/20 bg-destructive/5">
        <p className="font-semibold">We couldn&apos;t load your referrals</p>
        <p className="text-sm text-muted-foreground">
          Please refresh the page. If this keeps happening, contact admin.
        </p>
      </Card>
    );
  }

  // The API returns `eligible: false` only for accounts with no stake
  // in the LMS — back-office users who neither learn nor teach here.
  // Anyone with an enrolment, a placement or a cohort to teach earns,
  // staff role or not. Nav hides the entry for those accounts, so this
  // is the direct-URL fallback rather than something people hit.
  if (data?.eligible === false) {
    return (
      <Card className="p-6 sm:p-8 text-center space-y-3">
        <h2 className="text-lg font-semibold">
          Refer &amp; earn isn&apos;t available for your account
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          This account isn&apos;t enrolled on a course and isn&apos;t
          teaching one, so there&apos;s nothing to refer from yet. Enrol on
          a cohort — or get assigned to teach one — and your referral link
          appears here.
        </p>
      </Card>
    );
  }

  const totals = data?.totals ?? {
    pendingNaira: 0,
    earnedNaira: 0,
    paidNaira: 0,
  };
  const records = data?.records ?? [];

  return (
    <div className="space-y-5">
      {/* Code-pill header — persistent across tabs so the user's
          "identity" stays in view as they toggle between Share /
          Earnings / Ledger. */}
      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Your referral code
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Share a program link, track sign-ups, and earn when friends
              enrol.
            </p>
          </div>
          <CopyableCode code={data?.code} />
        </div>

        {(typeof data?.uses === "number" ||
          typeof data?.qualifiedCount === "number") && (
          <p className="mt-3 text-xs text-muted-foreground">
            {typeof data?.uses === "number" && (
              <span>
                {data.uses} sign-up{data.uses === 1 ? "" : "s"}
              </span>
            )}
            {typeof data?.qualifiedCount === "number" && (
              <span>
                {" · "}
                {data.qualifiedCount} qualified
              </span>
            )}
          </p>
        )}
      </Card>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
        <TabsList variant="line" className="w-fit overflow-x-auto">
          {TABS.map((t) => (
            <TabsTrigger key={t.key} value={t.key}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tab === "share" && (
          <TabsContent value="share">
            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Pick a program to share
              </h3>
              <ProgramShareLink
                program="scholarship"
                code={data?.code}
                commissionRate={data?.commissionRate}
              />
              <ProgramShareLink
                program="siwes"
                code={data?.code}
                commissionRate={data?.commissionRate}
              />
              <ProgramShareLink
                program="course"
                code={data?.code}
                commissionRate={data?.commissionRate}
              />
            </section>
          </TabsContent>
        )}

        {tab === "earnings" && (
          <TabsContent value="earnings">
            <section className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <Tile
                  label="Pending"
                  amount={totals.pendingNaira}
                  tone="warning"
                />
                <Tile
                  label="Earned"
                  amount={totals.earnedNaira}
                  tone="success"
                />
                <Tile
                  label="Paid"
                  amount={totals.paidNaira}
                  tone="primary"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                You earn on every payment a referee makes — not just the
                first. <strong>Pending</strong> — potential earnings, the
                referee hasn&apos;t paid yet. <strong>Earned</strong> —
                payments have landed and accrued commission is sitting in
                your clawback window. <strong>Paid</strong> — withdrawn to
                your bank.
              </p>
            </section>
          </TabsContent>
        )}

        {tab === "ledger" && (
          <TabsContent value="ledger">
            <Card className="overflow-hidden p-0">
              {records.length === 0 ? (
                <div className="px-5 py-12 text-center sm:px-6">
                  <p className="text-sm text-muted-foreground">
                    No referrals yet. Share your link to get started.
                  </p>
                </div>
              ) : (
                <LedgerTable records={records} />
              )}
            </Card>
          </TabsContent>
        )}

        {tab === "payouts" && (
          <TabsContent value="payouts">
            <PayoutsTab
              earnedNaira={totals.earnedNaira}
              banking={banking.data}
              payouts={payouts}
              requestPayout={requestPayout}
              cancelPayout={cancelPayout}
            />
          </TabsContent>
        )}
      </Tabs>
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
  tone: "warning" | "success" | "primary";
}) {
  const palette: Record<typeof tone, string> = {
    warning: "bg-warning/10 border-warning/30 text-warning",
    success: "bg-success/10 border-success/30 text-success",
    primary: "bg-primary/5 border-primary/20 text-primary",
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

function PayoutsTab({
  earnedNaira,
  banking,
  payouts,
  requestPayout,
  cancelPayout,
}: {
  earnedNaira: number;
  banking: BankingDetails | undefined;
  payouts: ReturnType<typeof useMyPayouts>;
  requestPayout: ReturnType<typeof useRequestPayout>;
  cancelPayout: ReturnType<typeof useCancelPayout>;
}) {
  const hasBanking =
    !!banking?.bankName &&
    !!banking?.accountName &&
    !!banking?.accountNumber;

  const canRequest =
    earnedNaira > 0 && hasBanking && !requestPayout.isPending;

  const bankIncomplete = earnedNaira > 0 && !hasBanking;

  return (
    <section className="space-y-4">
      <Card className="p-5 sm:p-6 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <h3 className="font-semibold">Request a payout</h3>
            <p className="text-sm text-muted-foreground">
              Withdraw your earned commissions to your bank account.
            </p>
          </div>
          {/* When they've earned but haven't added banking, the payout
              button can't do anything — so instead of a dead greyed
              button, hand them a live CTA straight to the banking form.
              A disabled button reads as "broken"; an actionable next
              step doesn't. */}
          {bankIncomplete ? (
            <Button
              variant="default"
              size="sm"
              render={<Link href="/profile?tab=banking" />}
            >
              Add bank details
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              disabled={!canRequest}
              onClick={() => requestPayout.mutate()}
            >
              {requestPayout.isPending ? "Requesting…" : "Request Payout"}
            </Button>
          )}
        </div>

        {earnedNaira === 0 && (
          <p className="text-xs text-muted-foreground">
            No earned balance available for payout.
          </p>
        )}

        {bankIncomplete && (
          <p className="text-sm">
            You have <strong>{formatPrice(earnedNaira)}</strong> ready to
            withdraw. Add your bank account to request a payout.
          </p>
        )}
      </Card>

      {payouts.isLoading ? (
        <Skeleton className="h-32 w-full rounded-2xl" />
      ) : !payouts.data?.items?.length ? (
        <Card className="px-5 py-12 text-center sm:px-6">
          <p className="text-sm text-muted-foreground">
            No payout requests yet.
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <PayoutsTable
            items={payouts.data.items}
            onCancel={(id) => cancelPayout.mutate(id)}
            isCancelling={cancelPayout.isPending}
          />
        </Card>
      )}
    </section>
  );
}

function PayoutsTable({
  items,
  onCancel,
  isCancelling,
}: {
  items: Payout[];
  onCancel: (id: string) => void;
  isCancelling: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-muted/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-5 py-3 sm:px-6">Amount</th>
            <th className="px-5 py-3 sm:px-6">Bank</th>
            <th className="px-5 py-3 sm:px-6">Status</th>
            <th className="px-5 py-3 sm:px-6">Requested</th>
            <th className="px-5 py-3 sm:px-6">Processed</th>
            <th className="px-5 py-3 sm:px-6">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-card">
          {items.map((item) => (
            <tr key={item._id}>
              <td className="px-5 py-3 font-bold tabular-nums text-foreground sm:px-6">
                {formatPrice(item.totalAmount)}
              </td>
              <td className="px-5 py-3 text-muted-foreground sm:px-6">
                {item.bankSnapshot.bankName}
              </td>
              <td className="px-5 py-3 sm:px-6">
                <StatusBadge status={item.status} />
              </td>
              <td className="px-5 py-3 text-muted-foreground sm:px-6">
                {formatRelative(item.createdAt)}
              </td>
              <td className="px-5 py-3 text-muted-foreground sm:px-6">
                {formatRelative(item.processedAt)}
              </td>
              <td className="px-5 py-3 sm:px-6">
                {item.status === "pending" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isCancelling}
                    onClick={() => onCancel(item._id)}
                  >
                    Cancel
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LedgerTable({ records }: { records: ReferralRecord[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-muted/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-5 py-3 sm:px-6">Referee</th>
            <th className="px-5 py-3 sm:px-6">Course</th>
            <th className="px-5 py-3 sm:px-6">Rate</th>
            <th className="px-5 py-3 sm:px-6">Amount</th>
            <th className="px-5 py-3 sm:px-6">Status</th>
            <th className="px-5 py-3 sm:px-6">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-card">
          {records.map((r) => {
            const fullName =
              [r.referred?.firstName, r.referred?.lastName]
                .filter(Boolean)
                .join(" ") || "Anonymous";
            return (
              <tr key={r._id}>
                <td className="px-5 py-3 sm:px-6">
                  <div className="font-medium text-foreground">{fullName}</div>
                  {r.referred?.email && (
                    <div className="text-xs text-muted-foreground">
                      {r.referred.email}
                    </div>
                  )}
                </td>
                <td className="px-5 py-3 text-muted-foreground sm:px-6">
                  {(typeof r.registration?.course === "object"
                    ? r.registration?.course?.name
                    : r.registration?.course) || "—"}
                </td>
                <td className="px-5 py-3 text-muted-foreground sm:px-6">
                  {(() => {
                    const earned = Number(r.amount) || 0;
                    const rate =
                      typeof r.commission === "number" && earned > 0
                        ? Math.round((r.commission / earned) * 100)
                        : null;
                    return rate !== null ? `${rate}%` : "—";
                  })()}
                </td>
                <td className="px-5 py-3 font-medium tabular-nums text-foreground sm:px-6">
                  {(() => {
                    const earned = Number(r.amount) || 0;
                    const potential = Number(r.potentialAmount) || 0;
                    if (earned > 0 && potential > 0 && potential > earned) {
                      return (
                        <span className="text-sm">
                          <span className="font-semibold text-success">
                            {formatPrice(earned)}
                          </span>{" "}
                          <span className="text-xs font-normal text-muted-foreground">
                            of {formatPrice(potential)}
                          </span>
                        </span>
                      );
                    }
                    if (earned > 0) return formatPrice(earned);
                    if (potential > 0) {
                      return (
                        <span className="text-sm">
                          <span className="text-xs font-normal italic text-muted-foreground">
                            Potential
                          </span>{" "}
                          <span className="font-semibold">
                            {formatPrice(potential)}
                          </span>
                        </span>
                      );
                    }
                    return (
                      <span className="text-xs font-normal italic text-muted-foreground">
                        awaiting payment
                      </span>
                    );
                  })()}
                </td>
                <td className="px-5 py-3 sm:px-6">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-5 py-3 text-muted-foreground sm:px-6">
                  {formatRelative(r.registration?.createdAt || r.createdAt)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}