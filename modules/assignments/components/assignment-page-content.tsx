"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  AlertTriangle,
  Lock,
  Send,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RichText } from "@/components/ui/rich-text";
import { formatDateTime } from "@/lib/utils";
import { useAssignmentDetail } from "../api/assignments.queries";
import { CountdownToDeadline, getDeadlineStatus } from "./countdown-to-deadline";
import { isSubmissionWindowClosed } from "../lib/submission-window";
import { SubmissionStatusCard } from "./submission-status-card";
import { GradeCard } from "./grade-card";
import { SubmissionHistory } from "./submission-history";
import { SubmissionForm } from "./submission-form";

interface AssignmentPageContentProps {
  assignmentId: string;
}

export function AssignmentPageContent({
  assignmentId,
}: AssignmentPageContentProps) {
  const { data, isLoading, error } = useAssignmentDetail(assignmentId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <Skeleton className="h-44 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 md:col-span-2 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6 text-center">
        <Alert variant="destructive" className="max-w-md mx-auto rounded-2xl">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Assignment Not Found</AlertTitle>
          <AlertDescription>
            The assignment you requested could not be loaded or may no longer exist.
          </AlertDescription>
        </Alert>
        <Button
          nativeButton={false} render={<Link href="/assignments" />}
          variant="outline"
          className="rounded-xl"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Assignments
        </Button>
      </div>
    );
  }

  const { assignment, submission, course, module } = data;
  const deadlineStatus = getDeadlineStatus(assignment.dueAt);
  const isOverdue =
    assignment.status === "overdue" ||
    (deadlineStatus.isOverdue && !submission);

  // Compute closed window whether or not a submission exists
  const submissionWindowClosed = isSubmissionWindowClosed({
    dueAt: assignment.dueAt,
    allowLateSubmission: assignment.allowLateSubmission,
    submission,
  });

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div>
        <Link
          href="/assignments"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> All assignments
        </Link>
      </div>

      {/* Masthead */}
      <PageHeader
        variant="editorial"
        eyebrow={course ? `${course.name}${module ? ` · ${module.title}` : ""}` : "Assignments"}
        title={assignment.title}
        dateline={`Due ${formatDateTime(assignment.dueAt)}${assignment.allowLateSubmission ? " · Late submissions allowed" : ""}`}
        divider
        description={
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {assignment.type && (
              <Badge variant="outline" className="capitalize text-xs font-mono">
                {assignment.type.replace("-", " ")}
              </Badge>
            )}
            {assignment.priority && (
              <Badge variant="destructive" className="text-xs font-mono">
                {assignment.priority} priority
              </Badge>
            )}
            <CountdownToDeadline dueAt={assignment.dueAt} className="text-xs" />
          </div>
        }
        actions={
          !submissionWindowClosed ? (
            <SubmissionForm
              assignment={assignment}
              existingSubmission={submission}
            />
          ) : undefined
        }
      />

      {/* Reading + Rail Layout */}
      <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-[1fr_340px]">
        {/* Left Reading Column: Instructions, Brief & Grade Feedback */}
        <div className="space-y-6 min-w-0">
          {/* Overdue Warning Alert */}
          {isOverdue && !submission && !submissionWindowClosed && (
            <Alert variant="destructive" className="rounded-2xl">
              <AlertTriangle className="h-5 w-5" />
              <AlertTitle>Past Deadline</AlertTitle>
              <AlertDescription>
                This assignment is past its due date. Submit your work as soon as possible.
              </AlertDescription>
            </Alert>
          )}

          {/* Submission window closed alert */}
          {submissionWindowClosed && (
            <Alert variant="destructive" className="rounded-2xl">
              <Lock className="h-5 w-5" />
              <AlertTitle>Submissions closed</AlertTitle>
              <AlertDescription>
                This assignment&apos;s deadline has passed and late submissions
                aren&apos;t allowed. Contact your instructor if you need an
                exception.
              </AlertDescription>
            </Alert>
          )}

          <Card className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm space-y-4">
            <h2 className="font-display text-lg font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Instructions & Brief
            </h2>
            <div className="max-w-none leading-relaxed text-muted-foreground">
              <RichText html={assignment.instructions} />
              {assignment.description && (
                <RichText html={assignment.description} className="mt-3 text-foreground" />
              )}
            </div>

            {/* Attached links */}
            {(assignment.assignmentLink || (assignment.links && assignment.links.length > 0)) && (
              <div className="pt-4 border-t border-border space-y-2">
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Resource Links & Attachments
                </h4>
                <div className="space-y-2">
                  {assignment.assignmentLink && (
                    <a
                      href={assignment.assignmentLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline font-medium"
                    >
                      <ExternalLink className="h-4 w-4 shrink-0" />
                      Assignment Brief Link
                    </a>
                  )}
                  {assignment.links?.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline font-medium"
                    >
                      <ExternalLink className="h-4 w-4 shrink-0" />
                      {link.name}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Graded Card if applicable */}
          {submission && <GradeCard submission={submission} />}
        </div>

        {/* Right Sticky Rail: Current Submission Status & History */}
        <aside className="space-y-6 xl:sticky xl:top-6">
          {submission ? (
            <>
              <SubmissionStatusCard submission={submission} />
              <SubmissionHistory submission={submission} />
            </>
          ) : submissionWindowClosed ? (
            <Card className="rounded-2xl border border-border bg-card p-6 shadow-sm text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
                <Lock className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display text-base font-semibold">Submissions closed</h3>
                <p className="text-xs text-muted-foreground">
                  The deadline has passed and late submissions aren&apos;t
                  allowed for this assignment.
                </p>
              </div>
            </Card>
          ) : (
            <Card className="rounded-2xl border border-border bg-card p-6 shadow-sm text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <HelpCircle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display text-base font-semibold">No Submission Yet</h3>
                <p className="text-xs text-muted-foreground">
                  Upload your file, paste a link, or write your solution before the deadline.
                </p>
              </div>
              <SubmissionForm
                assignment={assignment}
                existingSubmission={null}
                trigger={
                  <Button className="w-full rounded-xl">
                    <Send className="mr-2 h-4 w-4" /> Start Submission
                  </Button>
                }
              />
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
