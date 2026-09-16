"use client";

import React from "react";
import { Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { useCohortAssignments, useUpdateAssignmentSchedule } from "../api/teaching.queries";

interface CohortAssignmentsTabProps {
  scheduleId: string;
}

export function CohortAssignmentsTab({ scheduleId }: CohortAssignmentsTabProps) {
  const { data: assignments, isLoading } = useCohortAssignments(scheduleId);
  const updateScheduleMutation = useUpdateAssignmentSchedule(scheduleId);

  const handleToggleVisibility = (attachmentId: string, current: boolean) => {
    updateScheduleMutation.mutate({
      attachmentId,
      patch: { isVisible: !current },
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
        <div className="space-y-3">
          {assignments.map((asgn) => (
            <Card key={asgn.attachmentId} className="rounded-2xl border border-border bg-card p-4 shadow-sm hover:border-primary/40 transition-all">
              <CardContent className="p-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Award className="h-4 w-4" />
                    </div>
                    <h4 className="font-display font-semibold text-sm text-foreground">{asgn.title}</h4>
                    {asgn.module && (
                      <Badge variant="outline" className="text-[10px]">
                        {asgn.module}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>Due: {asgn.dueDate ? formatDate(asgn.dueDate) : "No due date"}</span>
                    <span>· {asgn.submissionCount} Submissions</span>
                    <span>· {asgn.pendingCount} Pending Grade</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="text-[11px]">Visible to students</span>
                    <Switch
                      checked={asgn.isVisible ?? true}
                      onCheckedChange={() => handleToggleVisibility(asgn.attachmentId, !!asgn.isVisible)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !isLoading ? (
        <div className="rounded-2xl border bg-card p-8 text-center text-xs text-muted-foreground">
          No assignments attached to this cohort schedule yet.
        </div>
      ) : null}
    </div>
  );
}
