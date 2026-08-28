"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  CheckCircle2,
  Flame,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import {
  useAchievements,
  useCohortPulse,
  useProgressPulse,
} from "../api/progress.queries";

/**
 * Dashboard widget combining personal-pulse + cohort-pulse + a tiny
 * teaser of recent achievements. Intentionally non-comparative — no
 * leaderboards, no per-student rank. Three sections:
 *
 *   1. Personal stats (streak, on-time %, mastery %)
 *   2. Cohort pulse (latest assignment submission %, this-week activity)
 *   3. Latest 3 earned badges + link to the profile achievements tab
 *
 * Self-hides while loading; renders even when stats are zero so a
 * student new to the platform sees goal posts rather than an empty slot.
 */
export function ProgressPulseCard() {
  const { data: pulse, isLoading: pulseLoading } = useProgressPulse();
  const { data: cohorts, isLoading: cohortsLoading } = useCohortPulse();
  const { data: achievements } = useAchievements();

  if (pulseLoading && cohortsLoading) {
    return <Skeleton className="h-44 w-full rounded-2xl" />;
  }

  const recent = (achievements || []).filter((a) => a.earned).slice(0, 3);
  const cohort = (cohorts || [])[0];

  return (
    <Card className="p-5 bg-gradient-to-br from-primary/[0.04] via-card to-accent/[0.03] border-primary/15">
      <header className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Your pulse
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Where you are right now. Not a leaderboard.
          </p>
        </div>
        <Link
          href="/profile?tab=achievements"
          className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1"
        >
          Trophy case <ArrowRight className="h-3 w-3" />
        </Link>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Tile
          icon={<Flame className="h-4 w-4" />}
          tone="accent"
          label="On-time streak"
          value={pulse?.currentStreak ?? 0}
          caption={
            (pulse?.currentStreak ?? 0) >= 3
              ? "Keep it going"
              : "Submit on time to start"
          }
        />
        <Tile
          icon={<CheckCircle2 className="h-4 w-4" />}
          tone="emerald"
          label="On time"
          value={
            typeof pulse?.onTimePct === "number" ? `${pulse.onTimePct}%` : "—"
          }
          caption={`${pulse?.onTimeSubmissions ?? 0} of ${
            pulse?.totalSubmissions ?? 0
          } submissions`}
        />
        <Tile
          icon={<Trophy className="h-4 w-4" />}
          tone="primary"
          label="Mastery"
          value={
            typeof pulse?.masteryAvgPct === "number"
              ? `${pulse.masteryAvgPct}%`
              : "—"
          }
          caption={
            pulse?.gradedCount
              ? `Across ${pulse.gradedCount} graded`
              : "No grades yet"
          }
        />
      </div>

      {cohort && (
        <div className="mt-4 rounded-lg border border-border bg-muted/30 p-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">
              {cohort.courseName || "Your cohort"}
            </span>
          </div>
          {typeof cohort.latestSubmissionPct === "number" && (
            <span className="text-xs text-muted-foreground">
              <strong className="text-foreground">
                {cohort.latestSubmissionPct}%
              </strong>{" "}
              of cohort submitted latest assignment
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            <strong className="text-foreground">
              {cohort.submissionsThisWeek}
            </strong>{" "}
            submissions this week
          </span>
          {typeof cohort.cohortAvgGradePct === "number" && (
            <span className="text-xs text-muted-foreground">
              Cohort avg{" "}
              <strong className="text-foreground">
                {cohort.cohortAvgGradePct}%
              </strong>
            </span>
          )}
        </div>
      )}

      {recent.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Recent badges:</span>
          {recent.map((a) => (
            <span
              key={a.type}
              className={
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium " +
                toneClass(a.tone)
              }
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
    accent: "bg-accent/15 text-accent",
    emerald:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  };
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-2 mb-1.5">
        <span
          className={
            "inline-flex h-7 w-7 items-center justify-center rounded-full " +
            palette[tone]
          }
        >
          {icon}
        </span>
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
      </div>
      <p className="text-2xl font-bold leading-none">{value}</p>
      <p className="text-xs text-muted-foreground mt-1.5">{caption}</p>
    </div>
  );
}

function toneClass(tone: string): string {
  switch (tone) {
    case "primary":
      return "bg-primary/10 text-primary border border-primary/20";
    case "accent":
      return "bg-accent/15 text-accent border border-accent/30";
    case "emerald":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-900";
    case "blue":
      return "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-900";
    case "amber":
      return "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-900";
    case "violet":
      return "bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-950/40 dark:text-violet-200 dark:border-violet-900";
    default:
      return "bg-muted text-foreground border border-border";
  }
}
