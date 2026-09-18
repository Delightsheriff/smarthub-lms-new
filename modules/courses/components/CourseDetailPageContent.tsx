"use client";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Calendar,
  Clock,
  Download,
  GraduationCap,
  Loader2,
  MessageCircle,
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
    <div className="space-y-6 font-sans">
      {/* Hero Header */}
      <div className="canvas-warm overflow-hidden rounded-2xl border border-border">
        {course.imageUrl && (
          <div className="relative aspect-[3/1] w-full bg-muted border-b border-border/60">
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
        <div className="p-6 md:p-8">
          <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            <span className="h-px w-8 bg-accent" aria-hidden />
            {course.category}
          </p>
          <h1 className="mt-3 font-display text-3xl leading-[1.05] text-balance md:text-4xl text-foreground">
            {course.name}
          </h1>
          <CollapsibleRichText
            html={course.description}
            className="mt-3 max-w-3xl text-muted-foreground"
          />

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground mt-5">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <GraduationCap className="h-3.5 w-3.5 text-primary" />
              {course.instructor.name}
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Clock className="h-3.5 w-3.5 text-accent" />
              {course.durationLabel}
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              {new Date(course.startDate) <= new Date() ? "Started" : "Starts"}{" "}
              {formatDate(course.startDate)}
            </span>
          </div>
        </div>
      </div>

      {/* Reading + Rail Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px] items-start">
        {/* Left Column (~2/3): Syllabus, Modules, and About narrative */}
        <div className="space-y-6 min-w-0">
          {/* Modules Accordion */}
          <Card className="p-0 overflow-hidden rounded-2xl border-border bg-card shadow-xs">
            <div className="px-5 py-4 border-b border-border flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground">Curriculum & Modules</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {modules.length} modules · {totalRecordings} lessons · {totalAssignments} assignments
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 rounded-xl"
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
          <Card className="p-5 md:p-6 space-y-3 rounded-2xl border-border bg-card shadow-xs">
            <p className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
              <span className="h-px w-6 bg-accent" aria-hidden />
              Overview
            </p>
            <h2 className="font-display text-xl font-semibold text-foreground">About this programme</h2>
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
        </div>

        {/* Right Column (~340px): Sticky Operational Rail */}
        <aside className="space-y-5 lg:sticky lg:top-20">
          {/* Primary Action Card: Pick up / Resume */}
          <div className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-xs">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground font-medium">
              Your Course Progress
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="font-display text-3xl font-bold tabular-nums text-foreground">
                {course.progress}%
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {course.progress === 100 ? "Completed" : "In Progress"}
              </span>
            </div>
            <div className="mt-2 relative h-1.5 w-full overflow-hidden rounded-full bg-border">
              <span
                className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all duration-300"
                style={{ width: `${course.progress}%` }}
              />
            </div>

            {pickUp && (
              <div className="mt-5 space-y-2 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground truncate">
                  Next up: <span className="font-medium text-foreground">{pickUp.title}</span>
                </p>
                <Button
                  size="default"
                  className="w-full justify-center rounded-xl bg-primary text-primary-foreground font-semibold shadow-xs"
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

          {/* Metrics Bento Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-xl border border-border bg-card p-3.5 shadow-xs">
              <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                Modules
              </p>
              <p className="mt-1 font-display text-xl font-bold tabular-nums text-foreground">
                {modules.length}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3.5 shadow-xs">
              <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                Lessons
              </p>
              <p className="mt-1 font-display text-xl font-bold tabular-nums text-foreground">
                {totalRecordings}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3.5 shadow-xs">
              <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                Readings
              </p>
              <p className="mt-1 font-display text-xl font-bold tabular-nums text-foreground">
                {totalMaterials}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3.5 shadow-xs">
              <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                Tasks
              </p>
              <p className="mt-1 font-display text-xl font-bold tabular-nums text-foreground">
                {totalAssignments}
              </p>
            </div>
          </div>

          {/* Instructors Panel */}
          {course.instructors && course.instructors.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3.5">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground font-medium">
                {course.instructors.length > 1 ? "Instructors" : "Lead Instructor"}
              </span>
              <div className="space-y-3">
                {course.instructors.map((ins) => (
                  <div key={ins.id} className="flex items-start gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted border border-border/80">
                      {ins.imageUrl ? (
                        <Image
                          src={ins.imageUrl}
                          alt={ins.name}
                          fill
                          sizes="40px"
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
                          className="mt-1.5 inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-primary/15 transition-colors"
                        >
                          <MessageCircle className="h-3 w-3" />
                          Message
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
