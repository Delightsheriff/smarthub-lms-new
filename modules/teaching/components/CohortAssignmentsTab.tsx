"use client";

import React from "react";
import { Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Ledger, LedgerControlItem } from "@/components/ui/ledger";
import { formatDate, pluralize } from "@/lib/utils";
import { useCohortAssignments, useUpdateAssignmentSchedule } from "../api/teaching.queries";

interface CohortAssignmentsTabProps {
  scheduleId: string;
}

export function CohortAssignmentsTab({ scheduleId }: CohortAssignmentsTabProps) {
  const { data: assignments, isLoading } = useCohortAssignments(scheduleId);
  const updateScheduleMutation = useUpdateAssignmentSchedule(scheduleId);

  const handleToggleVisibility = (
    assignmentId: string,
    currentVisible: boolean,
  ) => {
    updateScheduleMutation.mutate({
      assignmentId,
      patch: { isVisible: !currentVisible },
    });
  };

  return (
    <div className="space-y-4">
      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
      )}

      {!isLoading && assignments && assignments.length > 0 ? (
        <Ledger title="Assignments" count={assignments.length}>
          {assignments.map((asgn) => (
            <LedgerControlItem
              key={asgn.attachmentId}
              icon={Award}
              iconClassName="bg-primary/10 text-primary"
              title={
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-foreground">{asgn.title}</span>
                  {asgn.module && (
                    <Badge variant="outline" className="text-[10px]">
                      {asgn.module}
                    </Badge>
                  )}
                </div>
              }
              meta={
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>Due: {asgn.dueDate ? formatDate(asgn.dueDate) : "No due date"}</span>
                  <span>·</span>
                  <span>{pluralize(asgn.submissionCount, "Submission")}</span>
                  <span>·</span>
                  <span className={asgn.pendingCount > 0 ? "text-warning font-medium" : ""}>
                    {asgn.pendingCount} Pending {pluralize(asgn.pendingCount, "Grade", undefined, false)}
                  </span>
                </div>
              }
              actions={
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">Visible to students</span>
                  <Switch
                    checked={asgn.isVisible ?? true}
                    aria-label={`Visible to students for ${asgn.title}`}
                    onCheckedChange={() =>
                      handleToggleVisibility(
                        asgn.assignmentId,
                        asgn.isVisible ?? true,
                      )
                    }
                  />
                </div>
              }
            />
          ))}
        </Ledger>
      ) : !isLoading ? (
        <div className="rounded-2xl border bg-card p-8 text-center text-xs text-muted-foreground">
          No assignments attached to this cohort schedule yet.
        </div>
      ) : null}
    </div>
  );
}
