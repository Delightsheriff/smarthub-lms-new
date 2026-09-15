"use client";

import { useState } from "react";
import { CheckCircle2, ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatDateTime } from "@/lib/utils";
import { useGradeSubmissionFromInbox, useRecentSubmissions } from "../api/teaching.queries";
import { GradingDialog } from "./GradingDialog";
import type { CohortSubmissionRow, InboxRow } from "../types";

function inboxToSubmissionRow(r: InboxRow): CohortSubmissionRow {
  return {
    id: r.id,
    assignment: r.assignment,
    student: r.student,
    submittedAt: r.submittedAt,
    status: r.status || "submitted",
    isLate: r.isLate,
    score: r.score,
    fileUrl: r.fileUrl,
    externalUrl: r.externalUrl,
    submissionType: r.submissionType,
    fileName: r.fileName,
    fileMimeType: r.fileMimeType,
    content: r.content,
  };
}

/**
 * Recent activity tile — every recent submission across the
 * instructor's cohorts regardless of graded state. Answers a different
 * question from Needs-grading: "what's been happening in my cohorts?" —
 * graded rows show their score so the instructor sees throughput, not
 * just the queue. Click a row to open the grading dialog (re-grade or
 * review).
 */
export function RecentSubmissionsTile() {
  const recent = useRecentSubmissions(5);
  const gradeMutation = useGradeSubmissionFromInbox();
  const [opening, setOpening] = useState<InboxRow | null>(null);

  if (recent.isLoading) {
    return <Skeleton className="h-56 w-full rounded-2xl" />;
  }

  const rows = recent.data || [];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardList className="h-4 w-4" /> Recent submissions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <div className="px-6 pb-6 pt-2 text-center">
              <p className="text-sm font-medium">No submissions yet</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Activity will show here as students submit work.
              </p>
            </div>
          ) : (
            <ul className="divide-y">
              {rows.map((r) => {
                const isGraded = typeof r.score === "number";
                return (
                  <li key={r.id}>
                    <Button
                      variant="ghost"
                      onClick={() => setOpening(r)}
                      className="w-full justify-start h-auto px-6 py-3 rounded-none"
                    >
                      <div className="flex items-start gap-3 w-full text-left">
                        <span
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                            isGraded
                              ? "bg-success/10 text-success"
                              : "bg-primary/10 text-primary",
                          )}
                        >
                          {isGraded ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <ClipboardList className="h-4 w-4" />
                          )}
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
                            {r.submittedAt && ` · ${formatDateTime(r.submittedAt)}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {r.isLate && <Badge variant="destructive">Late</Badge>}
                          {isGraded ? (
                            <Badge variant="success" className="font-mono">
                              {r.assignment.totalPoints
                                ? `${r.score}/${r.assignment.totalPoints}`
                                : r.score}
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <GradingDialog
        submission={opening ? inboxToSubmissionRow(opening) : null}
        open={!!opening}
        onOpenChange={(o) => !o && setOpening(null)}
        onGradeSubmit={async (score, feedback) => {
          if (!opening) return;
          await gradeMutation.mutateAsync({ submissionId: opening.id, score, feedback });
          setOpening(null);
        }}
      />
    </>
  );
}
