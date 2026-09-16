"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarClock, ClipboardList, ExternalLink, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUpcomingEvents } from "@/modules/calendar/api/calendar.queries";
import { formatDateTimeFriendly } from "@/lib/utils";

/**
 * Upcoming classes tile for the instructor home grid. Reads from the
 * existing calendar feed (already merges teaching + enrolment events
 * backend-side) and filters to `class-session` rows so the tile doesn't
 * dilute with assignment-due / office-hours noise. Each row deep-links
 * to the Meet/join link when present.
 */
export function UpcomingClassesTile() {
  // Pull a wider window (10) since we filter to one type — keeps the
  // tile populated when assignment-due events dominate the default top 5.
  const events = useUpcomingEvents(10);
  const [now] = useState(() => Date.now());

  if (events.isLoading) {
    return <Skeleton className="h-56 w-full rounded-2xl" />;
  }

  const classes = (events.data || [])
    .filter((e) => e.type === "class-session")
    .slice(0, 5);

  return (
    <Card className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-display flex items-center gap-2 text-base font-semibold">
            <CalendarClock className="h-4 w-4 text-primary" /> Upcoming classes
          </CardTitle>
          <Link
            href="/calendar"
            className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1"
          >
            Calendar <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <CardDescription>Your next sessions across every cohort.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {classes.length === 0 ? (
          <div className="px-6 pb-6 pt-2 text-center">
            <p className="text-sm font-medium">No classes scheduled</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Nothing on the calendar in the next two weeks.
            </p>
          </div>
        ) : (
          <ul className="divide-y">
            {classes.map((c) => (
              <li key={c.id} className="px-6 py-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Video className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-tight truncate">{c.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDateTimeFriendly(c.start.toISOString())}
                    </p>
                  </div>
                  {c.start.getTime() < now && c.sourceId ? (
                    <Link
                      href={`/teaching/sessions/${c.sourceId}`}
                      className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      Attendance <ClipboardList className="h-3 w-3" />
                    </Link>
                  ) : c.link ? (
                    <a
                      href={c.link}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      Join <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : c.isCancelled ? (
                    <Badge variant="destructive" className="shrink-0">
                      Cancelled
                    </Badge>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
