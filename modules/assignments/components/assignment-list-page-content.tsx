"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FileText, Search } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshButton } from "@/components/ui/refresh-button";
import { Ledger, LedgerItem } from "@/components/ui/ledger";
import { htmlToPlainText } from "@/lib/utils";
import { useEffectiveMode } from "@/hooks/use-effective-mode";
import { useMyAssignments } from "../api/assignments.queries";
import { AssignmentListCard } from "./assignment-list-card";
import { CountdownToDeadline, getDeadlineStatus } from "./countdown-to-deadline";
import { NeedsGradingStrip } from "@/modules/teaching/components/NeedsGradingStrip";
import { InstructorAssignmentsList } from "@/modules/teaching/components/InstructorAssignmentsList";

type Filter = "all" | "pending" | "submitted" | "graded" | "overdue";

const VALID_FILTERS: Filter[] = ["all", "pending", "submitted", "graded", "overdue"];

export function AssignmentListPageContent() {
  const { mode } = useEffectiveMode();
  if (mode === "instructor") return <InstructorTasksBody />;
  return <StudentAssignmentsBody />;
}

/** Instructor's "Tasks" — the needs-grading inbox first (action-
 *  oriented), then the full assignment set across every cohort taught. */
function InstructorTasksBody() {
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
        title="Tasks"
        description="Submissions waiting on you, plus the full set of assignments across the cohorts you teach."
      />
      <NeedsGradingStrip />
      <InstructorAssignmentsList />
    </div>
  );
}

function StudentAssignmentsBody() {
  const { data: assignments, isLoading, isFetching, error, refetch } = useMyAssignments();
  const [search, setSearch] = useState("");
  const searchParams = useSearchParams();
  // Honour ?filter=… deep links from the dashboard stats strip so each
  // tile lands the student pre-filtered instead of on an unfiltered list.
  const [statusFilter, setStatusFilter] = useState<Filter>(() => {
    const fromUrl = searchParams.get("filter");
    return fromUrl && VALID_FILTERS.includes(fromUrl as Filter) ? (fromUrl as Filter) : "all";
  });

  const dateline = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const pendingAssignments = (assignments || []).filter(
    (a) => a.assignment.status === "draft" || a.assignment.status === "returned" || a.assignment.status === "overdue"
  );
  const reviewedCount = (assignments || []).filter((a) => a.assignment.status === "graded").length;
  const submittedCount = (assignments || []).filter((a) => a.assignment.status === "submitted").length;

  const urgentAssignment = pendingAssignments[0];
  const upcomingLedgerItems = pendingAssignments.slice(1, 6);

  const filtered = (assignments || [])
    .filter(({ assignment, course, module }) => {
      const searchMatch =
        !search ||
        assignment.title.toLowerCase().includes(search.toLowerCase()) ||
        course?.name.toLowerCase().includes(search.toLowerCase()) ||
        module?.title.toLowerCase().includes(search.toLowerCase());

      if (!searchMatch) return false;

      if (statusFilter === "all") return true;
      if (statusFilter === "pending")
        return assignment.status === "draft" || assignment.status === "returned";
      if (statusFilter === "submitted") return assignment.status === "submitted";
      if (statusFilter === "graded") return assignment.status === "graded";
      if (statusFilter === "overdue") return assignment.status === "overdue";

      return true;
    })
    // Soonest/most-recently-due first, on every filter tab — not just
    // whatever order the API happens to return.
    .sort((a, b) => {
      const da = a.assignment.dueAt ? Date.parse(a.assignment.dueAt) : Infinity;
      const db = b.assignment.dueAt ? Date.parse(b.assignment.dueAt) : Infinity;
      return da - db;
    });

  return (
    <div className="space-y-6">
      <PageHeader
        variant="editorial"
        divider
        dateline={dateline}
        title="My Assignments"
        description={
          !isLoading ? (
            assignments?.length === 0 ? (
              "No assignments issued for your enrolled courses yet."
            ) : (
              <>
                <strong className="text-foreground">{pendingAssignments.length}</strong>{" "}
                {pendingAssignments.length === 1 ? "assignment" : "assignments"} pending
                {urgentAssignment?.assignment.dueAt && (
                  <>
                    {" "}
                    · next due in{" "}
                    <strong className="text-foreground">
                      {getDeadlineStatus(urgentAssignment.assignment.dueAt).label.replace(/^Due in |^Past due by /, "")}
                    </strong>
                  </>
                )}
                {reviewedCount > 0 && (
                  <>
                    {" "}
                    · <strong className="text-foreground">{reviewedCount}</strong> reviewed
                  </>
                )}
              </>
            )
          ) : undefined
        }
        actions={<RefreshButton loading={isFetching} onClick={refetch} />}
      />

      {/* Dominant Hero + Ledger when an urgent task exists and user is on default view */}
      {!isLoading && !search && statusFilter === "all" && urgentAssignment && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.8fr_1fr] lg:items-stretch">
          <div className="flex min-h-[260px] flex-col justify-between rounded-[20px] border border-border bg-card p-5 md:p-6 shadow-sm">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full bg-primary/10 px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.08em] text-primary font-medium">
                  Next submission due
                </span>
                <CountdownToDeadline dueAt={urgentAssignment.assignment.dueAt} />
              </div>

              <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
                {[urgentAssignment.course?.name, urgentAssignment.module?.title].filter(Boolean).join(" · ")}
              </p>
              <h2 className="mt-1 font-display text-xl md:text-2xl font-semibold leading-[1.2] text-foreground">
                {urgentAssignment.assignment.title}
              </h2>

              {urgentAssignment.assignment.instructions && (
                <p className="mt-2 text-xs md:text-sm leading-relaxed text-muted-foreground line-clamp-2 md:line-clamp-3">
                  {htmlToPlainText(urgentAssignment.assignment.instructions)}
                </p>
              )}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                {urgentAssignment.assignment.priority === "high" && (
                  <Badge variant="destructive" className="text-[10px]">
                    High Priority
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  {urgentAssignment.assignment.status === "overdue" ? "Past Due" : "Pending Submission"}
                </Badge>
              </div>
              <Button
                render={<Link href={`/assignments/${urgentAssignment.assignment.id}`} />}
                className="rounded-xl bg-primary text-primary-foreground font-semibold"
              >
                Submit coursework →
              </Button>
            </div>
          </div>

          <Ledger
            title="Upcoming deadlines"
            count={pendingAssignments.length}
            empty="No further assignments pending."
          >
            {upcomingLedgerItems.map(({ assignment, course }) => {
              const status = getDeadlineStatus(assignment.dueAt);
              return (
                <LedgerItem
                  key={assignment.id}
                  tone={status.isOverdue || status.isUrgent ? "due" : "info"}
                  title={assignment.title}
                  meta={course?.name || "Course"}
                  when={status.label.replace(/^Due in |^Past due by /, "")}
                  href={`/assignments/${assignment.id}`}
                />
              );
            })}
          </Ledger>
        </div>
      )}

      {/* Filter and search bar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-xs xl:max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assignments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>

        <div className="overflow-x-auto pb-1 max-w-full -mx-1 px-1">
          <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as Filter)} className="w-full">
            <TabsList className="rounded-xl bg-muted/60 p-1 w-max">
              <TabsTrigger value="all" className="rounded-lg text-xs">
                All ({assignments?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="pending" className="rounded-lg text-xs">
                Pending ({pendingAssignments.length})
              </TabsTrigger>
              <TabsTrigger value="submitted" className="rounded-lg text-xs">
                Submitted ({submittedCount})
              </TabsTrigger>
              <TabsTrigger value="graded" className="rounded-lg text-xs">
                Reviewed ({reviewedCount})
              </TabsTrigger>
              <TabsTrigger value="overdue" className="rounded-lg text-xs">
                Overdue
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-destructive/50 bg-destructive/10 p-8 text-center space-y-2">
          <p className="text-sm font-medium text-destructive">
            Failed to load assignments. Please refresh or try again later.
          </p>
        </div>
      )}

      {!isLoading && !error && (
        <>
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
              {filtered.map(({ assignment, course, module }) => (
                <AssignmentListCard
                  key={assignment.id}
                  assignment={assignment}
                  course={course}
                  module={module}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="No assignments found"
              description="No assignments match your selected filter or search criteria."
            />
          )}
        </>
      )}
    </div>
  );
}
