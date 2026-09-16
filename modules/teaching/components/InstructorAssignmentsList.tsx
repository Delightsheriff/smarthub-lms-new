"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterBar, FilterDropdown } from "@/components/ui/filter-dropdown";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { useInstructorAssignments } from "../api/teaching.queries";
import type { InstructorAssignmentRow } from "../types";

type StatusFilter = "all" | "pending" | "graded" | "no-subs";
type DueFilter = "all" | "overdue" | "this-week" | "upcoming" | "no-date";
type VisibilityFilter = "all" | "published" | "draft";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending grade" },
  { value: "graded", label: "Fully graded" },
  { value: "no-subs", label: "No submissions" },
];

const DUE_FILTERS: { value: DueFilter; label: string }[] = [
  { value: "all", label: "All dates" },
  { value: "overdue", label: "Overdue" },
  { value: "this-week", label: "Due this week" },
  { value: "upcoming", label: "Upcoming" },
  { value: "no-date", label: "No date" },
];

const VISIBILITY_FILTERS: { value: VisibilityFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
];

/**
 * Instructor-facing list of every assignment across every cohort they
 * teach, with submission rollups. Sits below the Needs-grading strip on
 * the Tasks page. Each row links to the cohort detail page (lands on
 * Overview — the cohort page's tab state isn't URL-addressable yet, so
 * a deep link straight to its Submissions tab isn't possible today).
 */
export function InstructorAssignmentsList() {
  const [status, setStatus] = useState<StatusFilter>("all");
  const [due, setDue] = useState<DueFilter>("all");
  const [visibility, setVisibility] = useState<VisibilityFilter>("all");
  const [cohortId, setCohortId] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [now] = useState(() => Date.now());
  const { data, isLoading } = useInstructorAssignments();

  const cohorts = useMemo(() => {
    const seen = new Map<string, { id: string; label: string }>();
    for (const a of data || []) {
      if (!seen.has(a.schedule.id)) {
        seen.set(a.schedule.id, {
          id: a.schedule.id,
          label: a.schedule.name ? `${a.course.name} · ${a.schedule.name}` : a.course.name,
        });
      }
    }
    return Array.from(seen.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [data]);

  const visible = useMemo(() => {
    const all = data || [];
    const weekEndMs = now + 7 * 24 * 60 * 60 * 1000;
    const q = search.trim().toLowerCase();

    return all.filter((a) => {
      if (status === "pending" && a.pendingCount === 0) return false;
      if (status === "graded" && !(a.submissionCount > 0 && a.pendingCount === 0)) return false;
      if (status === "no-subs" && a.submissionCount !== 0) return false;

      if (cohortId !== "all" && a.schedule.id !== cohortId) return false;

      if (visibility === "published" && !a.isVisible) return false;
      if (visibility === "draft" && a.isVisible) return false;

      if (due !== "all") {
        if (due === "no-date") {
          if (a.dueDate) return false;
        } else {
          if (!a.dueDate) return false;
          const t = Date.parse(a.dueDate);
          if (Number.isNaN(t)) return false;
          if (due === "overdue" && t >= now) return false;
          if (due === "this-week" && (t < now || t > weekEndMs)) return false;
          if (due === "upcoming" && t <= weekEndMs) return false;
        }
      }

      if (q && !a.title.toLowerCase().includes(q)) return false;

      return true;
    });
  }, [data, status, due, visibility, cohortId, search, now]);

  const anyFilterActive =
    status !== "all" ||
    due !== "all" ||
    visibility !== "all" ||
    cohortId !== "all" ||
    search.trim().length > 0;

  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-display text-base font-semibold tracking-wide text-foreground">
          All assignments
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Every assignment across the cohorts you teach.
        </p>
      </div>

      <FilterBar>
        <div className="min-w-40 flex-1">
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">Search</p>
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title…" />
        </div>
        <FilterDropdown
          label="Cohort"
          options={[{ value: "all", label: "All cohorts" }, ...cohorts.map((c) => ({ value: c.id, label: c.label }))]}
          value={cohortId}
          onValueChange={setCohortId}
        />
        <FilterDropdown label="Status" options={STATUS_FILTERS} value={status} onValueChange={(v) => setStatus(v as StatusFilter)} />
        <FilterDropdown label="Due" options={DUE_FILTERS} value={due} onValueChange={(v) => setDue(v as DueFilter)} />
        <FilterDropdown label="Visibility" options={VISIBILITY_FILTERS} value={visibility} onValueChange={(v) => setVisibility(v as VisibilityFilter)} />
      </FilterBar>

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
      )}

      {!isLoading && visible.length === 0 && (
        <EmptyState
          icon={ClipboardList}
          title={anyFilterActive ? "Nothing matches your filters" : "No assignments yet"}
          description={
            anyFilterActive
              ? "Loosen a filter to see other rows."
              : "Attach an assignment to one of your cohorts to see it here."
          }
        />
      )}

      {!isLoading && visible.length > 0 && (
        <Card className="p-0 overflow-hidden rounded-2xl border-border bg-card shadow-sm">
          <ul className="divide-y divide-border">
            {visible.map((row) => (
              <li key={row.attachmentId}>
                <AssignmentRow row={row} />
              </li>
            ))}
          </ul>
        </Card>
      )}
    </section>
  );
}

function AssignmentRow({ row }: { row: InstructorAssignmentRow }) {
  return (
    <Link
      href={`/teach/cohorts/${row.schedule.id}`}
      className="group flex items-start justify-between gap-4 px-5 py-4 hover:bg-muted/50 transition-colors"
    >
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {row.course.name}
          {row.schedule.name ? ` · ${row.schedule.name}` : ""}
        </p>
        <p className="text-sm font-semibold leading-tight group-hover:text-primary transition-colors">
          {row.title}
        </p>
        <p className="text-xs text-muted-foreground">
          {row.dueDate ? `Due ${formatDate(row.dueDate, "long")}` : "No due date set"}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0 self-center">
        <RollupBadges row={row} />
        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
      </div>
    </Link>
  );
}

function RollupBadges({ row }: { row: InstructorAssignmentRow }) {
  if (row.submissionCount === 0) {
    return <Badge variant="secondary" className="whitespace-nowrap">No submissions</Badge>;
  }
  return (
    <div className="flex items-center gap-1.5">
      {row.pendingCount > 0 && (
        <Badge variant="warning" className="whitespace-nowrap">{row.pendingCount} pending</Badge>
      )}
      {row.gradedCount > 0 && (
        <Badge variant="success" className="whitespace-nowrap">{row.gradedCount} graded</Badge>
      )}
      {row.lateCount > 0 && (
        <Badge variant="destructive" className="whitespace-nowrap">{row.lateCount} late</Badge>
      )}
    </div>
  );
}
