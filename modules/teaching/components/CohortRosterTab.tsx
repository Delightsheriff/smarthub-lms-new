"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { IndexList, IndexRow } from "@/components/ui/index-list";
import { pluralize } from "@/lib/utils";
import { useCohortRoster } from "../api/teaching.queries";

interface CohortRosterTabProps {
  scheduleId: string;
}

export function CohortRosterTab({ scheduleId }: CohortRosterTabProps) {
  const { data: roster, isLoading, error, refetch } = useCohortRoster(scheduleId);

  return (
    <div className="space-y-4">
      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      )}

      {error && !isLoading && (
        <EmptyState
          icon={AlertCircle}
          title="Couldn't load student roster"
          description="There was a problem loading the roster for this cohort. Please try again."
          action={
            <Button
              type="button"
              variant="outline"
              onClick={() => refetch()}
              className="rounded-xl"
            >
              Try again
            </Button>
          }
        />
      )}

      {!isLoading && !error && roster && roster.length > 0 ? (
        <IndexList>
          {roster.map((row, idx) => (
            <IndexRow
              key={row.studentId}
              index={idx + 1}
              title={row.name}
              subtitle={row.email}
              href={`/teach/cohorts/${scheduleId}/students/${row.studentId}`}
              status={
                <span className="text-[10px] font-mono">
                  {pluralize(row.submissionCount, "sub")}
                </span>
              }
            />
          ))}
        </IndexList>
      ) : !isLoading && !error ? (
        <div className="rounded-2xl border bg-card p-8 text-center text-xs text-muted-foreground">
          No students enrolled in this cohort roster yet.
        </div>
      ) : null}
    </div>
  );
}
