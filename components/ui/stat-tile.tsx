import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const TONE_BG = {
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/15 text-accent",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
  neutral: "bg-muted text-muted-foreground",
} as const;

export interface StatTileProps {
  label: ReactNode;
  value: ReactNode;
  icon?: ReactNode;
  tone?: keyof typeof TONE_BG;
  caption?: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}

/**
 * Shared bento-tile shape — consistent across Dashboard (ProgressPulseCard,
 * StatsStrip), Instructor Earnings (Plan 006), and Instructor Self-Paced (Plan 005).
 * Rounded card with optional icon circle, mono uppercase micro-label,
 * big tabular display number, and optional caption / hint.
 */
export function StatTile({
  label,
  value,
  icon,
  tone = "neutral",
  caption,
  href,
  onClick,
  className,
}: StatTileProps) {
  const isInteractive = Boolean(href || onClick);

  const content = (
    <div
      className={cn(
        "flex flex-col justify-between rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs transition-colors",
        isInteractive && "hover:border-primary/40 cursor-pointer",
        className,
      )}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          {icon && (
            <span
              className={cn(
                "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                TONE_BG[tone],
              )}
            >
              {icon}
            </span>
          )}
          <span className="truncate font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            {label}
          </span>
        </div>
        <p className="mt-1 font-display text-2xl font-bold leading-tight tabular-nums text-foreground">
          {value}
        </p>
      </div>
      {caption && (
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          {caption}
        </p>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block group">
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="block w-full text-left group"
      >
        {content}
      </button>
    );
  }

  return content;
}
