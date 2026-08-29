"use client";
import { Receipt } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useBillingBreakdown } from "../api/billing.queries";
import { BillingSummaryCard } from "./BillingSummaryCard";
import { RegistrationBillingCard } from "./RegistrationBillingCard";

export function BillingPageContent() {
  const { data, isLoading, error } = useBillingBreakdown();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="space-y-2 border-destructive/20 bg-destructive/5 p-6 text-center md:p-8">
        <p className="font-semibold">We couldn&apos;t load your billing</p>
        <p className="text-sm text-muted-foreground">
          Please refresh the page. If this keeps happening, contact admin.
        </p>
      </Card>
    );
  }

  if (!data || data.registrations.length === 0) {
    return (
      <div className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Billing
          </h1>
          <p className="text-sm text-muted-foreground">
            Track your payments, instalments, and outstanding balance.
          </p>
        </header>

        <Card className="space-y-2 p-8 text-center">
          <Receipt className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
          <p className="font-semibold">No billing records yet</p>
          <p className="mx-auto max-w-md text-sm text-muted-foreground">
            Once an enrolment is recorded for you, your payment history,
            outstanding balance, and instalment schedule will appear here.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Billing
        </h1>
        <p className="text-sm text-muted-foreground">
          Track your payments, instalments, and outstanding balance.
        </p>
      </header>

      <BillingSummaryCard overall={data.overall} />

      <section className="space-y-4">
        <h2 className="font-semibold">Per course</h2>
        <div className="space-y-4">
          {data.registrations.map((r) => (
            <RegistrationBillingCard key={r.id} registration={r} />
          ))}
        </div>
      </section>
    </div>
  );
}
