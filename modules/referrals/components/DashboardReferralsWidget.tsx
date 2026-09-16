"use client";
import Link from "next/link";
import { ArrowRight, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { useMyReferrals } from "../queries/use-my-referrals";

/**
 * Compact "Refer & earn" nudge under the dashboard welcome card.
 *
 * Mirrors the billing widget's affordance shape (icon + label + value
 * + CTA on the right) so dashboard rhythm stays consistent.
 *
 * Visibility rules:
 *  - Hidden until the data resolves (no skeleton — the dashboard
 *    already has enough loading affordance).
 *  - Hidden if there's no referral code yet — without a code there's
 *    nothing to share.
 *
 * When there's no activity, show a "share your link" nudge with the
 * commission rate; when there's activity, show earned (paid + still-
 * earned) as the headline number.
 */
export function DashboardReferralsWidget() {
  const { data } = useMyReferrals();

  if (!data?.code) return null;

  const totals = data.totals;
  const hasActivity =
    (data.uses ?? 0) > 0 ||
    (totals?.earnedNaira ?? 0) > 0 ||
    (totals?.paidNaira ?? 0) > 0 ||
    (totals?.pendingNaira ?? 0) > 0;

  return (
    <Card className="rounded-2xl border-primary/20 bg-primary/5 p-4 md:p-5 shadow-sm hover:border-primary/40 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Share2 className="h-4 w-4" />
          </div>
          <div className="min-w-0 space-y-0.5">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
              {hasActivity ? "Earned so far" : "Refer & earn"}
            </p>
            <div className="text-base font-semibold tabular-nums">
              {hasActivity ? (
                formatPrice(
                  (totals?.earnedNaira ?? 0) + (totals?.paidNaira ?? 0),
                )
              ) : (
                <span className="font-normal text-muted-foreground">
                  {typeof data.commissionRate === "number" &&
                  data.commissionRate > 0 ? (
                    <>
                      Share your link, earn{" "}
                      <strong className="text-primary">
                        {data.commissionRate}%
                      </strong>{" "}
                      when friends enrol.
                    </>
                  ) : (
                    <>Share your link and earn when friends enrol.</>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
        <Button
          render={<Link href="/refer-and-earn" />}
          size="sm"
          variant="outline"
          className="shrink-0"
        >
          {hasActivity ? "Open ledger" : "Get your link"}
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </Card>
  );
}
