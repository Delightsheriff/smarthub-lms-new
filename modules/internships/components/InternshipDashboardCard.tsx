"use client";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress, ProgressIndicator, ProgressTrack } from "@/components/ui/progress";
import { useInternshipWorkspace } from "../api/internships.queries";

/**
 * Dashboard tile into the internship workspace. Self-gating: hidden
 * when the student has no placement (grads / non-interns never see it).
 */
export function InternshipDashboardCard() {
  const { data, isLoading } = useInternshipWorkspace();

  if (isLoading) return null;
  if (!data) return null;

  return (
    <Card className="rounded-2xl border-border bg-card p-4 md:p-5 shadow-sm hover:border-primary/40 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BriefcaseBusiness className="h-4 w-4" />
          </div>
          <div className="min-w-0 space-y-0.5">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
              Internship
            </p>
            <p className="text-base font-semibold truncate">
              {data.internship.product.name}
            </p>
            <p className="text-xs text-muted-foreground tabular-nums">
              {data.progressPercent}% complete
            </p>
          </div>
        </div>
        <Button
          render={<Link href="/internships" />}
          size="sm"
          variant="outline"
          className="shrink-0"
        >
          Workspace <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
      <Progress value={data.progressPercent} className="mt-4 gap-3">
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </Progress>
    </Card>
  );
}