"use client";
import Link from "next/link";
import { ArrowRight, CalendarDays, Presentation } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/utils";
import { isJoinWindowOpen } from "../lib/webinar-status";
import { useWebinars } from "../api/webinars.queries";

/**
 * Compact upcoming-webinars widget for both the student and instructor
 * dashboards. Self-gates: renders null when there are no upcoming
 * webinars so the dashboard layout doesn't waste space on an empty card.
 */
export function DashboardWebinarsWidget() {
  const { data, isLoading } = useWebinars("upcoming");

  if (isLoading) {
    return <Skeleton className="h-28 w-full rounded-2xl" />;
  }

  if (!data || data.length === 0) return null;

  const preview = data.slice(0, 2);

  return (
    <Card className="rounded-2xl border border-border bg-card shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2">
            <Presentation className="h-4 w-4 text-primary" />
            <CardTitle className="font-display text-sm font-semibold">
              Upcoming webinars
            </CardTitle>
          </div>
          <Link
            href="/webinars"
            className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-0.5"
          >
            See all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {preview.map((w) => {
          const joinWindowOpen = isJoinWindowOpen(w.date);

          return (
            <div
              key={w.id}
              className="flex items-start justify-between gap-3 text-sm"
            >
              <div className="min-w-0">
                <p className="font-medium leading-snug line-clamp-1">
                  {w.title}
                </p>
                {w.date && (
                  <p className="text-xs text-muted-foreground inline-flex items-center gap-1 mt-0.5">
                    <CalendarDays className="h-3 w-3 shrink-0" />
                    {formatDateTime(w.date)}
                  </p>
                )}
              </div>

              {w.joinLink && joinWindowOpen && (
                <a
                  href={w.joinLink}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 text-xs font-semibold text-primary hover:underline"
                >
                  Join
                </a>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
