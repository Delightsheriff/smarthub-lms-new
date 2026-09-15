"use client";
import Link from "next/link";
import { ArrowRight, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
    <Card className="p-0 overflow-hidden h-full flex flex-col hover:border-primary/40 hover:shadow-md transition-all">
      <Link href={courseHref} className="block">
        <div className="relative">
          <CourseCover
            imageUrl={course.imageUrl}
            name={course.name}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="aspect-16/9"
          />
          <div className="absolute top-2.5 left-2.5 flex gap-1">
            <Badge variant="secondary" className="text-[10px] backdrop-blur">
              Self-paced
            </Badge>
            <Badge
              variant={completed ? "outline" : started ? "default" : "outline"}
              className={
                "text-[10px] backdrop-blur bg-background/80 " +
                (completed ? "border-emerald-500/40 text-emerald-700 dark:text-emerald-300" : "")
              }
            >
              {completed ? "Completed" : started ? "In progress" : "Not started"}
            </Badge>
          </div>
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <Link href={courseHref} className="group">
          <h3 className="font-semibold text-sm sm:text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {course.name}
          </h3>
        </Link>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-1 mb-3">
          {htmlToPlainText(course.description)}
        </p>

        <div className="mt-auto space-y-3">
          <div className="space-y-1.5">
            <Progress value={progress.percent} className="h-1.5" />
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>
                {progress.completedLessons} of {progress.totalLessons} lessons
              </span>
              <span className="font-semibold text-primary tabular-nums">
                {progress.percent}%
              </span>
            </div>
          </div>

          {course.certificate && (
            <p className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
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
