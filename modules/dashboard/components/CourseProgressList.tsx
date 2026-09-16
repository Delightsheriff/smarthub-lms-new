"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyAssignments } from "@/modules/assignments/api/assignments.queries";
import type { Course } from "@/modules/courses/types";
import type { Assignment } from "@/modules/assignments/types";

interface PerCourse {
  course: Course;
  total: number;
  done: number;
  pct: number;
}

/**
 * Per-course assignment progress: how many of each course's
 * assignments the student has submitted (status submitted | graded |
 * returned counts as "done"). Empty when the student has no
 * assignments across any enrolled course.
 */
export function CourseProgressList() {
  const { data, isLoading } = useMyAssignments();

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
      </div>
    );
  }

  const rows = (data || []).reduce<Map<string, PerCourse>>((acc, item) => {
    const id = item.course.id;
    const existing = acc.get(id) || {
      course: item.course,
      total: 0,
      done: 0,
      pct: 0,
    };
    existing.total += 1;
    if (isDone(item.assignment)) existing.done += 1;
    acc.set(id, existing);
    return acc;
  }, new Map());

  const list = Array.from(rows.values())
    .map((r) => ({
      ...r,
      pct: r.total === 0 ? 0 : Math.round((r.done / r.total) * 100),
    }))
    .sort((a, b) => b.pct - a.pct);

  if (list.length === 0) return null;

  return (
    <Card className="rounded-2xl border-border bg-card p-0 overflow-hidden shadow-sm">
      <ul className="divide-y divide-border">
        {list.map((r) => (
          <li key={r.course.id}>
            <Link
              href={`/courses/${r.course.slug}`}
              className="group flex items-center gap-4 px-4 py-3 hover:bg-muted/40 transition-colors"
            >
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                    {r.course.name}
                  </p>
                  <span className="text-xs font-semibold tabular-nums text-muted-foreground shrink-0">
                    {r.done}/{r.total}
                  </span>
                </div>
                <Progress value={r.pct} className="h-1.5" />
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}

const isDone = (a: Assignment): boolean =>
  a.status === "submitted" || a.status === "graded" || a.status === "returned";
