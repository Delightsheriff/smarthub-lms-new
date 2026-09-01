"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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

  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
    );
  }

  const achievements = data || [];
  const earned = achievements.filter((a) => a.earned);
  const locked = achievements.filter((a) => !a.earned);

  return (
    <div className="space-y-5">
      <header>
        <h2 className="font-semibold text-base flex items-center gap-2 text-foreground">
          <Trophy className="h-4 w-4 text-primary" />
          Achievements & Badges
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {earned.length === 0
            ? "Complete course modules and submit assignments to earn your first badge."
            : `${earned.length} of ${achievements.length} earned. Keep up the great work.`}
        </p>
      </header>

      {earned.length > 0 && (
        <section className="grid gap-3 sm:grid-cols-2">
          {earned.map((a) => (
            <BadgeCard key={a.type} badge={a} />
          ))}
        </section>
      )}

      {locked.length > 0 && (
        <section className="space-y-2 pt-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Goal Posts
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {locked.map((a) => (
              <BadgeCard key={a.type} badge={a} muted />
            ))}
          </div>
        </section>
      )}
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
    <Card
      className={
        "p-4 flex items-start gap-3 rounded-2xl border transition-shadow " +
        (muted ? "opacity-60 grayscale bg-muted/30" : toneClass(badge.tone))
      }
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
    </Card>
  );
}

function toneClass(tone: string): string {
  switch (tone) {
    case "primary":
      return "border-primary/20 bg-primary/[0.04]";
    case "accent":
      return "border-amber-500/20 bg-amber-500/[0.04]";
    case "emerald":
      return "border-emerald-500/20 bg-emerald-500/[0.04]";
    case "blue":
      return "border-blue-500/20 bg-blue-500/[0.04]";
    case "amber":
      return "border-amber-500/20 bg-amber-500/[0.04]";
    case "violet":
      return "border-violet-500/20 bg-violet-500/[0.04]";
    default:
      return "bg-card";
  }
}

function iconBgClass(tone: string): string {
  switch (tone) {
    case "primary":
      return "bg-primary text-primary-foreground";
    case "accent":
      return "bg-amber-500 text-white";
    case "emerald":
      return "bg-emerald-500 text-white";
    case "blue":
      return "bg-blue-500 text-white";
    case "amber":
      return "bg-amber-500 text-white";
    case "violet":
      return "bg-violet-500 text-white";
    default:
      return "bg-muted text-foreground";
  }
}
