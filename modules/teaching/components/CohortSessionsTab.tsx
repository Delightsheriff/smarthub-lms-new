"use client";

import React from "react";
import Link from "next/link";
import { Video, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Ledger, LedgerControlItem } from "@/components/ui/ledger";
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

      {!isLoading && (
        <Ledger
          title="Live Sessions"
          count={sessions.length}
          empty="No live class sessions scheduled for this cohort."
        >
          {sessions.map((event) => (
            <LedgerControlItem
              key={event.id}
              icon={Video}
              iconClassName="bg-primary/10 text-primary"
              title={
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-foreground">{event.title}</span>
                  {event.location && (
                    <Badge variant="outline" className="text-[10px]">
                      {event.location}
                    </Badge>
                  )}
                </div>
              }
              meta={
                <span className="text-xs text-muted-foreground font-mono">
                  Starts: {formatDateTime(event.start.toISOString())}
                </span>
              }
              actions={
                <Button
                  nativeButton={false} render={<Link href={`/teaching/sessions/${event.sourceId || "cs_1"}`} />}
                  size="sm"
                  className="rounded-xl text-xs h-7"
                >
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Mark Attendance
                </Button>
              }
            />
          ))}
        </Ledger>
      )}
    </div>
  );
}
