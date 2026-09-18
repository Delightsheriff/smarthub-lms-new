"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { GraduationCap } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Ledger, LedgerItem } from "@/components/ui/ledger";
import { IndexList, IndexRow } from "@/components/ui/index-list";
import { PageHeader } from "@/components/layout/page-header";
import { RefreshButton } from "@/components/ui/refresh-button";
import { useAuthStore } from "@/store/slices/authStore";
import { DashboardWebinarsWidget } from "@/modules/webinars/components/DashboardWebinarsWidget";
import { useUpcomingEvents } from "@/modules/calendar/api/calendar.queries";
import { formatDateTimeFriendly, pluralize } from "@/lib/utils";
import {
  useGradeSubmissionFromInbox,
  useInstructorInbox,
  useTeachingCohorts,
} from "../api/teaching.queries";
import { isCohortEnded } from "../lib/group-cohorts";
import { GradingDialog } from "./GradingDialog";
import { RecentSubmissionsTile } from "./RecentSubmissionsTile";
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
 * Instructor home ("The Brief," teaching edition) — same masthead +
 * hero/ledger + bento + magazine-index language as the student
 * dashboard (see plans/020-editorial-dashboard-system.md), with
 * teaching-appropriate content: "Needs grading" takes the dominant
 * hero slot (the single most action-critical surface for an
 * instructor), "Today & upcoming" lists class sessions instead of
 * assignment deadlines, and cohorts replace courses in the index list.
 */
export function TeachPageContent() {
  const user = useAuthStore((s) => s.user);
  const { data: cohorts, isLoading, isFetching, refetch } = useTeachingCohorts();
  const inbox = useInstructorInbox(5);
  const events = useUpcomingEvents(10);
  const gradeMutation = useGradeSubmissionFromInbox();
  const [grading, setGrading] = useState<InboxRow | null>(null);
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.allSettled([
      refetch(),
      queryClient.invalidateQueries({ queryKey: ["teaching"] }),
      queryClient.invalidateQueries({ queryKey: ["webinars"] }),
      queryClient.invalidateQueries({ queryKey: ["calendar"] }),
    ]);
    setIsRefreshing(false);
  };

  const greetingName = user?.firstName?.trim() || "there";
  const cohortCount = cohorts?.length ?? 0;
  const activeCount = (cohorts || []).filter((c) => !isCohortEnded(c.endDate)).length;
  const needsGradingRows = inbox.data || [];
  const classes = (events.data || [])
    .filter((e) => e.type === "class-session")
    .slice(0, 5);

  const dateline = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      <PageHeader
        variant="editorial"
        divider
        dateline={`${dateline} · Teaching Space`}
        title={`Good ${timeOfDay()}, ${greetingName}.`}
        description={
          !isLoading ? (
            cohortCount === 0 ? (
              "You're not leading any cohorts yet."
            ) : (
              <>
                {needsGradingRows.length > 0 && (
                  <>
                    <strong className="text-foreground">{needsGradingRows.length}</strong>{" "}
                    {pluralize(needsGradingRows.length, "submission", undefined, false)} waiting on your review ·{" "}
                  </>
                )}
                <strong className="text-foreground">{activeCount}</strong>{" "}
                {pluralize(activeCount, "cohort", undefined, false)} active
              </>
            )
          ) : undefined
        }
        actions={
          <RefreshButton loading={isFetching || isRefreshing} onClick={handleRefresh} />
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr] lg:items-stretch">
        <div className="flex min-h-[300px] flex-col rounded-[20px] border border-border bg-card p-5 md:p-6">
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded-full bg-warning/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-warning">
              Needs grading{needsGradingRows.length > 0 ? ` · ${needsGradingRows.length}` : ""}
            </span>
          </div>
          {needsGradingRows.length === 0 ? (
            <div className="flex flex-1 items-center justify-center text-center text-sm text-muted-foreground">
              All caught up — no submissions waiting to be graded.
            </div>
          ) : (
            <div>
              {needsGradingRows.map((r) => (
                <LedgerItem
                  key={r.id}
                  tone="due"
                  title={
                    <>
                      {r.student.name}{" "}
                      <span className="font-normal text-muted-foreground">· {r.assignment.title}</span>
                    </>
                  }
                  meta={`${r.cohort.courseName}${r.submittedAt ? ` · submitted ${formatDateTimeFriendly(r.submittedAt)}` : ""}`}
                  when="Grade →"
                  onClick={() => setGrading(r)}
                />
              ))}
            </div>
          )}
        </div>

        <Ledger title="Today & upcoming" count={classes.length || undefined}>
          {classes.map((c) => (
            <LedgerItem
              key={c.id}
              tone={c.isCancelled ? "info" : "live"}
              title={c.title}
              meta={c.isCancelled ? "Cancelled" : undefined}
              when={formatDateTimeFriendly(c.start.toISOString())}
              href={c.link || (c.sourceId ? `/teaching/sessions/${c.sourceId}` : undefined)}
            />
          ))}
        </Ledger>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentSubmissionsTile />
        </div>
        <DashboardWebinarsWidget />
      </div>

      <section>
        <div className="mb-1 flex items-baseline justify-between">
          <h2 className="font-display text-xl font-semibold text-foreground">Your cohorts</h2>
        </div>

        {isLoading && (
          <div className="space-y-3 pt-3">
            <div className="h-16 animate-pulse rounded-xl bg-muted" />
            <div className="h-16 animate-pulse rounded-xl bg-muted" />
          </div>
        )}

        {!isLoading && cohortCount === 0 && (
          <EmptyState
            icon={GraduationCap}
            title="No cohorts yet"
            description="You're not on any active schedules. Reach out to admin to be added to a cohort."
          />
        )}

        {!isLoading && cohortCount > 0 && (
          <IndexList>
            {[...(cohorts || [])]
              .sort((a, b) => Number(isCohortEnded(a.endDate)) - Number(isCohortEnded(b.endDate)))
              .map((c, i) => (
                <IndexRow
                  key={c.id}
                  index={i + 1}
                  title={c.course.name}
                  subtitle={`${pluralize(c.studentCount, "student")} · started ${new Date(c.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`}
                  progress={c.progress}
                  status={isCohortEnded(c.endDate) ? "Ended" : "Active"}
                  href={`/teach/cohorts/${c.id}`}
                />
              ))}
          </IndexList>
        )}
      </section>

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
    </div>
  );
}

function timeOfDay(): string {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
