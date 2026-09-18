"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import { LifeBuoy, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate, formatPrice } from "@/lib/utils";
import { useMyInstallmentPlans } from "../api/payment-proofs.queries";
import { resolvePaymentGate } from "../lib/payment-gate";
import type { MyInstallmentPlanUi } from "../types";

/**
 * Full-page paywall for a learner whose access is paused for non-payment.
 *
 * Client-side companion to the API's 402: the server is the authority
 * (every content endpoint refuses), this exists so they get one clear
 * screen explaining why and what to do. The block/open decision lives
 * in `resolvePaymentGate` (pure, unit-tested); this component only owns
 * the query + the paywall render.
 *
 * Deliberately not a modal — a dismissible overlay over content they
 * can't load would be worse than the truth.
 */
export function PaymentGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data: plans, isLoading } = useMyInstallmentPlans();

  // Don't flash the paywall while we're still asking.
  if (isLoading) return <>{children}</>;

  const decision = resolvePaymentGate(plans, pathname);
  if (decision.kind === "open") return <>{children}</>;

  return <PaywallScreen plan={decision.plan} />;
}

function PaywallScreen({ plan }: { plan: MyInstallmentPlanUi }) {
  const due = plan.nextDue;

  return (
    <div className="mx-auto max-w-xl py-10">
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-warning/10">
          <Lock className="h-5 w-5 text-warning" />
        </div>

        <h1 className="mt-4 text-xl font-semibold text-foreground">
          Your course access is paused
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          There&apos;s an outstanding payment on
          {plan.courseName ? ` ${plan.courseName}` : " your course"}. Your
          work, your progress and your place on the cohort are all still
          here — access comes straight back once the payment is confirmed.
        </p>

        <dl className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-border bg-muted/30 p-4">
          <div>
            <dt className="text-xs text-muted-foreground">Amount due</dt>
            <dd className="mt-1 text-lg font-semibold text-foreground">
              {formatPrice(plan.amountDue)}
            </dd>
          </div>
          {due ? (
            <div>
              <dt className="text-xs text-muted-foreground">
                Payment {due.sequence} was due
              </dt>
              <dd className="mt-1 text-lg font-semibold text-foreground">
                {formatDate(due.dueDate, "long")}
              </dd>
            </div>
          ) : null}
        </dl>

        <Button
          size="lg"
          className="mt-6 w-full"
          nativeButton={false} render={<Link href="/payments" />}
        >
          Make a payment
        </Button>

        <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
          <LifeBuoy className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            If something&apos;s changed and you need a different arrangement,
            message us from{" "}
            <Link href="/inbox" className="underline">
              your inbox
            </Link>{" "}
            or email{" "}
            <a href="mailto:info@smart-hub.academy" className="underline">
              info@smart-hub.academy
            </a>
            . We&apos;d rather sort it out than leave you locked out.
          </span>
        </p>
      </div>
    </div>
  );
}
