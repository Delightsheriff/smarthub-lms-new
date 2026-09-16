"use client";
import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useSelfPacedCourses } from "../api/self-paced.queries";
import { SELF_PACED_ROUTES } from "../config/endpoints";
import type { SelfPacedCourseSummary } from "../types";
import { CourseCover } from "./CourseCover";

const time = (iso?: string) => (iso ? new Date(iso).getTime() || 0 : 0);

/**
 * Which course to put in front of the learner: the one most recently
 * worked on (`lastActivityAt`, the latest lesson completion). Without
 * that — nothing completed yet, or an API that doesn't send it — a
 * course already under way beats one not started, then the most
 * recently granted wins.
 */
const pick = (courses: SelfPacedCourseSummary[]) =>
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

/** Dashboard re-entry for self-paced learning. Absent when there's
 *  nothing unfinished — never an empty placeholder. */
export function ContinueSelfPacedCard() {
  const { data } = useSelfPacedCourses();
  const candidates = pick(data ?? []);
  const course = candidates[0];
  if (!course?.nextLesson) return null;

  return (
    <section>
      <header className="flex items-center justify-between mb-3">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Continue learning
        </h2>
        {candidates.length > 1 ? (
          <Link
            href={SELF_PACED_ROUTES.LIST}
            className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1"
          >
            All self-paced <ArrowRight className="h-3 w-3" />
          </Link>
        ) : (
          <PlayCircle className="h-4 w-4 text-primary" />
        )}
      </header>
      <Card className="p-0 overflow-hidden rounded-2xl border border-border bg-card shadow-sm hover:border-primary/40 transition-all duration-300">
        <div className="md:grid md:grid-cols-[200px_1fr]">
          <CourseCover
            imageUrl={course.imageUrl}
            name={course.name}
            sizes="(max-width: 768px) 100vw, 200px"
            className="h-32 md:h-full"
          />
          <div className="p-5">
            <Badge variant="secondary" className="mb-2">
              Self-paced
            </Badge>
            <h3 className="font-display font-semibold text-lg leading-tight text-foreground">
              {course.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
              Up next: {course.nextLesson.title}
            </p>
            <div className="mt-3 mb-4 space-y-1">
              <Progress value={course.progress.percent} className="h-1.5" />
              <p className="text-xs text-muted-foreground">
                {course.progress.completedLessons} of {course.progress.totalLessons}{" "}
                lessons · {course.progress.percent}%
              </p>
            </div>
            <Button
              size="sm"
              className="w-full sm:w-auto"
              render={
                <Link href={SELF_PACED_ROUTES.LESSON(course.slug, course.nextLesson.id)}>
                  {course.progress.completedLessons > 0 ? "Continue" : "Start"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              }
            />
          </div>
        </div>
      </Card>
    </section>
  );
}
