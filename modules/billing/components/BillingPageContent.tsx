"use client";
import { Receipt } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useBillingBreakdown } from "../api/billing.queries";
import { BillingSummaryCard } from "./BillingSummaryCard";
import { RegistrationBillingCard } from "./RegistrationBillingCard";

export function BillingPageContent() {
  const { data, isLoading, error } = useBillingBreakdown();

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
        title="Billing"
        description="Track your payments, instalments, and outstanding balance."
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
            <h2 className="font-semibold">Per course</h2>
            <div className="space-y-4">
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
