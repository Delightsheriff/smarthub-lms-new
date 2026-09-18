"use client";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  GraduationCap,
  Layers,
  Loader2,
  MessageCircle,
  Video,
} from "lucide-react";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCourseBySlug,
  useDownloadCurriculum,
} from "../api/courses.queries";
import { CourseModuleRow } from "./course-module-row";
import { CollapsibleRichText } from "@/components/ui/collapsible-rich-text";
import { formatDate } from "@/lib/utils";

/**
 * Course landing — hosts the hero, course meta, progress, and a
 * "Pick up" CTA that drops the student into the most recent unfinished
 * module. The layout-level outline handles "browse by module".
 */
export function CourseDetailPageContent({ slug }: { slug: string }) {
  const { data, isLoading } = useCourseBySlug(slug);
  const downloadCurriculum = useDownloadCurriculum();

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    );
  }

  if (!data) {
    notFound();
  }

  const { course, modules } = data;

  // "Pick up" target — first module with at least one unwatched recording,
  // else first with content, else the first module overall.
  const pickUp =
    modules.find((m) => m.recordings.some((r) => !r.watched)) ||
    modules.find(
      (m) =>
        m.recordings.length + m.materials.length + m.assignments.length > 0,
    ) ||
    modules[0];

  const totalRecordings = modules.reduce(
    (sum, m) => sum + m.recordings.length,
    0,
  );
  const totalMaterials = modules.reduce(
    (sum, m) => sum + m.materials.length,
    0,
  );
  const totalAssignments = modules.reduce(
    (sum, m) => sum + m.assignments.length,
    0,
  );

  return (
    <div className="space-y-6 font-sans w-full min-w-0 max-w-full">
      {/* Hero Header */}
      <div className="canvas-warm overflow-hidden rounded-2xl border border-border">
        {course.imageUrl && (
          <div className="relative aspect-[2/1] sm:aspect-[3/1] w-full bg-muted border-b border-border/60">
            <Image
              src={course.imageUrl}
              alt={course.name}
              fill
              sizes="(max-width: 768px) 100vw, 960px"
              className="object-cover"
              priority
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent"
              aria-hidden
            />
          </div>
        )}
        <div className="p-4 sm:p-6 md:p-8">
          <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            <span className="h-px w-6 sm:w-8 bg-accent" aria-hidden />
            {course.category}
          </p>
          <h1 className="mt-3 font-display text-2xl sm:text-3xl md:text-4xl leading-[1.1] text-balance text-foreground break-words">
            {course.name}
          </h1>
          <CollapsibleRichText
            html={course.description}
            className="mt-3 max-w-3xl text-muted-foreground"
          />

          <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-5 gap-y-2 text-xs text-muted-foreground mt-4 sm:mt-5">
            <span className="inline-flex items-center gap-1.5 font-medium min-w-0">
              <GraduationCap className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="truncate max-w-[200px]">{course.instructor.name}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium shrink-0">
              <Clock className="h-3.5 w-3.5 text-accent shrink-0" />
              {course.durationLabel}
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium shrink-0">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              {new Date(course.startDate) <= new Date() ? "Started" : "Starts"}{" "}
              {formatDate(course.startDate)}
            </span>
          </div>
        </div>
      </div>

      {/* Integrated Progress & Pick Up Action Banner */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2 min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground font-medium">
                Course Progress
              </span>
              <div className="flex items-center gap-2">
                <span className="font-display text-base font-bold tabular-nums text-foreground">
                  {course.progress}%
                </span>
                <span className="text-xs text-muted-foreground">
                  {course.progress === 100 ? "Completed" : "In Progress"}
                </span>
              </div>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
              <span
                className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all duration-300"
                style={{ width: `${course.progress}%` }}
              />
            </div>
            {pickUp && (
              <p className="text-xs text-muted-foreground truncate pt-0.5">
                Next up: <span className="font-medium text-foreground">{pickUp.title}</span>
              </p>
            )}
          </div>
          {pickUp && (
            <div className="shrink-0">
              <Button
                size="default"
                className="w-full sm:w-auto justify-center rounded-xl bg-primary text-primary-foreground font-semibold shadow-xs gap-2 active:scale-[0.97] transition-[transform,background-color]"
                render={
                  <Link href={`/courses/${course.slug}/modules/${pickUp.slug}`} />
                }
              >
                Pick up where you left off
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Metrics Bento Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] font-medium">Modules</span>
            <Layers className="h-4 w-4 text-primary/70" />
          </div>
          <p className="mt-2 font-display text-2xl sm:text-3xl font-bold tabular-nums text-foreground">
            {modules.length}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] font-medium">Lessons</span>
            <Video className="h-4 w-4 text-accent/80" />
          </div>
          <p className="mt-2 font-display text-2xl sm:text-3xl font-bold tabular-nums text-foreground">
            {totalRecordings}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] font-medium">Readings</span>
            <BookOpen className="h-4 w-4 text-primary/70" />
          </div>
          <p className="mt-2 font-display text-2xl sm:text-3xl font-bold tabular-nums text-foreground">
            {totalMaterials}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] font-medium">Tasks</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="mt-2 font-display text-2xl sm:text-3xl font-bold tabular-nums text-foreground">
            {totalAssignments}
          </p>
        </div>
      </div>

      {/* Curriculum & Modules Accordion */}
      <Card className="p-0 overflow-hidden rounded-2xl border-border bg-card shadow-xs">
        <div className="px-4 py-3.5 sm:px-5 sm:py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-display text-lg sm:text-xl font-semibold text-foreground">
              Curriculum & Modules
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {modules.length} modules · {totalRecordings} lessons · {totalAssignments} assignments
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 rounded-xl shrink-0 self-start sm:self-auto active:scale-[0.97] transition-transform"
            disabled={downloadCurriculum.isPending}
            onClick={() => downloadCurriculum.mutate(slug)}
          >
            {downloadCurriculum.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            {downloadCurriculum.isPending
              ? "Preparing…"
              : "Curriculum PDF"}
          </Button>
        </div>
        <Accordion>
          {modules.map((m) => (
            <CourseModuleRow key={m.id} courseSlug={course.slug} module={m} />
          ))}
        </Accordion>
      </Card>

      {/* About Section */}
      <Card className="p-4 sm:p-6 space-y-3 rounded-2xl border-border bg-card shadow-xs">
        <p className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
          <span className="h-px w-6 bg-accent" aria-hidden />
          Overview
        </p>
        <h2 className="font-display text-lg sm:text-xl font-semibold text-foreground">
          About this programme
        </h2>
        <CollapsibleRichText
          html={course.description}
          className="text-muted-foreground leading-relaxed text-sm"
        />
        <p className="text-sm text-muted-foreground leading-relaxed">
          You&apos;ll work through {modules.length} modules, with live sessions, recordings,
          supplementary materials, and graded assignments. Your progress is saved automatically
          across modules and devices.
        </p>
      </Card>

      {/* Instructors Panel */}
      {course.instructors && course.instructors.length > 0 && (
        <Card className="p-4 sm:p-6 rounded-2xl border-border bg-card shadow-xs space-y-4">
          <div>
            <p className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
              <span className="h-px w-6 bg-accent" aria-hidden />
              Faculty
            </p>
            <h2 className="mt-1 font-display text-lg sm:text-xl font-semibold text-foreground">
              {course.instructors.length > 1 ? "Teaching Team" : "Lead Instructor"}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {course.instructors.map((ins) => (
              <div
                key={ins.id}
                className="flex items-start gap-3.5 rounded-xl border border-border/80 bg-muted/20 p-3.5"
              >
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-muted border border-border/80">
                  {ins.imageUrl ? (
                    <Image
                      src={ins.imageUrl}
                      alt={ins.name}
                      fill
                      sizes="44px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-muted-foreground">
                      {ins.name
                        .split(" ")
                        .map((p) => p[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground truncate">{ins.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{ins.title}</p>
                  {ins.whatsapp && (
                    <a
                      href={`https://wa.me/${ins.whatsapp
                        .replace(/\D/g, "")
                        .replace(/^0/, "234")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-primary/15 transition-colors active:scale-[0.97]"
                    >
                      <MessageCircle className="h-3 w-3" />
                      WhatsApp
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
