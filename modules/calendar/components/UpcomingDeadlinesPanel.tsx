"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ClipboardList } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUpcomingDeadlines } from "@/modules/assignments/api/assignments.queries";

/**
 * Standalone "Upcoming deadlines" card. Lives on the dashboard beside
 * the calendar in an outer `lg:grid-cols-3` (calendar takes 2 cols,
 * this card takes 1). Stacked on mobile, same row on lg+.
 *
 * Action-focused — each row is a direct link to the assignment
 * submission page. The calendar covers planning (when); this card
 * covers action (what to submit next).
 *
 * Renders an empty-state card (not null) so the grid keeps both
 * columns aligned when the student has no deadlines coming up.
 */
export function UpcomingDeadlinesPanel({
  limit = 5,
}: {
  limit?: number;
}) {
  const { data, isLoading } = useUpcomingDeadlines(limit);
  // Capture "now" once so the render stays pure (no Date.now() mid-
  // render); the panel is a lightweight dashboard surfacing, so a
  // stale-by-one-render clock is acceptable.
  const [now] = useState(() => Date.now());

  return (
    <section>
      <header className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">Upcoming deadlines</h2>
        <Link
          href="/assignments"
          className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1"
        >
          See all <ArrowRight className="h-3 w-3" />
        </Link>
      </header>

      <Card className="p-3">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        ) : !data || data.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No deadlines coming up.
          </p>
        ) : (
          <ul className="space-y-1">
            {data.map(({ course, module: mod, assignment }) => {
              const due = new Date(assignment.dueAt);
              const ms = due.getTime() - now;
              const days = Math.floor(ms / (1000 * 60 * 60 * 24));
              const dueLabel =
                ms < 0
                  ? `${Math.abs(days) || 1}d overdue`
                  : days === 0
                    ? "Today"
                    : days === 1
                      ? "Tomorrow"
                      : `${days}d`;
              const overdue = ms < 0;
              return (
                <li key={assignment.id}>
                  <Link
                    href={`/courses/${course.slug}/modules/${mod.slug}/assignments/${assignment.id}`}
                    className="group flex items-start gap-2.5 rounded-lg px-2 py-2 hover:bg-muted/40 transition-colors"
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
                        overdue
                          ? "bg-destructive/10 text-destructive"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      <ClipboardList className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-tight truncate group-hover:text-primary transition-colors">
                        {assignment.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {course.name}
                      </p>
                    </div>
                    <span
                      className={`text-[11px] font-semibold tabular-nums shrink-0 ${
                        overdue ? "text-destructive" : "text-muted-foreground"
                      }`}
                    >
                      {dueLabel}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </section>
  );
}
