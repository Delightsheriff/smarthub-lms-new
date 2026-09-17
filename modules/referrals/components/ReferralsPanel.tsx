"use client";
import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, Receipt, Share2, Wallet } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshButton } from "@/components/ui/refresh-button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, formatPrice } from "@/lib/utils";
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
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        cls,
      )}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
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
  const { data, isLoading, isFetching, error, refetch } = useMyReferrals();
  const [tab, setTab] = useState<TabKey>("share");
  const banking = useBankingDetails();
  const payouts = useMyPayouts();
  const requestPayout = useRequestPayout();
  const cancelPayout = useCancelPayout();

  const isPageLoading = isLoading || banking.isLoading || payouts.isLoading;

  if (isPageLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-28 w-full rounded-2xl" />
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
      <EmptyState
        icon={Share2}
        title="Refer & earn isn't available for your account"
        description="This account isn't enrolled on a course and isn't teaching one, so there's nothing to refer from yet. Enrol on a cohort — or get assigned to teach one — and your referral link appears here."
      />
    );
  }

  const totals = data?.totals ?? {
    pendingNaira: 0,
    earnedNaira: 0,
    paidNaira: 0,
  };
  const records = data?.records ?? [];

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        variant="editorial"
        eyebrow="Refer & Earn"
        title="Refer & earn"
        description="Share your link, track sign-ups, and withdraw what you earn."
         actions={
           <>
           <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
            <TabsList className="rounded-xl bg-muted/60 p-1">
              {TABS.map((t) => (
                <TabsTrigger key={t.key} value={t.key} className="rounded-lg text-xs">
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
           </Tabs>
           <RefreshButton
             loading={isFetching || banking.isFetching || payouts.isFetching}
             onClick={() => Promise.allSettled([refetch(), banking.refetch(), payouts.refetch()])}
           />
           </>
         }
      />

      {/* Code-pill card — persistent across tabs so the user's
          "identity" stays in view as they toggle between sections. */}
      <div className="canvas-warm rounded-2xl border border-border p-6 md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <p className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
              <span className="h-px w-6 bg-accent" aria-hidden />
              Your unique link
            </p>
            <h2 className="mt-2 font-display text-2xl leading-tight text-foreground">
              Your referral code
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Share a programme link, track your referee sign-ups, and earn commission
              when friends enrol.
            </p>
          </div>
          <CopyableCode code={data?.code} />
        </div>

        {(typeof data?.uses === "number" ||
          typeof data?.qualifiedCount === "number") && (
          <div className="mt-6 flex items-center gap-4 border-t border-border pt-4 text-xs text-muted-foreground">
            {typeof data?.uses === "number" && (
              <span className="font-medium text-foreground">
                <span className="font-display text-base font-bold tabular-nums text-primary">{data.uses}</span>{" "}
                sign-up{data.uses === 1 ? "" : "s"}
              </span>
            )}
            {typeof data?.qualifiedCount === "number" && (
              <span>
                {" · "}
                <span className="font-medium text-foreground">
                  <span className="font-display text-base font-bold tabular-nums text-accent">{data.qualifiedCount}</span>{" "}
                  qualified
                </span>
              </span>
            )}
          </div>
        )}
      </div>

      {tab === "share" && (
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
      )}

      {tab === "earnings" && (
        <section className="space-y-4">
          <div className="grid grid-cols-1 divide-y divide-border rounded-2xl border border-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <StatTile
              icon={Clock}
              label="Pending"
              amount={totals.pendingNaira}
              hint="Awaiting payment"
            />
            <StatTile
              icon={Wallet}
              label="Earned"
              amount={totals.earnedNaira}
              hint="Ready or in clawback"
            />
            <StatTile
              icon={CheckCircle2}
              label="Paid"
              amount={totals.paidNaira}
              hint="Withdrawn to bank"
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
      )}

      {tab === "ledger" && (
        records.length === 0 ? (
          <EmptyState
            icon={Share2}
            title="No referrals yet"
            description="Share your link to get started."
          />
        ) : (
          <Card className="overflow-hidden p-0">
            <LedgerTable records={records} />
          </Card>
        )
      )}

      {tab === "payouts" && (
        <PayoutsTab
          earnedNaira={totals.earnedNaira}
          banking={banking.data}
          payouts={payouts}
          requestPayout={requestPayout}
          cancelPayout={cancelPayout}
        />
      )}
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  amount,
  hint,
}: {
  icon: React.ElementType;
  label: string;
  amount: number;
  hint?: string;
}) {
  return (
    <div className="p-5">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-accent" />
        <span>{label}</span>
      </div>
      <p className="mt-2 font-display text-2xl md:text-3xl tabular-nums leading-tight text-foreground">
        {formatPrice(amount)}
      </p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
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
        <EmptyState
          icon={Receipt}
          title="No payout requests yet"
          description="Requests you make will show up here."
        />
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
                  <div className="flex items-center gap-2.5">
                    <Avatar size="sm">
                      <AvatarFallback>
                        {fullName.slice(0, 1).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="font-medium text-foreground">{fullName}</div>
                      {r.referred?.email && (
                        <div className="text-xs text-muted-foreground">
                          {r.referred.email}
                        </div>
                      )}
                    </div>
                  </div>
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
