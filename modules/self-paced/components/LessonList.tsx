"use client";
import Link from "next/link";
import { CheckCircle2, Paperclip } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SELF_PACED_ROUTES } from "../config/endpoints";
import { formatDuration } from "../lib/format";
import type { SelfPacedLesson } from "../types";

export function LessonList({
  slug,
  lessons,
  currentLessonId,
  nextLessonId,
  compact = false,
  onItemClick,
}: {
  slug: string;
  lessons: SelfPacedLesson[];
  currentLessonId?: string;
  nextLessonId?: string;
  compact?: boolean;
  /** Called when a lesson link is clicked — used by the mobile drawer
   *  to auto-close on selection. */
  onItemClick?: () => void;
}) {
  if (!lessons.length) {
    return (
      <p className="px-4 py-8 text-center text-sm text-muted-foreground">
        Lessons are on their way. Check back soon.
      </p>
    );
  }

  return (
    <ol className="divide-y">
      {lessons.map((lesson, i) => {
        const current = lesson.id === currentLessonId;
        const upNext = !current && lesson.id === nextLessonId;
        const duration = formatDuration(lesson.durationSeconds);
        return (
          <li key={lesson.id}>
            <Link
              href={SELF_PACED_ROUTES.LESSON(slug, lesson.id)}
              aria-current={current ? "page" : undefined}
              onClick={onItemClick}
              className={cn(
                "flex items-center gap-3 border-l-2 px-4 transition-colors",
                compact ? "py-2.5" : "py-3",
                current
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-transparent hover:bg-muted/50"
              )}
            >
              {lesson.completed ? (
                <CheckCircle2
                  className={cn(
                    "h-5 w-5 shrink-0",
                    current ? "text-primary-foreground" : "text-success"
                  )}
                  aria-label="Completed"
                />
              ) : (
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold tabular-nums",
                    current
                      ? "border-primary-foreground text-primary-foreground"
                      : "text-muted-foreground"
                  )}
                  aria-label="Not completed"
                >
                  {i + 1}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-sm leading-snug",
                    compact ? "line-clamp-2" : "truncate",
                    current ? "font-semibold" : "font-medium"
                  )}
                >
                  {lesson.title}
                </p>
                {(duration || lesson.assetCount > 0) && (
                  <p
                    className={cn(
                      "mt-0.5 flex items-center gap-2 text-[11px]",
                      current ? "text-primary-foreground/80" : "text-muted-foreground"
                    )}
                  >
                    {duration && <span>{duration}</span>}
                    {lesson.assetCount > 0 && (
                      <span className="inline-flex items-center gap-0.5">
                        <Paperclip className="h-3 w-3" />
                        {lesson.assetCount}
                      </span>
                    )}
                  </p>
                )}
              </div>
              {upNext && (
                <Badge
                  variant="outline"
                  className="shrink-0 text-[10px] border-accent/40 text-accent bg-accent/10"
                >
                  Up next
                </Badge>
              )}
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
