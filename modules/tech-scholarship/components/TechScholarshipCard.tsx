"use client";
import { useState } from "react";
import { NagItem } from "@/components/ui/ledger";
import { useMyScholarship } from "../api/tech-scholarship.queries";
import { SCHOLARSHIP_TIERS, SCHOLARSHIP_TRACKS } from "../types";
import { ShareMilestoneDialog } from "./ShareMilestoneDialog";

/**
 * Tech Scholarship nudge in the dashboard's "Needs a look" ledger.
 * Self-gating: students whose application isn't at an awarded/enrolled
 * stage render nothing.
 */
export function TechScholarshipCard() {
  const { data, isLoading } = useMyScholarship();
  const [shareOpen, setShareOpen] = useState(false);

  if (isLoading) return null;
  if (!data) return null;

  const track = SCHOLARSHIP_TRACKS[data.track] || data.track;
  const tier = data.awardedTier ? SCHOLARSHIP_TIERS[data.awardedTier] : undefined;
  const meta = [
    tier || "Scholar",
    track,
    data.cohort,
    data.siwesCouponCode ? `coupon ${data.siwesCouponCode} active` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <NagItem
        tone="accent"
        title="Tech Scholarship milestone ready to share"
        meta={meta}
        onClick={() => setShareOpen(true)}
        cta="Share →"
      />
      <ShareMilestoneDialog open={shareOpen} onOpenChange={setShareOpen} />
    </>
  );
}