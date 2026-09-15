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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="h-4 w-4" /> Achievements & badges
        </CardTitle>
        <CardDescription>
          {isLoading
            ? "Loading your progress…"
            : earned.length === 0
              ? "Complete course modules and submit assignments to earn your first badge."
              : `${earned.length} of ${achievements.length} earned. Keep up the great work.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
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
              <section className="space-y-2 pt-2 border-t">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground pt-3">
                  Goal posts
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
        "flex items-start gap-3 rounded-xl border p-4",
        muted ? "opacity-60 grayscale bg-muted/30" : toneClass(badge.tone),
      )}
    >
      <span
        className={
          "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full " +
          (muted ? "bg-muted text-muted-foreground" : iconBgClass(badge.tone))
        }
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="font-semibold text-sm leading-tight text-foreground">{badge.label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {badge.description}
        </p>
        {badge.awardedAt && (
          <p className="text-[11px] text-muted-foreground mt-1 font-medium">
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
