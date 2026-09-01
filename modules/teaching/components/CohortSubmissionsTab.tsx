"use client";

import React, { useState } from "react";
import { Award, FileText, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
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

  const { data: submissions, isLoading } = useCohortSubmissions(scheduleId);
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
      <div className="flex items-center justify-between">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as "all" | "pending" | "graded")}>
          <TabsList className="rounded-xl bg-muted/60 p-1">
            <TabsTrigger value="all" className="rounded-lg text-xs">
              All ({submissions?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="pending" className="rounded-lg text-xs">
              Needs Grading ({submissions?.filter((s) => s.status !== "graded").length || 0})
            </TabsTrigger>
            <TabsTrigger value="graded" className="rounded-lg text-xs">
              Graded ({submissions?.filter((s) => s.status === "graded").length || 0})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
      )}

      {!isLoading && filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((sub) => (
            <Card key={sub.id} className="rounded-2xl border bg-card p-4 shadow-xs">
              <CardContent className="p-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">{sub.student.name}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {sub.assignment.title}
                    </Badge>
                    {sub.isLate && (
                      <Badge variant="destructive" className="text-[10px]">
                        Late
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Submitted: {sub.submittedAt ? formatDate(sub.submittedAt) : "N/A"}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {sub.status === "graded" ? (
                    <div className="flex items-center gap-2">
                      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 font-bold">
                        Score: {sub.score} / {sub.assignment.totalPoints || 100}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenGrading(sub)}
                        className="rounded-xl text-xs"
                      >
                        Edit Grade
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleOpenGrading(sub)}
                      className="rounded-xl text-xs"
                    >
                      <Award className="mr-1.5 h-3.5 w-3.5" /> Grade Submission
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !isLoading ? (
        <div className="rounded-2xl border bg-card p-8 text-center text-xs text-muted-foreground">
          No submissions found in this filter.
        </div>
      ) : null}

      <GradingDialog
        submission={selectedSub}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onGradeSubmit={handleGradeSubmit}
      />
    </div>
  );
}
