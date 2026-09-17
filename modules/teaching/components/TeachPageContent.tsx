"use client";

import { GraduationCap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/slices/authStore";
import { DashboardWebinarsWidget } from "@/modules/webinars/components/DashboardWebinarsWidget";
import { useTeachingCohorts } from "../api/teaching.queries";
import { groupCohortsByCourse } from "../lib/group-cohorts";
import { CourseCard } from "./CourseCard";
import { NeedsGradingStrip } from "./NeedsGradingStrip";
import { RecentSubmissionsTile } from "./RecentSubmissionsTile";
import { UpcomingClassesTile } from "./UpcomingClassesTile";

import { PageHeader } from "@/components/layout/page-header";
import { RefreshButton } from "@/components/ui/refresh-button";

/**
 * Instructor home (`/dashboard` in Teaching mode). Compact greeting +
 * a priority grid pairing action surfaces (Needs grading, Recent
 * submissions) with context (Upcoming classes, Webinars) — every tile
 * above the fold on desktop, stacked on mobile. Same
 * `grid gap-4 lg:grid-cols-3` / `lg:col-span-2` rhythm the student
 * dashboard uses for Calendar+Deadlines, so role-switching doesn't
 * change the mental model.
 *
 *   Row 1: Needs grading (2 cols)      + Upcoming classes (1 col)
 *   Row 2: Recent submissions (2 cols) + Webinars (1 col, self-gating)
 *   Row 3: Your cohorts — active, then dimmed past below a divider
 */
export function TeachPageContent() {
  const user = useAuthStore((s) => s.user);
  const { data: cohorts, isLoading, isFetching, error, refetch } = useTeachingCohorts();

  const greetingName = user?.firstName?.trim() || "there";
  const cohortCount = cohorts?.length ?? 0;
  const grouped = groupCohortsByCourse(cohorts ?? []);

  return (
    <div className="space-y-6">
      <PageHeader
        variant="editorial"
        eyebrow="Teaching"
        title={`Hi, ${greetingName}`}
        description={
          !isLoading
            ? cohortCount === 0
              ? "You're not leading any cohorts yet."
              : `Teaching ${cohortCount} ${cohortCount === 1 ? "cohort" : "cohorts"}.`
            : undefined
        }
        actions={<RefreshButton loading={isFetching} onClick={refetch} />}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <NeedsGradingStrip />
        </div>
        <UpcomingClassesTile />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentSubmissionsTile />
        </div>
        <DashboardWebinarsWidget />
      </div>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-foreground">Your courses</h2>

        {isLoading && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-56 rounded-2xl" />
            <Skeleton className="h-56 rounded-2xl" />
          </div>
        )}

        {error && (
          <Card className="p-6 border-destructive/30 bg-destructive/5">
            <p className="text-sm text-destructive">
              Couldn&apos;t load your cohorts. Try refreshing the page.
            </p>
          </Card>
        )}

        {!isLoading && !error && cohortCount === 0 && (
          <EmptyState
            icon={GraduationCap}
            title="No cohorts yet"
            description="You're not on any active schedules. Reach out to admin to be added to a cohort."
          />
        )}

        {!isLoading && cohortCount > 0 && (
          <div className="space-y-6">
            <div className="space-y-6">
              {grouped.active.map((g) => (
                <CourseCard key={g.courseId} group={g} />
              ))}
            </div>

            {grouped.past.length > 0 && (
              <>
                <div className="flex items-center gap-3 pt-4">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Past cohorts
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="space-y-6 opacity-70">
                  {grouped.past.map((g) => (
                    <CourseCard key={g.courseId} group={g} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
