"use client";
import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Progress } from "@/components/ui/progress";
import { RefreshButton } from "@/components/ui/refresh-button";
import { IndexList, IndexRow } from "@/components/ui/index-list";
import { Skeleton } from "@/components/ui/skeleton";
import { publicSiteOrigin } from "@/lib/public-origin";
import { pluralize } from "@/lib/utils";
import { useSelfPacedCourses } from "../api/self-paced.queries";
import { SELF_PACED_ROUTES } from "../config/endpoints";
import type { SelfPacedCourseSummary } from "../types";
import { CourseCover } from "./CourseCover";

const time = (iso?: string) => (iso ? new Date(iso).getTime() || 0 : 0);

/**
 * Identify the genuinely active course: most recent activity (latest
 * lesson completion), falling back to in-progress vs not started.
 */
const pickActive = (courses: SelfPacedCourseSummary[]) =>
  courses
    .filter((c) => !c.completedAt && c.nextLesson)
    .sort((a, b) => {
      const activity = time(b.lastActivityAt) - time(a.lastActivityAt);
      if (activity !== 0) return activity;
      const startedA = a.progress.completedLessons > 0 ? 1 : 0;
      const startedB = b.progress.completedLessons > 0 ? 1 : 0;
      if (startedA !== startedB) return startedB - startedA;
      return time(b.grantedAt) - time(a.grantedAt);
    });

export function SelfPacedCoursesPageContent() {
  const { data, isLoading, isFetching, isError, refetch } = useSelfPacedCourses();
  const courses = data ?? [];
  const empty = !isLoading && !isError && courses.length === 0;

  const count = courses.length;
  const dateline = data ? `${pluralize(count, "Course")} Enrolled` : undefined;

  const activeCandidates = pickActive(courses);
  const heroCourse = activeCandidates[0];

  return (
    <div className="space-y-8 font-sans">
      <PageHeader
        variant="editorial"
        eyebrow="Learning"
        title="Self-paced courses"
        dateline={dateline}
        divider
        description="Work through lessons in order, track your progress, and pick up exactly where you left off."
        actions={<RefreshButton loading={isFetching} onClick={refetch} />}
      />

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-44 w-full rounded-2xl" />
          <div className="space-y-2 border-t border-border pt-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      )}

      {isError && (
        <Card className="p-6 text-center text-sm text-destructive rounded-2xl border-destructive/20 bg-destructive/5">
          Couldn&apos;t load your self-paced courses. Please try refreshing.
        </Card>
      )}

      {empty && (
        <EmptyState
          icon={PlayCircle}
          title="No self-paced courses yet"
          description="Courses you buy appear here straight away."
          action={
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              render={
                <a href={publicSiteOrigin()} target="_blank" rel="noopener noreferrer">
                  Browse courses
                </a>
              }
            />
          }
        />
      )}

      {!isLoading && !isError && courses.length > 0 && (
        <div className="space-y-8">
          {/* Continue learning hero — only when an active, unfinished course exists */}
          {heroCourse && heroCourse.nextLesson && (
            <section className="space-y-3">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-accent">
                Continue Learning
              </p>
              <Card className="p-0 overflow-hidden rounded-2xl border border-border bg-card shadow-xs hover:border-primary/40 transition-all duration-300">
                <div className="md:grid md:grid-cols-[240px_1fr]">
                  <CourseCover
                    imageUrl={heroCourse.imageUrl}
                    name={heroCourse.name}
                    sizes="(max-width: 768px) 100vw, 240px"
                    className="h-40 md:h-full"
                  />
                  <div className="p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="rounded-md text-[10px]">
                          Self-paced
                        </Badge>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {heroCourse.progress.completedLessons} of {heroCourse.progress.totalLessons} lessons
                        </span>
                      </div>
                      <h3 className="font-display font-semibold text-xl leading-tight text-foreground">
                        {heroCourse.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        Up next: <span className="text-foreground font-medium">{heroCourse.nextLesson.title}</span>
                      </p>
                      <div className="mt-4 space-y-1.5 max-w-md">
                        <Progress value={heroCourse.progress.percent} className="h-1.5" />
                        <p className="font-mono text-[11px] text-muted-foreground text-right tabular-nums">
                          {heroCourse.progress.percent}% complete
                        </p>
                      </div>
                    </div>
                    <div className="pt-4 mt-2">
                      <Button
                        size="sm"
                        className="rounded-xl w-full sm:w-auto"
                        render={
                          <Link href={SELF_PACED_ROUTES.LESSON(heroCourse.slug, heroCourse.nextLesson.id)}>
                            {heroCourse.progress.completedLessons > 0 ? "Continue Lesson" : "Start Course"}
                            <ArrowRight className="h-4 w-4 ml-1.5" />
                          </Link>
                        }
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </section>
          )}

          {/* All enrolled tracks as magazine IndexList */}
          <section className="space-y-3">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Enrolled Tracks ({courses.length})
            </p>
            <IndexList>
              {courses.map((course, idx) => {
                const status = course.completedAt
                  ? "Completed"
                  : course.progress.completedLessons > 0
                    ? "In progress"
                    : "Not started";

                return (
                  <IndexRow
                    key={course.id}
                    index={idx + 1}
                    title={course.name}
                    subtitle={`${course.progress.completedLessons} of ${course.progress.totalLessons} lessons`}
                    progress={course.progress.percent}
                    status={status}
                    href={SELF_PACED_ROUTES.COURSE(course.slug)}
                  />
                );
              })}
            </IndexList>
          </section>
        </div>
      )}
    </div>
  );
}
