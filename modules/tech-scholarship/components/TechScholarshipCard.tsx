"use client";
import { useState } from "react";
import { NagItem } from "@/components/ui/ledger";
import { useMyScholarship } from "../api/tech-scholarship.queries";
import {
  isActiveScholar,
  scholarshipTierLabel,
  scholarshipTrackLabel,
} from "../types";
import { ShareMilestoneDialog } from "./ShareMilestoneDialog";

/**
 * Tech Scholarship nudge in the dashboard's "Needs a look" ledger.
 * Self-gating: renders only for stage `admitted` or `enrolled` (legacy
 * ACTIVE_STAGES) — earlier funnel stages, rejected and withdrawn get
 * nothing, and so does a failed fetch (never nag on an error).
 */
export function TechScholarshipCard() {
  const { data, isLoading } = useMyScholarship();
  const [shareOpen, setShareOpen] = useState(false);

  if (isLoading) return null;
  if (!data || !isActiveScholar(data)) return null;

  const track = scholarshipTrackLabel(data.track);
  const tier = scholarshipTierLabel(data.awardedTier);
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