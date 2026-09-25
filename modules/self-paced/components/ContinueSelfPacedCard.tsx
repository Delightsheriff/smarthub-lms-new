"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSelfPacedCourses } from "../api/self-paced.queries";
import { SELF_PACED_ROUTES } from "../config/endpoints";
import { pickContinueCourses } from "../lib/continue-pick";
import { CourseCover } from "./CourseCover";

/**
 * Dashboard re-entry for self-paced learning, as a bento tile for a
 * learner who also has a cohort (the cohort course owns the hero slot).
 * A self-paced-only learner gets the same course in the hero instead —
 * see the dashboard page. Absent when there's nothing unfinished, never
 * an empty placeholder.
 */
export function ContinueSelfPacedCard() {
  const { data } = useSelfPacedCourses();
  const candidates = pickContinueCourses(data ?? []);
  const course = candidates[0];
  if (!course?.nextLesson) return null;

  const started = course.progress.completedLessons > 0;

  return (
    <section
      aria-label="Continue self-paced learning"
      className="flex flex-col overflow-hidden rounded-[20px] border border-border bg-card sm:flex-row"
    >
      <CourseCover
        imageUrl={course.imageUrl}
        name={course.name}
        sizes="(max-width: 640px) 100vw, 180px"
        className="h-28 shrink-0 sm:h-auto sm:w-[180px]"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            Self-paced · {started ? "Continue" : "Start"}
          </p>
          {candidates.length > 1 && (
            <Link
              href={SELF_PACED_ROUTES.LIST}
              className="font-mono text-[11px] text-muted-foreground hover:text-foreground"
            >
              All {candidates.length} →
            </Link>
          )}
        </div>
        <div className="min-w-0">
          <h3 className="truncate font-display text-lg font-semibold leading-tight text-foreground">
            {course.name}
          </h3>
          <p className="mt-0.5 truncate text-[13px] text-muted-foreground">
            Up next: {course.nextLesson.title}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative h-0.5 flex-1 rounded-full bg-border" aria-hidden>
            <span
              className="absolute inset-y-0 left-0 rounded-full bg-primary"
              style={{ width: `${course.progress.percent}%` }}
            />
          </div>
          <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
            {course.progress.completedLessons}/{course.progress.totalLessons} lessons
          </span>
        </div>
        <div className="flex justify-end">
          <Button
            size="sm"
            nativeButton={false}
            render={
              <Link href={SELF_PACED_ROUTES.LESSON(course.slug, course.nextLesson.id)} />
            }
          >
            {started ? "Continue →" : "Start →"}
          </Button>
        </div>
      </div>
    </section>
  );
}
