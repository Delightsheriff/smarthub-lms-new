"use client";
import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, Receipt, Share2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Ledger, LedgerControlItem } from "@/components/ui/ledger";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshButton } from "@/components/ui/refresh-button";
import { StatTile } from "@/components/ui/stat-tile";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPrice, pluralize } from "@/lib/utils";
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

  const dateline = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

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
        divider
        dateline={`${dateline} · Affiliate Programme`}
        title="Refer & Earn"
        description={
          totals.earnedNaira > 0 ? (
            <>
              Share your link, track sign-ups, and withdraw what you earn. Total earned:{" "}
              <strong className="text-foreground">{`₦${totals.earnedNaira.toLocaleString("en-NG")}`}</strong>
              {totals.pendingNaira > 0 && (
                <>
                  {" · "}
                  <strong className="text-foreground">{`₦${totals.pendingNaira.toLocaleString("en-NG")}`}</strong> pending
                </>
              )}
            </>
          ) : (
            "Share your link, track sign-ups, and withdraw what you earn."
          )
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="overflow-x-auto pb-0.5 max-w-full">
              <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
                <TabsList className="rounded-xl bg-muted/60 p-1 w-max">
                  {TABS.map((t) => (
                    <TabsTrigger key={t.key} value={t.key} className="rounded-lg text-xs">
                      {t.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
            <RefreshButton
              loading={isFetching || banking.isFetching || payouts.isFetching}
              onClick={() => Promise.allSettled([refetch(), banking.refetch(), payouts.refetch()])}
            />
          </div>
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
                {pluralize(data.uses, "sign-up", undefined, false)}
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatTile
              icon={<Clock className="h-4 w-4" />}
              label="Pending"
              value={formatPrice(totals.pendingNaira)}
              caption="Awaiting payment"
              tone="warning"
            />
            <StatTile
              icon={<Wallet className="h-4 w-4" />}
              label="Earned"
              value={formatPrice(totals.earnedNaira)}
              caption="Ready or in clawback"
              tone="accent"
            />
            <StatTile
              icon={<CheckCircle2 className="h-4 w-4" />}
              label="Paid"
              value={formatPrice(totals.paidNaira)}
              caption="Withdrawn to bank"
              tone="success"
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
          <ReferralLedger records={records} />
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
              nativeButton={false} render={<Link href="/profile?tab=banking" />}
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
        <PayoutsLedger
          items={payouts.data.items}
          onCancel={(id) => cancelPayout.mutate(id)}
          isCancelling={cancelPayout.isPending}
        />
      )}
    </section>
  );
}

function PayoutsLedger({
  items,
  onCancel,
  isCancelling,
}: {
  items: Payout[];
  onCancel: (id: string) => void;
  isCancelling: boolean;
}) {
  return (
    <Ledger title="Payout requests" count={items.length}>
      {items.map((item) => (
        <LedgerControlItem
          key={item._id}
          icon={Receipt}
          title={
            <div className="flex items-center gap-2">
              <span className="font-bold tabular-nums">
                {formatPrice(item.totalAmount)}
              </span>
              <StatusBadge status={item.status} />
            </div>
          }
          meta={
            <span>
              {item.bankSnapshot.bankName} · Requested {formatRelative(item.createdAt)}
              {item.processedAt ? ` · Processed ${formatRelative(item.processedAt)}` : ""}
            </span>
          }
          actions={
            item.status === "pending" ? (
              <Button
                variant="ghost"
                size="sm"
                className="rounded-lg text-xs"
                disabled={isCancelling}
                onClick={() => onCancel(item._id)}
              >
                Cancel
              </Button>
            ) : null
          }
        />
      ))}
    </Ledger>
  );
}

function ReferralLedger({ records }: { records: ReferralRecord[] }) {
  return (
    <Ledger title="Referral records" count={records.length}>
      {records.map((r) => {
        const fullName =
          [r.referred?.firstName, r.referred?.lastName]
            .filter(Boolean)
            .join(" ") || "Anonymous";
        const courseName =
          (typeof r.registration?.course === "object"
            ? r.registration?.course?.name
            : r.registration?.course) || "—";
        const earned = Number(r.amount) || 0;
        const potential = Number(r.potentialAmount) || 0;
        const amountDisplay =
          earned > 0 && potential > 0 && potential > earned ? (
            <span>
              <span className="font-semibold text-success">{formatPrice(earned)}</span>{" "}
              <span className="text-xs font-normal text-muted-foreground">of {formatPrice(potential)}</span>
            </span>
          ) : earned > 0 ? (
            formatPrice(earned)
          ) : potential > 0 ? (
            <span>
              <span className="text-xs font-normal italic text-muted-foreground">Potential</span>{" "}
              <span className="font-semibold">{formatPrice(potential)}</span>
            </span>
          ) : (
            <span className="italic text-muted-foreground">awaiting payment</span>
          );

        return (
          <LedgerControlItem
            key={r._id}
            icon={Share2}
            title={
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{fullName}</span>
                <span className="text-muted-foreground font-normal">· {courseName}</span>
              </div>
            }
            meta={
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-foreground">{amountDisplay}</span>
                <span>·</span>
                <span>{formatRelative(r.registration?.createdAt || r.createdAt)}</span>
                {r.referred?.email && (
                  <>
                    <span>·</span>
                    <span>{r.referred.email}</span>
                  </>
                )}
              </div>
            }
            actions={<StatusBadge status={r.status} />}
          />
        );
      })}
    </Ledger>
  );
}
