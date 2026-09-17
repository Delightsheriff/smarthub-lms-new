"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Flame,
  Medal,
  Rocket,
  Sparkles,
  Star,
  Trophy,
} from "lucide-react";
import { useAchievements } from "../api/progress.queries";
import type { Achievement, AchievementIcon } from "../types";

const ICONS: Record<
  AchievementIcon,
  React.ComponentType<{ className?: string }>
> = {
  rocket: Rocket,
  "check-circle": CheckCircle2,
  flame: Flame,
  medal: Medal,
  trophy: Trophy,
  sparkles: Sparkles,
  star: Star,
};

export function AchievementsList() {
  const { data, isLoading } = useAchievements();

  const achievements = data || [];
  const earned = achievements.filter((a) => a.earned);
  const locked = achievements.filter((a) => !a.earned);
  const percent = achievements.length > 0 ? Math.round((earned.length / achievements.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Bento summary tiles matching ProgressPulseCard shape */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
            Total Badges
          </p>
          <p className="mt-1.5 font-display text-2xl font-bold text-foreground">
            {isLoading ? "—" : achievements.length}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Available milestones</p>
        </div>

        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 shadow-xs">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-primary">
            Earned
          </p>
          <p className="mt-1.5 font-display text-2xl font-bold text-primary">
            {isLoading ? "—" : earned.length}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Completed so far</p>
        </div>

        <div className="rounded-2xl border border-accent/20 bg-accent/5 p-4 shadow-xs">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-accent">
            Progress
          </p>
          <p className="mt-1.5 font-display text-2xl font-bold text-accent">
            {isLoading ? "—" : `${percent}%`}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isLoading ? "Calculating..." : `${locked.length} to unlock`}
          </p>
        </div>
      </div>

      <Card className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/20 p-5">
          <CardTitle className="flex items-center gap-2 text-base font-display">
            <Trophy className="h-4 w-4 text-primary" /> Achievements & Badges
          </CardTitle>
          <CardDescription>
            {isLoading
              ? "Loading your progress…"
              : earned.length === 0
                ? "Complete course modules and submit assignments to earn your first badge."
                : `${earned.length} of ${achievements.length} badges earned. Keep up the momentum.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 space-y-6">
          {isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
            </div>
          ) : (
            <>
              {earned.length > 0 && (
                <section className="grid gap-3 sm:grid-cols-2">
                  {earned.map((a) => (
                    <BadgeCard key={a.type} badge={a} />
                  ))}
                </section>
              )}

              {locked.length > 0 && (
                <section className="space-y-3 pt-3 border-t border-border">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    Locked Milestones
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {locked.map((a) => (
                      <BadgeCard key={a.type} badge={a} muted />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function BadgeCard({
  badge,
  muted,
}: {
  badge: Achievement;
  muted?: boolean;
}) {
  const Icon = ICONS[badge.icon] || Trophy;
  return (
    <div
      className={cn(
        "flex items-start gap-3.5 rounded-2xl border p-4 transition-all duration-200",
        muted ? "opacity-60 grayscale bg-muted/20 border-border" : cn("shadow-xs", toneClass(badge.tone)),
      )}
    >
      <span
        className={
          "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl " +
          (muted ? "bg-muted text-muted-foreground" : iconBgClass(badge.tone))
        }
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-display font-semibold text-sm leading-tight text-foreground">{badge.label}</p>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
          {badge.description}
        </p>
        {badge.awardedAt && (
          <p className="font-mono text-[10px] text-muted-foreground mt-1.5 font-medium">
            Earned{" "}
            {new Date(badge.awardedAt).toLocaleDateString(undefined, {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        )}
      </div>
    </div>
  );
}

// Only the app's real semantic tokens — no raw Tailwind palette shades.
// A badge's `tone` is a coarse category (not a 1:1 hue), so "blue" and
// "violet" fold into the two brand colors rather than reaching for an
// unrelated shade neither theme defines.
function toneClass(tone: string): string {
  switch (tone) {
    case "primary":
    case "blue":
      return "border-primary/20 bg-primary/[0.04]";
    case "accent":
    case "violet":
      return "border-accent/20 bg-accent/[0.04]";
    case "emerald":
      return "border-success/20 bg-success/[0.04]";
    case "amber":
      return "border-warning/20 bg-warning/[0.04]";
    default:
      return "bg-card";
  }
}

function iconBgClass(tone: string): string {
  switch (tone) {
    case "primary":
    case "blue":
      return "bg-primary text-primary-foreground";
    case "accent":
    case "violet":
      return "bg-accent text-accent-foreground";
    case "emerald":
      return "bg-success text-success-foreground";
    case "amber":
      return "bg-warning text-warning-foreground";
    default:
      return "bg-muted text-foreground";
  }
}
