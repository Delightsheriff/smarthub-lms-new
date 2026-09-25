"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarX2,
  ClipboardX,
  Mail,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  FileText,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { StatTile } from "@/components/ui/stat-tile";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Ledger, LedgerControlItem } from "@/components/ui/ledger";
import { formatDate, formatDateTime, cn } from "@/lib/utils";
import {
  useCohortStudentAssignments,
  useCohortStudentAttendance,
  useCohortRoster,
} from "../api/teaching.queries";
import type { StudentAttendanceSessionRow } from "../types/attendance";

interface CohortStudentPageContentProps {
  scheduleId: string;
  studentId: string;
}

export function CohortStudentPageContent({
  scheduleId,
  studentId,
}: CohortStudentPageContentProps) {
  const work = useCohortStudentAssignments(scheduleId, studentId);
  const attendance = useCohortStudentAttendance(scheduleId, studentId);
  const rosterQuery = useCohortRoster(scheduleId);

  const cohort = attendance.data?.cohorts?.[0];
  const student = work.data?.student;
  const summary = work.data?.summary;

  // Previous / next student navigation following roster order
  const roster = rosterQuery.data || [];
  const currentIndex = roster.findIndex((r) => r.studentId === studentId);
  const prevStudent = currentIndex > 0 ? roster[currentIndex - 1] : null;
  const nextStudent =
    currentIndex >= 0 && currentIndex < roster.length - 1
      ? roster[currentIndex + 1]
      : null;

  return (
    <div className="space-y-6">
      {/* Back to roster link */}
      <div>
        <Link
          href={`/teach/cohorts/${scheduleId}?tab=roster`}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to roster
        </Link>
      </div>

      {/* Editorial Page Header */}
      <PageHeader
        variant="editorial"
        title={work.isLoading ? "Loading student..." : (student?.name ?? "Student")}
        dateline={work.data?.courseName ? `${work.data.courseName} · Student Overview` : "Student Overview"}
        description={
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {student?.email && (
              <a
                href={`mailto:${student.email}`}
                className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
              >
                <Mail className="h-3.5 w-3.5" />
                {student.email}
              </a>
            )}
            {work.data?.scopedEnrollment && (
              <span className="font-mono text-[11px] text-accent font-medium">
                Module add-on — part of this cohort only
              </span>
            )}
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            {prevStudent && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 rounded-xl text-xs"
                nativeButton={false}
                render={
                  <Link
                    href={`/teach/cohorts/${scheduleId}/students/${prevStudent.studentId}`}
                  />
                }
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Previous student
              </Button>
            )}
            {nextStudent && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 rounded-xl text-xs"
                nativeButton={false}
                render={
                  <Link
                    href={`/teach/cohorts/${scheduleId}/students/${nextStudent.studentId}`}
                  />
                }
              >
                Next student <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        }
      />

      {/* Six headline numbers */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {work.isLoading || attendance.isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))
        ) : (
          <>
            <StatTile
              label="Submitted"
              value={`${summary?.submitted ?? 0}/${summary?.total ?? 0}`}
              tone="primary"
            />
            <StatTile
              label="Not submitted"
              value={summary?.missing ?? 0}
              tone={summary?.missing ? "destructive" : "neutral"}
            />
            <StatTile
              label="Late"
              value={summary?.late ?? 0}
              tone={summary?.late ? "warning" : "neutral"}
            />
            <StatTile
              label="Average grade"
              value={
                typeof summary?.averagePercentage === "number"
                  ? `${summary.averagePercentage}%`
                  : "—"
              }
              tone="success"
            />
            <StatTile
              label="Attendance"
              value={
                typeof cohort?.summary.percentage === "number"
                  ? `${cohort.summary.percentage}%`
                  : "—"
              }
              tone="accent"
            />
            <StatTile
              label="Classes attended"
              value={`${cohort?.summary.present ?? 0}/${cohort?.summary.held ?? 0}`}
              tone="neutral"
            />
          </>
        )}
      </div>

      {/* 2-Column Ledger Layout: Coursework & Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Coursework Column */}
        <div className="space-y-3">
          {work.isLoading && (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full rounded-2xl" />
              <Skeleton className="h-16 w-full rounded-2xl" />
            </div>
          )}

          {work.error && !work.isLoading && (
            <EmptyState
              icon={AlertCircle}
              title="Couldn't load coursework"
              description="There was a problem loading this student's coursework. Please try again."
              action={
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => work.refetch()}
                  className="rounded-xl"
                >
                  Try again
                </Button>
              }
            />
          )}

          {!work.isLoading && !work.error && (!work.data?.assignments || work.data.assignments.length === 0) && (
            <EmptyState
              icon={ClipboardX}
              title="No assignments"
              description="No assignments are attached to this cohort yet."
            />
          )}

          {!work.isLoading && !work.error && work.data?.assignments && work.data.assignments.length > 0 && (
            <Ledger
              title="Coursework"
              count={work.data.assignments.length}
            >
              {work.data.assignments.map((a) => (
                <LedgerControlItem
                  key={a.assignmentId}
                  icon={FileText}
                  iconClassName="bg-primary/10 text-primary"
                  title={
                    <Link
                      href={
                        a.submissionId
                          ? `/teach/cohorts/${scheduleId}/assignments/${a.assignmentId}?submission=${a.submissionId}&student=${studentId}`
                          : `/teach/cohorts/${scheduleId}/assignments/${a.assignmentId}`
                      }
                      className="font-semibold text-sm text-foreground hover:underline transition-colors block truncate"
                    >
                      {a.title}
                    </Link>
                  }
                  meta={
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                      {a.moduleTitle && <span>{a.moduleTitle} ·</span>}
                      <span>{a.dueDate ? `due ${formatDate(a.dueDate)}` : "no due date"}</span>
                      {a.submittedAt && (
                        <span>· sent {formatDateTime(a.submittedAt)}</span>
                      )}
                      {a.isLate && (
                        <span className="text-warning font-medium">
                          · {a.daysLate ? `${a.daysLate} day${a.daysLate === 1 ? "" : "s"} late` : "late"}
                        </span>
                      )}
                      {!a.isPublished && (
                        <span className="text-muted-foreground/80 italic">
                          · draft, hidden from students
                        </span>
                      )}
                    </div>
                  }
                  actions={
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <div className="flex items-center gap-2">
                        {typeof a.score === "number" && (
                          <span className="font-mono text-xs font-semibold text-foreground">
                            {a.score}
                            {typeof a.totalPoints === "number" && ` / ${a.totalPoints}`}
                          </span>
                        )}
                        <StatusBadge status={a.status} />
                      </div>
                      {a.submissionId && a.status !== "graded" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 text-[11px] px-2 text-primary hover:text-primary hover:bg-primary/10 rounded-lg font-medium"
                          nativeButton={false}
                          render={
                            <Link
                              href={`/teach/cohorts/${scheduleId}/assignments/${a.assignmentId}?submission=${a.submissionId}&student=${studentId}`}
                            />
                          }
                        >
                          Review &amp; mark
                        </Button>
                      )}
                    </div>
                  }
                />
              ))}
            </Ledger>
          )}
        </div>

        {/* Attendance Column */}
        <div className="space-y-3">
          {attendance.isLoading && (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full rounded-2xl" />
              <Skeleton className="h-16 w-full rounded-2xl" />
            </div>
          )}

          {attendance.error && !attendance.isLoading && (
            <EmptyState
              icon={AlertCircle}
              title="Couldn't load attendance"
              description="There was a problem loading this student's attendance. Please try again."
              action={
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => attendance.refetch()}
                  className="rounded-xl"
                >
                  Try again
                </Button>
              }
            />
          )}

          {!attendance.isLoading && !attendance.error && (!cohort?.sessions || cohort.sessions.length === 0) && (
            <EmptyState
              icon={CalendarX2}
              title="No attendance recorded"
              description="No sessions have been held yet for this cohort."
            />
          )}

          {!attendance.isLoading && !attendance.error && cohort?.sessions && cohort.sessions.length > 0 && (
            <Ledger
              title="Attendance"
              count={cohort.sessions.length}
            >
              {cohort.sessions.slice(0, 12).map((s: StudentAttendanceSessionRow) => (
                <LedgerControlItem
                  key={s.sessionId}
                  icon={Calendar}
                  iconClassName={cn(
                    "bg-accent/15 text-accent",
                    s.isCancelled && "opacity-50",
                  )}
                  title={
                    <div className={cn("text-sm font-medium", s.isCancelled && "opacity-50")}>
                      <span>{formatDate(s.startsAt)}</span>
                      {s.title && <span> · {s.title}</span>}
                      {s.isCancelled && (
                        <span className="ml-1.5 text-[11px] text-muted-foreground font-mono">
                          (cancelled)
                        </span>
                      )}
                    </div>
                  }
                  meta={
                    s.note ? (
                      <span className="text-xs text-muted-foreground line-clamp-1">
                        {s.note}
                      </span>
                    ) : undefined
                  }
                  actions={
                    s.isCancelled ? (
                      <span className="text-xs text-muted-foreground font-mono">—</span>
                    ) : (
                      <StatusBadge status={s.status ?? "unmarked"} />
                    )
                  }
                />
              ))}
              {cohort.sessions.length > 12 && (
                <p className="px-4 py-2 text-xs font-mono text-muted-foreground border-t border-border/50">
                  Showing the 12 most recent of {cohort.sessions.length} sessions.
                </p>
              )}
            </Ledger>
          )}
        </div>
      </div>
    </div>
  );
}
