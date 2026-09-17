"use client";
import { NagItem } from "@/components/ui/ledger";
import { formatPrice } from "@/lib/utils";
import { useMyReferrals } from "../queries/use-my-referrals";

/**
 * "Refer & earn" nudge in the dashboard's "Needs a look" ledger.
 *
 * Visibility rules:
 *  - Hidden until the data resolves.
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
    <NagItem
      tone="accent"
      title={
        hasActivity
          ? `${formatPrice((totals?.earnedNaira ?? 0) + (totals?.paidNaira ?? 0))} earned so far`
          : typeof data.commissionRate === "number" && data.commissionRate > 0
            ? `Share your link, earn ${data.commissionRate}% when friends enrol`
            : "Share your link and earn when friends enrol"
      }
      meta="Refer & earn"
      href="/refer-and-earn"
      cta={hasActivity ? "Open →" : "Get link →"}
    />
  );
}
