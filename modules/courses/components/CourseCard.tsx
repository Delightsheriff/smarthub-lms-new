"use client";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, BookOpen, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CircularProgress } from "@/components/ui/circular-progress";
import { cn, formatDate, htmlToPlainText } from "@/lib/utils";
import type { Course } from "@/modules/courses/types";

/**
 * Compact course card. Designed for a 2/3-up grid — image is a 16:9
 * tile, body keeps title + 2-line description + progress + meta in
 * a fixed footprint at md+ without scroll.
 */
export function CourseCard({ course }: { course: Course }) {
  const started = new Date(course.startDate) <= new Date();
  const completed = course.status === "completed";
  const progress = Math.min(100, Math.max(0, course.progress || 0));

  return (
    <Link href={`/courses/${course.slug}`} className="block group h-full">
      <Card className="p-0 overflow-hidden h-full flex flex-col group-hover:border-primary/40 group-hover:shadow-md transition-all">
        <div className="relative aspect-[16/9] w-full bg-gradient-to-br from-primary/15 via-primary/5 to-accent/10">
          {course.imageUrl ? (
            <Image
              src={course.imageUrl}
              alt={course.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="h-7 w-7 text-primary/30" />
            </div>
          )}
          <div className="absolute top-2.5 left-2.5">
            <Badge
              variant={
                completed ? "success" : started ? "outline" : "secondary"
              }
              className={cn("text-[10px] backdrop-blur", started && !completed && "bg-background/80")}
            >
              {completed
                ? "Completed"
                : started
                  ? "In progress"
                  : `Starts ${formatDate(course.startDate)}`}
            </Badge>
          </div>

          {/* Completion ring — the at-a-glance "how far in" signal for
              a card in a dense grid, replacing a footer progress bar
              that competed with the title/description for attention. */}
          {started && !completed && (
            <div className="absolute top-2 right-2 rounded-full bg-background/90 p-1 shadow-sm backdrop-blur">
              <CircularProgress value={progress} size={34} strokeWidth={3}>
                <span className="text-[10px] font-bold tabular-nums text-primary">
                  {progress}
                </span>
              </CircularProgress>
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="space-y-1 min-w-0">
              <Badge variant="secondary" className="text-[10px]">
                {course.category}
              </Badge>
              <h3 className="font-semibold text-sm sm:text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                {course.name}
              </h3>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-primary group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
          </div>

          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {htmlToPlainText(course.description)}
          </p>

          <div className="mt-auto inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            {course.durationLabel}
            {completed && (
              <span className="ml-auto font-semibold text-success">100%</span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
