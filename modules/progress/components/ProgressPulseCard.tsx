"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  CheckCircle2,
  Flame,
  Target,
  Trophy,
} from "lucide-react";
import {
  useAchievements,
  useProgressPulse,
} from "../api/progress.queries";

export function ProgressPulseCard() {
  const { data: pulse, isLoading: pulseLoading } = useProgressPulse();
  const { data: achievements } = useAchievements();

  if (pulseLoading) {
    return <Skeleton className="h-44 w-full rounded-2xl" />;
  }

  const recent = (achievements || []).filter((a) => a.earned).slice(0, 3);

  return (
    <Card className="p-5 bg-gradient-to-br from-primary/[0.04] via-card to-amber-500/[0.03] border-primary/15 rounded-2xl shadow-sm space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-base flex items-center gap-2 text-foreground">
            <Target className="h-4 w-4 text-primary" />
            Your Learning Pulse
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Personal progress highlights and milestones.
          </p>
        </div>
        <Link
          href="/profile?tab=achievements"
          className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1"
        >
          Trophy case <ArrowRight className="h-3 w-3" />
        </Link>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Tile
          icon={<Flame className="h-4 w-4" />}
          tone="accent"
          label="On-time streak"
          value={pulse?.earnedCount ?? 0}
          caption="Submissions on time"
        />
        <Tile
          icon={<CheckCircle2 className="h-4 w-4" />}
          tone="emerald"
          label="Completed"
          value={
            typeof pulse?.earnedCount === "number" ? `${pulse.earnedCount}` : "—"
          }
          caption={`Out of ${pulse?.totalCount ?? 0} total tasks`}
        />
        <Tile
          icon={<Trophy className="h-4 w-4" />}
          tone="primary"
          label="Next Milestone"
          value={pulse?.nextMilestone || "Keep Learning"}
          caption="Keep going to unlock"
        />
      </div>

      {recent.length > 0 && (
        <div className="pt-2 flex flex-wrap items-center gap-2 border-t">
          <span className="text-xs text-muted-foreground font-medium">Recent badges:</span>
          {recent.map((a) => (
            <span
              key={a.type}
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium bg-primary/10 text-primary border border-primary/20"
              title={a.description}
            >
              <Trophy className="h-3 w-3" />
              {a.label}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
}

function Tile({
  icon,
  tone,
  label,
  value,
  caption,
}: {
  icon: React.ReactNode;
  tone: "primary" | "accent" | "emerald";
  label: string;
  value: string | number;
  caption: string;
}) {
  const palette: Record<typeof tone, string> = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    emerald:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  };
  return (
    <div className="rounded-xl border border-border bg-card p-3.5 space-y-1">
      <div className="flex items-center gap-2">
        <span
          className={
            "inline-flex h-7 w-7 items-center justify-center rounded-full " +
            palette[tone]
          }
        >
          {icon}
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      <p className="text-xl font-bold leading-tight text-foreground truncate">{value}</p>
      <p className="text-xs text-muted-foreground">{caption}</p>
    </div>
  );
}
