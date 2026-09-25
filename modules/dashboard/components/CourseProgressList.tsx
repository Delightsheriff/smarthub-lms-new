"use client";
import Link from "next/link";
import { Ledger } from "@/components/ui/ledger";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyAssignments } from "@/modules/assignments/api/assignments.queries";
import { buildCourseProgress } from "../lib/course-progress";

/**
 * "Progress by course" — per enrolled course, how many of its
 * assignments the student has handed in (submitted, graded or returned).
 * A hairline ledger rather than a card per course. Self-gating: renders
 * nothing when the student has no assignments anywhere; the stats strip
 * and deadlines ledger already cover "nothing to do".
 */
export function CourseProgressList() {
  const { data, isLoading, isError } = useMyAssignments();

  if (isLoading) {
    return <Skeleton className="h-36 w-full rounded-[20px]" />;
  }

  if (isError) {
    return (
      <Ledger title="Progress by course">
        <p className="py-4 text-xs text-muted-foreground">
          Couldn&apos;t load your assignment progress. Try refreshing.
        </p>
      </Ledger>
    );
  }

  const rows = buildCourseProgress(data ?? []);
  if (rows.length === 0) return null;

  return (
    <Ledger title="Progress by course" count={rows.length}>
      {rows.map((r) => (
        <Link
          key={r.course.id}
          href={`/courses/${r.course.slug}`}
          className="-mx-1.5 block rounded-xl border-t border-border px-1.5 py-[11px] transition-colors duration-150 first:border-t-0 hover:bg-muted/60"
        >
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate text-[13px] font-medium text-foreground">
              {r.course.name}
            </span>
            <span
              className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground"
              aria-label={`${r.done} of ${r.total} assignments handed in`}
            >
              {r.done}/{r.total}
            </span>
          </div>
          <div className="relative mt-2 h-0.5 rounded-full bg-border" aria-hidden>
            <span
              className="absolute inset-y-0 left-0 rounded-full bg-primary"
              style={{ width: `${r.pct}%` }}
            />
          </div>
        </Link>
      ))}
    </Ledger>
  );
}
