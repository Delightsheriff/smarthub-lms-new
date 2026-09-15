"use client";
import { ArrowRight, BadgePercent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { publicSiteOrigin } from "@/lib/public-origin";
import {
  useMyPass,
  useSelfPacedCourses,
  useUpgradeCredits,
} from "../api/self-paced.queries";
import { formatMinor } from "../lib/format";
import type { UpgradeCredit } from "../types";

/**
 * What a self-paced purchase is worth toward a live cohort programme,
 * while it still is. Self-gating: renders nothing without an available
 * credit.
 */
export function UpgradeCreditBanner({ trackSlug }: { trackSlug?: string }) {
  // Only self-paced buyers and pass holders can hold a credit.
  const { data: courses } = useSelfPacedCourses();
  const { data: pass } = useMyPass();
  const { data } = useUpgradeCredits({
    enabled: (courses?.length ?? 0) > 0 || !!pass?.active,
  });
  const credits = (data ?? []).filter(
    (c) =>
      !trackSlug ||
      c.anyCohort ||
      c.eligibleTracks.some((t) => t.slug === trackSlug)
  );
  if (!credits.length) return null;

  return (
    <div className="space-y-3">
      {credits.map((c) => (
        <CreditCard key={c.orderId} credit={c} trackSlug={trackSlug} />
      ))}
    </div>
  );
}

function CreditCard({
  credit,
  trackSlug,
}: {
  credit: UpgradeCredit;
  trackSlug?: string;
}) {
  const origin = publicSiteOrigin();
  const tracks = credit.eligibleTracks.filter((t) => !!t.slug);
  const shown = trackSlug
    ? tracks.filter((t) => t.slug === trackSlug)
    : tracks;
  const value = formatMinor(credit.valueMinor, credit.currency);
  const toward = credit.anyCohort
    ? "any cohort programme"
    : shown.map((t) => t.name || "the full programme").join(", ");

  return (
    <Card className="p-5 border-accent/30 bg-accent/[0.04]">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15">
          <BadgePercent className="h-5 w-5 text-accent" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold leading-tight">
            {value} upgrade credit
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            What you paid for {credit.itemName} counts toward {toward}.
            {credit.expiresAt && (
              <>
                {" "}
                Use it by <strong>{formatDate(credit.expiresAt, "long")}</strong>.
              </>
            )}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {credit.anyCohort || !shown.length ? (
              <Button
                size="sm"
                render={
                  <a href={`${origin}/courses`} target="_blank" rel="noopener noreferrer">
                    Browse cohort programmes
                    <ArrowRight className="h-4 w-4" />
                  </a>
                }
              />
            ) : (
              shown.map((t) => (
                <Button
                  key={t.id}
                  size="sm"
                  variant={shown.length > 1 ? "outline" : "default"}
                  render={
                    <a
                      href={`${origin}/courses/${t.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {shown.length > 1 ? t.name || "See the programme" : "See the programme"}
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  }
                />
              ))
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Mention it when you register and the team will apply it to your fee.
          </p>
        </div>
      </div>
    </Card>
  );
}
