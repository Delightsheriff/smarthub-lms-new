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
    <Card className="p-5 rounded-2xl border-border bg-card shadow-sm">
      <header className="mb-4 flex items-center justify-between gap-2">
        <h2 className="font-display font-semibold text-base flex items-center gap-2 text-foreground">
          <Target className="h-4 w-4 text-primary" />
          Your Learning Pulse
        </h2>
        <Link
          href="/profile?tab=achievements"
          className="shrink-0 text-xs font-medium text-primary hover:underline inline-flex items-center gap-1"
        >
          Trophy case <ArrowRight className="h-3 w-3" />
        </Link>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <Tile
          icon={<Flame className="h-4 w-4" />}
          tone="accent"
          label="Streak"
          value={pulse?.earnedCount ?? 0}
          caption="On-time submissions"
        />
        <Tile
          icon={<CheckCircle2 className="h-4 w-4" />}
          tone="success"
          label="Completed"
          value={
            typeof pulse?.earnedCount === "number" ? `${pulse.earnedCount}` : "—"
          }
          caption={`Of ${pulse?.totalCount ?? 0} tasks`}
        />
        <Tile
          icon={<Trophy className="h-4 w-4" />}
          tone="primary"
          label="Next milestone"
          value={pulse?.nextMilestone || "Keep learning"}
          caption="Keep going to unlock"
        />
      </div>

      {recent.length > 0 && (
        <div className="mt-4 pt-3 flex flex-wrap items-center gap-2 border-t border-border">
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
  tone: "primary" | "accent" | "success";
  label: string;
  value: string | number;
  caption: string;
}) {
  const palette: Record<typeof tone, string> = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/15 text-accent",
    success: "bg-success/10 text-success",
  };
  return (
    <div className="rounded-xl border border-border/80 bg-background/50 p-3.5 space-y-1">
      <div className="flex items-center gap-2">
        <span
          className={
            "inline-flex h-7 w-7 items-center justify-center rounded-full " +
            palette[tone]
          }
        >
          {icon}
        </span>
        <span className="truncate text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      <p className="font-display text-xl font-bold leading-tight text-foreground line-clamp-1">{value}</p>
      <p className="truncate text-xs text-muted-foreground">{caption}</p>
    </div>
  );
}
