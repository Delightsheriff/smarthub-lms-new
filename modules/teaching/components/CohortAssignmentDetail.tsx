"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  ExternalLink,
  Award,
  AlertCircle,
  Clock,
  UserX,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { StatTile } from "@/components/ui/stat-tile";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { RichText } from "@/components/ui/rich-text";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ledger, LedgerControlItem } from "@/components/ui/ledger";
import { formatDate, formatDateTime, cn } from "@/lib/utils";
import {
  useCohortAssignments,
  useCohortRoster,
  useCohortSubmissions,
  useTeachingAssignment,
  useGradeSubmission,
} from "../api/teaching.queries";
import type { CohortSubmissionRow } from "../types";
import { GradingDialog } from "./GradingDialog";

interface CohortAssignmentDetailProps {
  scheduleId: string;
  assignmentId: string;
}

export function CohortAssignmentDetail({
  scheduleId,
  assignmentId,
}: CohortAssignmentDetailProps) {
  const assignment = useTeachingAssignment(assignmentId);
  const cohortAssignments = useCohortAssignments(scheduleId);
  const submissions = useCohortSubmissions(scheduleId);
  const roster = useCohortRoster(scheduleId);
  const gradeMutation = useGradeSubmission(scheduleId);

  const [grading, setGrading] = useState<CohortSubmissionRow | null>(null);
  const [briefOpen, setBriefOpen] = useState(true);

  // Deep linking: `?submission=<id>` or fallback `?student=<id>`
  const searchParams = useSearchParams();
  const wantedSubmission = searchParams.get("submission");
  const wantedStudent = searchParams.get("student");
  const openedFor = useRef<string | null>(null);

  // Attachment carries per-cohort due date + visibility
  const attachment = useMemo(
    () =>
      (cohortAssignments.data || []).find(
        (a) => a.assignmentId === assignmentId,
      ),
    [cohortAssignments.data, assignmentId],
  );

  // Submissions filtered to this assignment
  const subs = useMemo(
    () =>
      (submissions.data || []).filter(
        (s) => s.assignment.id === assignmentId,
      ),
    [submissions.data, assignmentId],
  );

  const rosterRows = useMemo(() => roster.data || [], [roster.data]);

  // Deep link auto-open logic
  useEffect(() => {
    const key = wantedSubmission ?? wantedStudent;
    if (!key || openedFor.current === key || !subs.length) return;
    const match =
      (wantedSubmission && subs.find((x) => x.id === wantedSubmission)) ||
      (wantedStudent && subs.find((x) => x.student.id === wantedStudent)) ||
      null;
    if (match) {
      openedFor.current = key;
      setGrading(match);
    }
  }, [subs, wantedSubmission, wantedStudent]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = subs.length;
    const onTime = subs.filter((s) => !s.isLate).length;
    const late = subs.filter((s) => s.isLate).length;
    const graded = subs.filter((s) => typeof s.score === "number").length;
    const awaiting = total - graded;
    return { total, onTime, late, graded, awaiting };
  }, [subs]);

  // Students on roster who haven't submitted yet
  const notSubmitted = useMemo(() => {
    const submittedIds = new Set(subs.map((s) => s.student.id));
    return rosterRows.filter((r) => !submittedIds.has(r.studentId));
  }, [subs, rosterRows]);

  if (assignment.isLoading || cohortAssignments.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (assignment.error || !assignment.data) {
    return (
      <div className="space-y-4">
        <Link
          href={`/teach/cohorts/${scheduleId}?tab=assignments`}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to assignments
        </Link>
        <EmptyState
          icon={AlertCircle}
          title="Couldn't load assignment"
          description="This assignment could not be loaded. Please check that it exists and you have access."
          action={
            <Button
              variant="outline"
              onClick={() => assignment.refetch()}
              className="rounded-xl"
            >
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  const asgn = assignment.data;
  const dueDate = attachment?.dueDate || asgn.dueDate;

  const handleSaveAndNext = async (score: number, feedback?: string) => {
    if (!grading) return;
    await gradeMutation.mutateAsync({
      submissionId: grading.id,
      score,
      feedback,
    });
    // Move to next ungraded submission
    const remainingUngraded = subs.filter(
      (s) => s.status !== "graded" && s.id !== grading.id,
    );
    if (remainingUngraded.length > 0) {
      setGrading(remainingUngraded[0]);
    } else {
      setGrading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <div>
        <Link
          href={`/teach/cohorts/${scheduleId}?tab=assignments`}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to assignments
        </Link>
      </div>

      {/* Editorial Page Header */}
      <PageHeader
        variant="editorial"
        title={asgn.title}
        dateline={
          dueDate
            ? `Due ${formatDate(dueDate)} · Assignment Detail`
            : "No due date set · Assignment Detail"
        }
        description={
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {attachment?.module && (
              <Badge variant="outline" className="text-xs">
                {attachment.module}
              </Badge>
            )}
            <span>·</span>
            <span>Total Points: {asgn.totalPoints ?? 100}</span>
            <span>·</span>
            <span>
              {attachment?.isVisible ?? true
                ? "Visible to students"
                : "Hidden (Draft)"}
            </span>
          </div>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="Submissions"
          value={stats.total}
          tone="primary"
          caption={`${stats.onTime} on time · ${stats.late} late`}
        />
        <StatTile
          label="Awaiting Grading"
          value={stats.awaiting}
          tone={stats.awaiting > 0 ? "warning" : "neutral"}
        />
        <StatTile
          label="Graded"
          value={stats.graded}
          tone="success"
        />
        <StatTile
          label="Not Submitted"
          value={notSubmitted.length}
          tone={notSubmitted.length > 0 ? "destructive" : "neutral"}
        />
      </div>

      {/* Collapsible Brief & Instructions Card */}
      {(asgn.description || asgn.instructions || asgn.assignmentLink) && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
          <button
            type="button"
            onClick={() => setBriefOpen((v) => !v)}
            aria-expanded={briefOpen}
            className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left transition-colors hover:bg-muted/30"
          >
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">
                Brief &amp; Instructions
              </span>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-200",
                briefOpen && "rotate-180",
              )}
            />
          </button>
          {briefOpen && (
            <div className="space-y-4 border-t border-border px-5 py-4 text-xs leading-relaxed">
              {asgn.description && (
                <div>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Brief
                  </p>
                  <RichText html={asgn.description} />
                </div>
              )}
              {asgn.instructions && (
                <div>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Instructions
                  </p>
                  <RichText html={asgn.instructions} />
                </div>
              )}
              {asgn.assignmentLink && (
                <div className="pt-1">
                  <a
                    href={asgn.assignmentLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Attached assignment resource link
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Submissions & Not-Submitted Tabs */}
      <Tabs defaultValue="submissions" className="space-y-4">
        <TabsList className="rounded-xl bg-muted/60 p-1">
          <TabsTrigger value="submissions" className="rounded-lg text-xs">
            Submissions ({subs.length})
          </TabsTrigger>
          <TabsTrigger value="not-submitted" className="rounded-lg text-xs">
            Not submitted ({notSubmitted.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="submissions" className="space-y-3 pt-1">
          {submissions.isLoading && (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full rounded-2xl" />
              <Skeleton className="h-16 w-full rounded-2xl" />
            </div>
          )}

          {submissions.error && !submissions.isLoading && (
            <EmptyState
              icon={AlertCircle}
              title="Couldn't load submissions"
              description="There was a problem loading submissions. Please try again."
              action={
                <Button
                  variant="outline"
                  onClick={() => submissions.refetch()}
                  className="rounded-xl"
                >
                  Try again
                </Button>
              }
            />
          )}

          {!submissions.isLoading && !submissions.error && subs.length === 0 && (
            <EmptyState
              icon={ClipboardList}
              title="No submissions yet"
              description="Students will appear here as they hand in their coursework."
            />
          )}

          {!submissions.isLoading && !submissions.error && subs.length > 0 && (
            <Ledger title="Submissions" count={subs.length}>
              {subs.map((s) => {
                const isGraded = typeof s.score === "number";
                return (
                  <LedgerControlItem
                    key={s.id}
                    icon={Award}
                    iconClassName={
                      isGraded
                        ? "bg-success/10 text-success"
                        : s.isLate
                          ? "bg-warning/10 text-warning"
                          : "bg-primary/10 text-primary"
                    }
                    title={
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">
                          {s.student.name}
                        </span>
                        {s.student.email && (
                          <span className="text-xs text-muted-foreground hidden sm:inline">
                            · {s.student.email}
                          </span>
                        )}
                        {s.isLate && (
                          <StatusBadge status="late" className="text-[10px]" />
                        )}
                      </div>
                    }
                    meta={
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>
                          {s.submittedAt
                            ? `Submitted ${formatDateTime(s.submittedAt)}`
                            : "Submission date not recorded"}
                        </span>
                        {s.submissionType && (
                          <span>· Type: {s.submissionType}</span>
                        )}
                      </div>
                    }
                    actions={
                      <div className="flex items-center gap-2.5">
                        {isGraded ? (
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-success">
                              {s.score} / {asgn.totalPoints ?? 100}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setGrading(s)}
                              className="rounded-xl text-xs h-7"
                            >
                              Edit Grade
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => setGrading(s)}
                            className="rounded-xl text-xs h-7"
                          >
                            <Award className="mr-1.5 h-3.5 w-3.5" /> Grade
                          </Button>
                        )}
                      </div>
                    }
                  />
                );
              })}
            </Ledger>
          )}
        </TabsContent>

        <TabsContent value="not-submitted" className="space-y-3 pt-1">
          {roster.isLoading && (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full rounded-2xl" />
            </div>
          )}

          {!roster.isLoading && notSubmitted.length === 0 && (
            <EmptyState
              icon={CheckCircle2}
              title="Everyone has submitted"
              description="All students in this cohort roster have submitted this assignment."
            />
          )}

          {!roster.isLoading && notSubmitted.length > 0 && (
            <Ledger title="Pending Submissions" count={notSubmitted.length}>
              {notSubmitted.map((r) => (
                <LedgerControlItem
                  key={r.studentId}
                  icon={UserX}
                  iconClassName="bg-muted text-muted-foreground"
                  title={
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-foreground">
                        {r.name}
                      </span>
                      {r.email && (
                        <span className="text-xs text-muted-foreground">
                          · {r.email}
                        </span>
                      )}
                    </div>
                  }
                  meta={
                    <span className="text-xs text-muted-foreground">
                      No submission received
                    </span>
                  }
                  actions={
                    <Badge variant="outline" className="text-[10px] text-muted-foreground">
                      Not submitted
                    </Badge>
                  }
                />
              ))}
            </Ledger>
          )}
        </TabsContent>
      </Tabs>

      {/* Grading Dialog */}
      <GradingDialog
        submission={grading}
        open={Boolean(grading)}
        onOpenChange={(open) => !open && setGrading(null)}
        scheduleId={scheduleId}
        onSaveAndNext={handleSaveAndNext}
      />
    </div>
  );
}
