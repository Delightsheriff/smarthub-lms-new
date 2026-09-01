"use client";

import React from "react";
import Link from "next/link";
import { Video, Calendar, ArrowRight, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/utils";
import { useStudentCalendar } from "@/modules/calendar/api/calendar.queries";

interface CohortSessionsTabProps {
  scheduleId: string;
}

export function CohortSessionsTab({ scheduleId }: CohortSessionsTabProps) {
  const { data: events, isLoading } = useStudentCalendar();

  const sessions = (events || []).filter(
    (e) => e.type === "class-session" && (e.scopeId === scheduleId || e.scope === "global"),
  );

  return (
    <div className="space-y-4">
      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
      )}

      {!isLoading && sessions.length > 0 ? (
        <div className="space-y-3">
          {sessions.map((event) => (
            <Card key={event.id} className="rounded-2xl border bg-card p-4 shadow-xs">
              <CardContent className="p-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-blue-600 shrink-0" />
                    <h4 className="font-bold text-sm text-foreground">{event.title}</h4>
                    {event.location && (
                      <Badge variant="outline" className="text-[10px]">
                        {event.location}
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Starts: {formatDateTime(event.start.toISOString())}
                  </div>
                </div>

                <div className="shrink-0">
                  <Button
                    render={<Link href={`/teaching/sessions/${event.sourceId || "cs_1"}`} />}
                    size="sm"
                    className="rounded-xl text-xs"
                  >
                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Mark Attendance
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !isLoading ? (
        <div className="rounded-2xl border bg-card p-8 text-center text-xs text-muted-foreground">
          No live class sessions scheduled for this cohort.
        </div>
      ) : null}
    </div>
  );
}
