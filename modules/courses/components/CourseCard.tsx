"use client";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, BookOpen, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CircularProgress } from "@/components/ui/circular-progress";
import { cn, formatDate, htmlToPlainText } from "@/lib/utils";
import type { Course } from "@/modules/courses/types";

/**
 * Editorial course card (plans/015-editorial-design-sync.md) — ported
 * from smarthub-core-client's `course-card.tsx`. The whole card is one
 * stretched link (not just the title), the thumbnail carries a
 * bottom-up scrim + category label instead of a boxed badge, and the
 * hover state moves four things together (image scale, title color,
 * card lift, arrow fill) rather than just a border tint.
 */
export function CourseCard({ course }: { course: Course }) {
  const started = new Date(course.startDate) <= new Date();
  const completed = course.status === "completed";
  const progress = Math.min(100, Math.max(0, course.progress || 0));

  return (
    <article className="group relative isolate flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card font-sans transition-all duration-300 hover:-translate-y-1 hover:border-primary/40">
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {course.imageUrl ? (
          <Image
            src={course.imageUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center transition-transform duration-500 group-hover:scale-[1.04]">
            <BookOpen className="h-8 w-8 text-primary/30" />
          </div>
        )}

        <div
          className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent"
          aria-hidden
        />

        <span className="absolute bottom-3 left-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-background">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
          {course.category}
          {/* A two-module purchase shouldn't read as a whole course. */}
          {course.isModuleAddon && (
            <span className="rounded-full border border-background/60 px-1.5 py-px text-[10px] tracking-[0.08em]">
              Add-on
            </span>
          )}
        </span>

        <div className="absolute right-3 top-3">
          <Badge
            variant={completed ? "success" : started ? undefined : "secondary"}
            className={cn(
              "text-[10px] backdrop-blur",
              started && !completed && "bg-background/90 text-foreground",
            )}
          >
            {completed
              ? "Completed"
              : started
                ? "In progress"
                : `Starts ${formatDate(course.startDate)}`}
          </Badge>
        </div>

        {/* Completion ring — the at-a-glance "how far in" signal,
            layered under the status badge rather than replacing it. */}
        {started && !completed && (
          <div className="absolute bottom-3 right-3 rounded-full bg-background/90 p-1 shadow-sm backdrop-blur">
            <CircularProgress value={progress} size={42} strokeWidth={3.5}>
              <span className="text-sm font-bold tabular-nums text-primary">
                {progress}
              </span>
            </CircularProgress>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          {course.mode ?? "Cohort"}
          {course.courseKind === "foundation" ? " / Foundation" : ""}
        </p>

        <h3 className="mt-2 font-display text-lg leading-snug text-balance transition-colors group-hover:text-accent">
          {course.name}
        </h3>

        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {htmlToPlainText(course.description)}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
          <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {course.durationLabel}
          </span>

          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-foreground transition-all duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-accent-foreground"
            aria-hidden
          >
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>

      <Link
        href={`/courses/${course.slug}`}
        className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <span className="sr-only">{course.name}</span>
      </Link>
    </article>
  );
}
