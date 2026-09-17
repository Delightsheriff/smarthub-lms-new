"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { FileText, Search } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshButton } from "@/components/ui/refresh-button";
import { useEffectiveMode } from "@/hooks/use-effective-mode";
import { useMyAssignments } from "../api/assignments.queries";
import { AssignmentListCard } from "./assignment-list-card";
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
  return (
    <div className="space-y-6">
      <PageHeader
        variant="editorial"
        eyebrow="Teaching"
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
        eyebrow="Learning"
        title="My Assignments"
        description="View deadlines, submit coursework, and review instructor feedback across your enrolled courses."
      />

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assignments by title or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>

        <div className="flex items-center gap-2"><RefreshButton loading={isFetching} onClick={refetch} /><Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as Filter)}>
          <TabsList className="rounded-xl bg-muted/60 p-1">
            <TabsTrigger value="all" className="rounded-lg text-xs">
              All ({assignments?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="pending" className="rounded-lg text-xs">Pending</TabsTrigger>
            <TabsTrigger value="submitted" className="rounded-lg text-xs">Submitted</TabsTrigger>
            <TabsTrigger value="graded" className="rounded-lg text-xs">Graded</TabsTrigger>
            <TabsTrigger value="overdue" className="rounded-lg text-xs">Overdue</TabsTrigger>
          </TabsList>
        </Tabs></div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
