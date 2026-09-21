"use client";
import Link from "next/link";
import { ArrowRight, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CircularProgress } from "@/components/ui/circular-progress";
import { htmlToPlainText } from "@/lib/utils";
import { SELF_PACED_ROUTES } from "../config/endpoints";
import type { SelfPacedCourseSummary } from "../types";
import { CourseCover } from "./CourseCover";

export function SelfPacedCourseCard({
  course,
}: {
  course: SelfPacedCourseSummary;
}) {
  const { progress } = course;
  const completed = !!course.completedAt;
  const started = progress.completedLessons > 0;
  const courseHref = SELF_PACED_ROUTES.COURSE(course.slug);
  const continueHref = course.nextLesson
    ? SELF_PACED_ROUTES.LESSON(course.slug, course.nextLesson.id)
    : courseHref;

  return (
    <Card className="p-0 overflow-hidden rounded-2xl h-full flex flex-col border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40">
      <Link href={courseHref} className="block">
        <div className="relative">
          <CourseCover
            imageUrl={course.imageUrl}
            name={course.name}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="aspect-[16/10]"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent"
            aria-hidden
          />

           <span className="glass-thin absolute bottom-3 left-4 flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
            Self-paced
          </span>

          {(!started || completed) && (
            <div className="absolute right-3 top-3">
              <Badge
                variant={completed ? "success" : "secondary"}
                 className="glass-thin text-[10px]"
              >
                {completed ? "Completed" : "Not started"}
              </Badge>
            </div>
          )}

          {/* Completion ring — same "how far in" signal as the cohort
              course card, replacing a footer progress bar that competed
              with the title/description for attention. */}
          {started && !completed && (
             <div className="glass-thin absolute bottom-3 right-3 rounded-full p-1">
              <CircularProgress value={progress.percent} size={42} strokeWidth={3.5}>
                <span className="text-sm font-bold tabular-nums text-primary">
                  {progress.percent}
                </span>
              </CircularProgress>
            </div>
          )}
        </div>
      </Link>

      <div className="p-5 flex flex-col flex-1">
        <Link href={courseHref} className="group">
          <h3 className="font-display text-lg leading-snug line-clamp-2 transition-colors group-hover:text-accent">
            {course.name}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
          {htmlToPlainText(course.description)}
        </p>

        <div className="mt-auto space-y-3 border-t border-border pt-4">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>
              {progress.completedLessons} of {progress.totalLessons} lessons
            </span>
            {completed && (
              <span className="font-semibold text-success tabular-nums">100%</span>
            )}
          </div>

          {course.certificate && (
            <p className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
              <Award className="h-3.5 w-3.5" />
              Certificate ready
            </p>
          )}

          <Button
            size="sm"
            variant={completed ? "outline" : "default"}
            className="w-full"
            render={
              <Link href={continueHref}>
                {completed
                  ? "Review course"
                  : started
                    ? "Continue"
                    : "Start course"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
          {!completed && course.nextLesson && (
            <p className="text-[11px] text-muted-foreground line-clamp-1">
              Up next: {course.nextLesson.title}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
