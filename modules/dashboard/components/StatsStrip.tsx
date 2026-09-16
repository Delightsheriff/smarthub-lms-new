"use client";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Hourglass,
} from "lucide-react";
import { Card } from "@/components/ui/card";
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 rounded-2xl" />
        ))}
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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {tiles.map((t) => {
        const Icon = t.icon;
        const inner = (
          <Card
            className={cn(
              "rounded-2xl border-border bg-card p-3 md:p-4 flex items-center gap-3 transition-all duration-200 shadow-sm",
              t.href && "hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-md",
            )}
          >
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                TONE_BG[t.tone],
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                {t.label}
              </p>
              <p className="text-lg md:text-xl font-semibold tabular-nums leading-tight">
                {t.value}
              </p>
            </div>
          </Card>
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
  );
}
