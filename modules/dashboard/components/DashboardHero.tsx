import type { ReactNode } from "react";
import Link from "next/link";

/**
 * The dashboard's dominant "continue learning" slot — the ~2/3 hero of
 * the hero + ledger row. Shared by the cohort course and, for a
 * self-paced-only learner, their unfinished self-paced course, so both
 * read as the same object rather than two different cards.
 */
export function DashboardHero({
  cover,
  badge = "Continue learning",
  meta,
  title,
  body,
  progress,
  progressLabel,
  href,
  cta = "Resume →",
}: {
  /** Fills the 190px cover band (an Image / CourseCover), or nothing. */
  cover?: ReactNode;
  badge?: string;
  /** Mono small-caps line above the title ("Online · 3 Mar 2026"). */
  meta?: ReactNode;
  title: string;
  body?: ReactNode;
  /** 0–100; omit to hide the rule. */
  progress?: number;
  /** Trailing label for the rule; defaults to "{progress}%". */
  progressLabel?: ReactNode;
  href: string;
  cta?: ReactNode;
}) {
  return (
    <div className="flex min-h-[300px] flex-col overflow-hidden rounded-[20px] border border-border bg-card">
      <div className="relative h-[190px] shrink-0 bg-gradient-to-br from-foreground/90 to-accent/60 dark:from-background dark:to-accent/30">
        {cover}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" aria-hidden />
        <span className="absolute left-4 top-4 rounded-full bg-black/40 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-white">
          {badge}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3.5 p-5 md:p-6">
        <div>
          {meta && (
            <p className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-muted-foreground">
              {meta}
            </p>
          )}
          <h2 className="mt-1 font-display text-2xl font-semibold leading-[1.15] text-foreground">
            {title}
          </h2>
        </div>
        {body && (
          <p className="text-[13.5px] leading-relaxed text-muted-foreground line-clamp-2">
            {body}
          </p>
        )}
        {typeof progress === "number" && (
          <div className="mt-auto flex items-center gap-3">
            <div className="relative h-0.5 flex-1 rounded-full bg-border">
              <span
                className="absolute inset-y-0 left-0 rounded-full bg-primary"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
            <span className="shrink-0 font-mono text-xs tabular-nums text-foreground">
              {progressLabel ?? `${progress}%`}
            </span>
          </div>
        )}
        <div className={typeof progress === "number" ? "flex justify-end" : "mt-auto flex justify-end"}>
          <Link
            href={href}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            {cta}
          </Link>
        </div>
      </div>
    </div>
  );
}
