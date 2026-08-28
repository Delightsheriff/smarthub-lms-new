"use client";
import Link from "next/link";
import { ArrowRight, Sparkles, Clock } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAssignedModules } from "../api/assigned-modules.queries";

/**
 * Compact "Assigned to you" widget for the student dashboard. Self-gates:
 * renders null when the student has no individually-assigned modules so
 * the dashboard doesn't waste a card on an empty state — the dedicated
 * `/assigned` page owns the empty case.
 */
export function DashboardAssignedModulesWidget() {
  const { data, isLoading } = useAssignedModules();

  if (isLoading) {
    return <Skeleton className="h-28 w-full rounded-2xl" />;
  }

  if (!data || data.length === 0) return null;

  const preview = data.slice(0, 2);

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-semibold">
              Assigned to you
            </CardTitle>
          </div>
          <Link
            href="/assigned"
            className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-0.5"
          >
            See all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {preview.map((m) => {
          const bits: string[] = [];
          if (m.recordings.length > 0) {
            bits.push(
              `${m.recordings.length} recording${
                m.recordings.length === 1 ? "" : "s"
              }`,
            );
          }
          if (m.materials.length > 0) {
            bits.push(
              `${m.materials.length} material${
                m.materials.length === 1 ? "" : "s"
              }`,
            );
          }
          if (m.assignments.length > 0) {
            bits.push(
              `${m.assignments.length} assignment${
                m.assignments.length === 1 ? "" : "s"
              }`,
            );
          }

          return (
            <Link
              key={m.id}
              href="/assigned"
              className="flex items-start justify-between gap-3 text-sm group"
            >
              <div className="min-w-0">
                <p className="font-medium leading-snug line-clamp-1 group-hover:text-primary transition-colors">
                  {m.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  {bits.length > 0 ? (
                    bits.join(" · ")
                  ) : m.estimatedDuration ? (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3 shrink-0" />
                      {m.estimatedDuration}
                    </span>
                  ) : (
                    "Extra module"
                  )}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
