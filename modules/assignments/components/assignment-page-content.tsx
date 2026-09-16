"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
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
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatDateTime } from "@/lib/utils";
import { useAssignmentDetail } from "../api/assignments.queries";
import { CountdownToDeadline, getDeadlineStatus } from "./countdown-to-deadline";
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
      <div className="container max-w-5xl py-8 space-y-6">
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
      <div className="container max-w-4xl py-12 text-center space-y-4">
        <Alert variant="destructive" className="max-w-md mx-auto rounded-2xl">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Assignment Not Found</AlertTitle>
          <AlertDescription>
            The assignment you requested could not be loaded or may no longer exist.
          </AlertDescription>
        </Alert>
        <Button
          render={<Link href="/assignments" />}
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
  // Late submissions disallowed + already past due + nothing submitted
  // yet: the form would only ever produce a guaranteed-rejected POST,
  // so it's suppressed entirely rather than shown and left to fail.
  const submissionWindowClosed =
    isOverdue && !submission && !assignment.allowLateSubmission;

  return (
    <div className="container max-w-5xl py-8 space-y-6">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Button
          render={<Link href="/assignments" />}
          variant="ghost"
          size="sm"
          className="rounded-xl text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> All Assignments
        </Button>
        {course && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5 text-primary" />
            <span>{course.name}</span>
            {module && <span>/ {module.title}</span>}
          </div>
        )}
      </div>

      {/* Main Header Banner */}
      <Card className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              {assignment.type && (
                <Badge variant="outline" className="capitalize text-xs">
                  {assignment.type.replace("-", " ")}
                </Badge>
              )}
              {assignment.priority && (
                <Badge variant="destructive" className="text-xs">
                  {assignment.priority} priority
                </Badge>
              )}
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              {assignment.title}
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <CountdownToDeadline dueAt={assignment.dueAt} className="text-sm px-3 py-1.5" />
            {!submissionWindowClosed && (
              <SubmissionForm
                assignment={assignment}
                existingSubmission={submission}
              />
            )}
          </div>
        </div>

        {/* Due date info strip */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-3 border-t border-border">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span>Due: {formatDateTime(assignment.dueAt)}</span>
          </div>
          {assignment.allowLateSubmission && (
            <span className="text-success font-medium">
              Late submissions allowed
            </span>
          )}
        </div>
      </Card>

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

      {/* Submission window closed — the form is suppressed entirely
          rather than shown and left to fail against the backend's own
          allowLateSubmission check. */}
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

      {/* Two-column layout for details & submission status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Instructions & Resources */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm space-y-4">
            <h2 className="font-display text-lg font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Instructions & Brief
            </h2>
            <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed text-muted-foreground">
              <p className="whitespace-pre-wrap">{assignment.instructions}</p>
              {assignment.description && (
                <p className="mt-3 text-foreground">{assignment.description}</p>
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

        {/* Right column: Current Submission & History */}
        <div className="space-y-6">
          {submission ? (
            <>
              <SubmissionStatusCard submission={submission} />
              <SubmissionHistory submission={submission} />
            </>
          ) : submissionWindowClosed ? (
            <Card className="rounded-2xl border bg-card p-6 shadow-sm text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
                <Lock className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold">Submissions closed</h3>
                <p className="text-xs text-muted-foreground">
                  The deadline has passed and late submissions aren&apos;t
                  allowed for this assignment.
                </p>
              </div>
            </Card>
          ) : (
            <Card className="rounded-2xl border bg-card p-6 shadow-sm text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <HelpCircle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold">No Submission Yet</h3>
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
        </div>
      </div>
    </div>
  );
}
