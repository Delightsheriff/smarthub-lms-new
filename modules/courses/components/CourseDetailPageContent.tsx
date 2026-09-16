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
      {/* Hero — editorial treatment (plans/015-editorial-design-sync.md):
          eyebrow + serif display title in place of the old boxed
          gradient card + font-semibold heading. */}
      <div className="canvas-warm overflow-hidden rounded-2xl border border-border">
        {course.imageUrl && (
          <div className="relative aspect-[3/1] w-full bg-muted">
            <Image
              src={course.imageUrl}
              alt={course.name}
              fill
              sizes="(max-width: 768px) 100vw, 960px"
              className="object-cover"
              priority
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent"
              aria-hidden
            />
          </div>
        )}
        <div className="p-6 md:p-8">
          <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            <span className="h-px w-8 bg-accent" aria-hidden />
            {course.category}
          </p>
          <h1 className="mt-3 font-display text-3xl leading-[1.05] text-balance md:text-4xl">
            {course.name}
          </h1>
          <CollapsibleRichText
            html={course.description}
            className="mt-3 max-w-2xl text-muted-foreground"
          />

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground mt-5">
            <span className="inline-flex items-center gap-1.5">
              <GraduationCap className="h-3.5 w-3.5" />
              {course.instructor.name}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {course.durationLabel}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(course.startDate) <= new Date() ? "Started" : "Starts"}{" "}
              {formatDate(course.startDate)}
            </span>
          </div>

          {pickUp && (
            <div className="mt-6">
              <Button
                size="lg"
                className="w-full sm:w-auto"
                render={
                  <Link
                    href={`/courses/${course.slug}/modules/${pickUp.slug}`}
                  />
                }
              >
                Pick up where you left off
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Stats — hairline-divided strip instead of four boxed cards. */}
      <div className="grid grid-cols-2 divide-x divide-y divide-border rounded-2xl border border-border bg-card shadow-sm sm:grid-cols-5 sm:divide-y-0 overflow-hidden">
        <Stat label="Progress" value={`${course.progress}%`} />
        <Stat label="Modules" value={modules.length} />
        <Stat label="Recordings" value={totalRecordings} />
        <Stat label="Materials" value={totalMaterials} />
        <Stat label="Assignments" value={totalAssignments} />
      </div>

      {/* About */}
      <Card className="p-5 md:p-6 space-y-3 rounded-2xl border-border bg-card shadow-sm">
        <p className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
          <span className="h-px w-6 bg-accent" aria-hidden />
          About
        </p>
        <h2 className="font-display text-xl font-semibold">About this programme</h2>
        <CollapsibleRichText
          html={course.description}
          className="text-muted-foreground"
        />
        <p className="text-sm text-muted-foreground">
          You&apos;ll work through {modules.length} modules, with live
          sessions, recordings, supplementary materials, and graded
          assignments. Use the outline on the left to jump between any
          module or item — your progress is saved automatically.
        </p>
      </Card>

      {/* Instructors */}
      {course.instructors && course.instructors.length > 0 && (
        <Card className="p-5 md:p-6 space-y-4 rounded-2xl border-border bg-card shadow-sm">
          <p className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
            <span className="h-px w-6 bg-accent" aria-hidden />
            Meet the team
          </p>
          <h2 className="font-display text-xl font-semibold">
            Your {course.instructors.length > 1 ? "instructors" : "instructor"}
          </h2>
          <ul className="space-y-4">
            {course.instructors.map((ins) => (
              <li key={ins.id} className="flex gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
                  {ins.imageUrl ? (
                    <Image
                      src={ins.imageUrl}
                      alt={ins.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
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
                  <p className="text-sm font-semibold">{ins.name}</p>
                  <p className="text-xs text-muted-foreground">{ins.title}</p>
                  {ins.bio && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {ins.bio}
                    </p>
                  )}
                  {ins.whatsapp && (
                    <a
                      href={`https://wa.me/${ins.whatsapp
                        .replace(/\D/g, "")
                        .replace(/^0/, "234")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/15"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      Message on WhatsApp
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Modules at a glance */}
      <Card className="p-0 overflow-hidden rounded-2xl border-border bg-card shadow-sm">
        <div className="px-5 py-4 border-b border-border flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-semibold">Course modules</h2>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
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
              : "Download curriculum"}
          </Button>
        </div>
        <Accordion>
          {modules.map((m) => (
            <CourseModuleRow key={m.id} courseSlug={course.slug} module={m} />
          ))}
        </Accordion>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="p-4">
      <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl tabular-nums leading-tight md:text-3xl">
        {value}
      </p>
    </div>
  );
}
