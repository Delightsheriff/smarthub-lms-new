"use client";

import { useState } from "react";
import { ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/utils";
import { useGradeSubmissionFromInbox, useInstructorInbox } from "../api/teaching.queries";
import { GradingDialog } from "./GradingDialog";
import type { CohortSubmissionRow, InboxRow } from "../types";

function inboxToSubmissionRow(r: InboxRow): CohortSubmissionRow {
  return {
    id: r.id,
    assignment: r.assignment,
    student: r.student,
    submittedAt: r.submittedAt,
    status: "submitted",
    isLate: r.isLate,
    fileUrl: r.fileUrl,
    externalUrl: r.externalUrl,
    submissionType: r.submissionType,
    fileName: r.fileName,
    fileMimeType: r.fileMimeType,
    content: r.content,
  };
}

/**
 * Dashboard strip — the instructor's "what needs my attention" feed.
 * Top 5 ungraded submissions across every cohort they teach. Click a
 * row to open the GradingDialog inline so the queue can be cleared
 * without leaving the dashboard.
 */
export function NeedsGradingStrip() {
  const inbox = useInstructorInbox(5);
  const gradeMutation = useGradeSubmissionFromInbox();
  const [grading, setGrading] = useState<InboxRow | null>(null);

  if (inbox.isLoading) {
    return <Skeleton className="h-56 w-full rounded-2xl" />;
  }

  const rows = inbox.data || [];

  return (
    <>
      <Card className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="font-display flex items-center gap-2 text-base font-semibold">
              <ClipboardList className="h-4 w-4 text-warning" /> Needs grading
            </CardTitle>
            {rows.length > 0 && (
              <Badge variant="warning">{rows.length}</Badge>
            )}
          </div>
          <CardDescription>Submissions waiting on your review.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <div className="px-6 pb-6 pt-2 text-center">
              <p className="text-sm font-medium">All caught up.</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                No submissions are waiting to be graded.
              </p>
            </div>
          ) : (
            <ul className="divide-y">
              {rows.map((r) => (
                <li key={r.id}>
                  <Button
                    variant="ghost"
                    onClick={() => setGrading(r)}
                    className="w-full justify-start h-auto px-6 py-3 rounded-none"
                  >
                    <div className="flex items-start gap-3 w-full text-left">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-warning/10 text-warning">
                        <ClipboardList className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium leading-tight truncate">
                          {r.student.name}{" "}
                          <span className="text-muted-foreground font-normal">
                            · {r.assignment.title}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {r.cohort.courseName}
                          {r.submittedAt &&
                            ` · submitted ${formatDateTime(r.submittedAt)}`}
                        </p>
                      </div>
                      {r.isLate && (
                        <Badge variant="destructive" className="shrink-0">
                          Late
                        </Badge>
                      )}
                    </div>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <GradingDialog
        submission={grading ? inboxToSubmissionRow(grading) : null}
        open={!!grading}
        onOpenChange={(o) => !o && setGrading(null)}
        onGradeSubmit={async (score, feedback) => {
          if (!grading) return;
          await gradeMutation.mutateAsync({ submissionId: grading.id, score, feedback });
          setGrading(null);
        }}
      />
    </>
  );
}
