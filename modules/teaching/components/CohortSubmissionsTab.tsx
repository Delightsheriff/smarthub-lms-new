"use client";

import React, { useState } from "react";
import { Award, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Ledger, LedgerControlItem } from "@/components/ui/ledger";
import { formatDate } from "@/lib/utils";
import { useCohortSubmissions, useGradeSubmission } from "../api/teaching.queries";
import { GradingDialog } from "./GradingDialog";
import type { CohortSubmissionRow } from "../types";

interface CohortSubmissionsTabProps {
  scheduleId: string;
}

export function CohortSubmissionsTab({ scheduleId }: CohortSubmissionsTabProps) {
  const [filter, setFilter] = useState<"all" | "pending" | "graded">("all");
  const [selectedSub, setSelectedSub] = useState<CohortSubmissionRow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: submissions, isLoading, error, refetch } = useCohortSubmissions(scheduleId);
  const gradeMutation = useGradeSubmission(scheduleId);

  const filtered = (submissions || []).filter((s) => {
    if (filter === "pending") return s.status !== "graded";
    if (filter === "graded") return s.status === "graded";
    return true;
  });

  const handleOpenGrading = (sub: CohortSubmissionRow) => {
    setSelectedSub(sub);
    setDialogOpen(true);
  };

  const handleGradeSubmit = async (score: number, feedback?: string) => {
    if (!selectedSub) return;
    await gradeMutation.mutateAsync({
      submissionId: selectedSub.id,
      score,
      feedback,
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

      {error && !isLoading && (
        <EmptyState
          icon={AlertCircle}
          title="Couldn't load submissions"
          description="There was a problem loading submissions for this cohort. Please try again."
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

      {!isLoading && !error && (
        <Ledger
          title="Submissions"
          count={filtered.length}
          actions={
            <Select
              value={filter}
              onValueChange={(val) => {
                if (val) setFilter(val as "all" | "pending" | "graded");
              }}
            >
              <SelectTrigger className="w-full sm:w-[210px] rounded-xl text-xs h-8">
                <SelectValue placeholder="Filter submissions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  All ({submissions?.length || 0})
                </SelectItem>
                <SelectItem value="pending">
                  Needs Grading ({submissions?.filter((s) => s.status !== "graded").length || 0})
                </SelectItem>
                <SelectItem value="graded">
                  Graded ({submissions?.filter((s) => s.status === "graded").length || 0})
                </SelectItem>
              </SelectContent>
            </Select>
          }
          empty="No submissions found in this filter."
        >
          {filtered.map((sub) => {
            const isGraded = sub.status === "graded";
            return (
              <LedgerControlItem
                key={sub.id}
                icon={Award}
                iconClassName={
                  isGraded
                    ? "bg-success/10 text-success"
                    : sub.isLate
                      ? "bg-warning/10 text-warning"
                      : "bg-primary/10 text-primary"
                }
                title={
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-foreground">{sub.student.name}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {sub.assignment.title}
                    </Badge>
                    {sub.isLate && (
                      <StatusBadge status="late" className="text-[10px]" />
                    )}
                  </div>
                }
                meta={
                  <span className="text-xs text-muted-foreground">
                    Submitted: {sub.submittedAt ? formatDate(sub.submittedAt) : "N/A"}
                  </span>
                }
                actions={
                  isGraded ? (
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-success">
                        {sub.score} / {sub.assignment.totalPoints || 100}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenGrading(sub)}
                        className="rounded-xl text-xs h-7"
                      >
                        Edit Grade
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleOpenGrading(sub)}
                      className="rounded-xl text-xs h-7"
                    >
                      <Award className="mr-1.5 h-3.5 w-3.5" /> Grade Submission
                    </Button>
                  )
                }
              />
            );
          })}
        </Ledger>
      )}

      <GradingDialog
        submission={selectedSub}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onGradeSubmit={handleGradeSubmit}
      />
    </div>
  );
}
