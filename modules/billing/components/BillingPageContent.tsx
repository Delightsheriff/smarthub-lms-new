"use client";
import { Receipt } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { formatPrice } from "@/lib/utils";
import { useBillingBreakdown } from "../api/billing.queries";
import { BillingSummaryCard } from "./BillingSummaryCard";
import { RegistrationBillingCard } from "./RegistrationBillingCard";
import { RefreshButton } from "@/components/ui/refresh-button";
import { Skeleton } from "@/components/ui/skeleton";

export function BillingPageContent() {
  const { data, isLoading, isFetching, error, refetch } = useBillingBreakdown();

  const dateline = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const fullyPaid = data && data.overall.totalDue <= 0 && data.overall.totalAmount > 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        variant="editorial"
        divider
        dateline={`${dateline} · Student Accounts`}
        title="Tuition & Billing"
        description={
          !isLoading && data && data.registrations.length > 0 ? (
            fullyPaid ? (
              <>
                All course enrolments are <strong className="text-foreground">paid in full</strong>. No outstanding balance.
              </>
            ) : (
              <>
                <strong className="text-foreground">{formatPrice(data.overall.totalDue)}</strong> outstanding across{" "}
                <strong className="text-foreground">{data.registrations.length}</strong> {data.registrations.length === 1 ? "course" : "courses"}
                {" · "}
                <strong className="text-foreground">{formatPrice(data.overall.totalPaid)}</strong> paid to date.
              </>
            )
          ) : (
            "Track your tuition payments, instalments, and account balances."
          )
        }
        actions={<RefreshButton loading={isFetching} onClick={refetch} />}
      />

      {error ? (
        <Card className="space-y-2 border-destructive/20 bg-destructive/5 p-6 text-center md:p-8">
          <p className="font-semibold">We couldn&apos;t load your billing</p>
          <p className="text-sm text-muted-foreground">
            Please refresh the page. If this keeps happening, contact admin.
          </p>
        </Card>
      ) : !data || data.registrations.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No billing records yet"
          description="Once an enrolment is recorded for you, your payment history, outstanding balance, and instalment schedule will appear here."
        />
      ) : (
        <>
          <BillingSummaryCard overall={data.overall} />

          <section className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-foreground">Per course</h2>
            {/* IndexList-style container — each RegistrationBillingCard
                renders as an expandable hairline row */}
            <div className="border-t border-border">
              {data.registrations.map((r) => (
                <RegistrationBillingCard key={r.id} registration={r} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
