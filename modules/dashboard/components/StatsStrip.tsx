"use client";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Hourglass,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyAssignments } from "@/modules/assignments/api/assignments.queries";
import { cn } from "@/lib/utils";

interface Tile {
  label: string;
  value: number;
  icon: React.ElementType;
  tone: "primary" | "warning" | "success" | "destructive";
  href?: string;
}

const TONE_BG: Record<Tile["tone"], string> = {
  primary: "bg-primary/10 text-primary",
  warning: "bg-warning/10 text-warning",
  success: "bg-success/10 text-success",
  destructive: "bg-destructive/10 text-destructive",
};

/**
 * Four-up KPI strip on the dashboard — a quick "what's my workload?"
 * read. Computes counts from the already-cached `useMyAssignments`
 * rollup so it adds no extra round-trips. Each tile is a clickable
 * filter into /assignments.
 *
 * Tile order mirrors action priority: To do → Awaiting marking →
 * Reviewed → Overdue.
 */
export function DashboardStatsStrip() {
  const { data, isLoading } = useMyAssignments();

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <Skeleton className="mb-4 h-4 w-28" />
        <div className="grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[70px] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const all = data || [];
  const toDo = all.filter((a) => a.assignment.status === "draft").length;
  const awaitingRemark = all.filter(
    (a) => a.assignment.status === "submitted",
  ).length;
  const reviewed = all.filter((a) => a.assignment.status === "graded").length;
  const overdue = all.filter((a) => a.assignment.status === "overdue").length;

  const tiles: Tile[] = [
    {
      label: "To do",
      value: toDo,
      icon: ClipboardList,
      tone: "primary",
      href: "/assignments?filter=open",
    },
    {
      label: "Awaiting marking",
      value: awaitingRemark,
      icon: Hourglass,
      tone: "warning",
      href: "/assignments?filter=submitted",
    },
    {
      label: "Reviewed",
      value: reviewed,
      icon: CheckCircle2,
      tone: "success",
      href: "/assignments?filter=graded",
    },
    {
      label: "Overdue",
      value: overdue,
      icon: AlertCircle,
      tone: "destructive",
      href: "/assignments?filter=open",
    },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="mb-4 font-display font-semibold text-base text-foreground">
        Your workload
      </h2>
      <div className="grid grid-cols-2 gap-3">
      {tiles.map((t) => {
        const Icon = t.icon;
        const inner = (
          <div
            className={cn(
              "space-y-1 rounded-xl border border-border/80 bg-background/50 p-3.5 transition-colors",
              t.href && "hover:border-primary/40",
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                  TONE_BG[t.tone],
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </span>
              <span className="truncate text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t.label}
              </span>
            </div>
            <p className="font-display text-xl font-bold leading-tight tabular-nums text-foreground">
              {t.value}
            </p>
          </div>
        );
        return t.href ? (
          <Link key={t.label} href={t.href} className="block">
            {inner}
          </Link>
        ) : (
          <div key={t.label}>{inner}</div>
        );
      })}
      </div>
    </div>
  );
}
