"use client";
import { useState } from "react";
import { GraduationCap, Share2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMyScholarship } from "../api/tech-scholarship.queries";
import { SCHOLARSHIP_TIERS, SCHOLARSHIP_TRACKS } from "../types";
import { ShareMilestoneDialog } from "./ShareMilestoneDialog";

/**
 * Dashboard tile for Tech Scholarship holders. Self-gating: students
 * whose application isn't at an awarded/enrolled stage render nothing.
 */
export function TechScholarshipCard() {
  const { data, isLoading } = useMyScholarship();
  const [shareOpen, setShareOpen] = useState(false);

  if (isLoading) return null;
  if (!data) return null;

  const track = SCHOLARSHIP_TRACKS[data.track] || data.track;
  const tier = data.awardedTier ? SCHOLARSHIP_TIERS[data.awardedTier] : undefined;
  const hasCoupon = Boolean(data.siwesCouponCode);

  return (
    <Card className="border-border bg-card p-4 md:p-5 overflow-hidden font-sans">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <GraduationCap className="h-4 w-4" />
          </div>
          <div className="min-w-0 space-y-0.5">
            <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
              <span className="h-px w-4 bg-accent" aria-hidden />
              Tech Scholarship
            </p>
            <p className="font-display text-lg font-normal leading-snug truncate">
              {tier || "Scholar"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {track} · {data.cohort}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="shrink-0"
          onClick={() => setShareOpen(true)}
        >
          <Share2 className="h-3.5 w-3.5 mr-1.5" />
          Share
        </Button>
      </div>

      {hasCoupon && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2">
          <Sparkles className="h-3.5 w-3.5 text-success" />
          <span className="text-xs text-muted-foreground">
            SIWES coupon{" "}
            <span className="font-mono text-xs font-semibold text-foreground">
              {data.siwesCouponCode}
            </span>
          </span>
          <Badge variant="secondary" className="ml-auto">
            at work
          </Badge>
        </div>
      )}

      <ShareMilestoneDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
      />
    </Card>
  );
}