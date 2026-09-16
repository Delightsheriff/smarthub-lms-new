"use client";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  GraduationCap,
  MessageCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CircularProgress } from "@/components/ui/circular-progress";
import { Progress } from "@/components/ui/progress";
import { RichText } from "@/components/ui/rich-text";
import { Skeleton } from "@/components/ui/skeleton";
import { htmlToPlainText } from "@/lib/utils";
import { publicSiteOrigin } from "@/lib/public-origin";
import { useSelfPacedCourse } from "../api/self-paced.queries";
import { SELF_PACED_ROUTES } from "../config/endpoints";
import { useCertificateRefetch } from "../hooks/use-certificate-refetch";
import { formatDuration } from "../lib/format";
import type { SelfPacedCourse } from "../types";
import { SelfPacedErrorState } from "./AccessStates";
import { CertificateCard } from "./CertificateCard";
import { CourseCover } from "./CourseCover";
import { CourseFaqs } from "./CourseFaqs";
import { LessonList } from "./LessonList";
import { PassMembershipCard } from "./PassMembershipCard";
import { SelfPacedNudges } from "./SelfPacedNudges";
import { UpgradeCreditBanner } from "./UpgradeCreditBanner";

export function SelfPacedCoursePageContent({ slug }: { slug: string }) {
  const { data: course, isLoading, error, refetch } = useSelfPacedCourse(slug);

  useCertificateRefetch(!!course?.completedAt && !course.certificate, refetch);

  if (isLoading) return <CourseSkeleton />;
  if (error || !course) {
    return <SelfPacedErrorState error={error} onRetry={() => void refetch()} />;
  }

  return (
    <div className="space-y-6 -mt-2 font-sans">
      <Link
        href={SELF_PACED_ROUTES.LIST}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Self-paced courses
      </Link>

      <CourseHero course={course} />

      <SelfPacedNudges courseId={course.id} />

      <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-6 space-y-6 lg:space-y-0">
        <div className="min-w-0 space-y-6">
          {course.overview && (
            <Card className="p-5 space-y-3">
              <p className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                <span className="h-px w-6 bg-accent" aria-hidden />
                Overview
              </p>
              <h2 className="font-display text-xl">About this course</h2>
              <RichText html={course.overview} className="text-muted-foreground" />
            </Card>
          )}

          <Card className="p-0 overflow-hidden">
            <header className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border">
              <h2 className="font-display text-xl">Lessons</h2>
              <div className="flex items-center gap-2.5">
                <span className="text-xs text-muted-foreground tabular-nums">
                  {course.progress.completedLessons}/{course.progress.totalLessons} done
                </span>
                <CircularProgress value={course.progress.percent} size={34} strokeWidth={3}>
                  <span className="text-[11px] font-bold tabular-nums">
                    {course.progress.percent}
                  </span>
                </CircularProgress>
              </div>
            </header>
            <LessonList
              slug={course.slug}
              lessons={course.lessons}
              nextLessonId={course.completedAt ? undefined : course.nextLessonId}
            />
          </Card>

          <CourseFaqs faqs={course.faqs} />
        </div>

        <aside className="space-y-4">
          {course.completedAt && (
            <CertificateCard
              courseName={course.name}
              certificate={course.certificate}
              completedAt={course.completedAt}
            />
          )}

          {course.whatsappGroupUrl && (
            <Card className="p-5">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/10">
                  <MessageCircle className="h-5 w-5 text-success" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold leading-tight">Join the course community</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Ask questions and learn alongside others taking this course.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3"
                    render={
                      <a
                        href={course.whatsappGroupUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Join the WhatsApp group
                      </a>
                    }
                  />
                </div>
              </div>
            </Card>
          )}

          <PassMembershipCard compact />

          {course.cohortTrack && (
            <UpgradeCreditBanner trackSlug={course.cohortTrack.slug} />
          )}

          {course.cohortTrack && (
            <Card className="p-5 border-primary/20 bg-primary/[0.03]">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold leading-tight">Ready to go further?</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Take this further with {course.cohortTrack.name} — live
                    classes, projects and instructor feedback.
                  </p>
                  <Button
                    size="sm"
                    className="mt-3"
                    render={
                      <a
                        href={`${publicSiteOrigin()}/courses/${course.cohortTrack.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        See the programme
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    }
                  />
                </div>
              </div>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}

function CourseHero({ course }: { course: SelfPacedCourse }) {
  const { progress, lessons } = course;
  const completed = !!course.completedAt;
  const first = lessons[0];
  const next = lessons.find((l) => l.id === course.nextLessonId);
  const totalDuration = formatDuration(
    lessons.reduce((sum, l) => sum + (l.durationSeconds || 0), 0)
  );

  const cta = completed || !next
    ? first && { label: "Review from the start", lessonId: first.id }
    : progress.completedLessons === 0
      ? { label: "Start course", lessonId: next.id }
      : { label: "Resume", lessonId: next.id };

  return (
    <div className="canvas-warm overflow-hidden rounded-2xl border border-border">
      <div className="md:grid md:grid-cols-[280px_1fr]">
        <CourseCover
          imageUrl={course.imageUrl}
          name={course.name}
          sizes="(max-width: 768px) 100vw, 280px"
          className="h-44 md:h-full"
        />
        <div className="p-6 md:p-8 flex flex-col justify-between">
          <div>
            <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              <span className="h-px w-8 bg-accent" aria-hidden />
              Self-paced course
            </p>
            <h1 className="mt-3 font-display text-2xl leading-[1.08] text-balance md:text-3xl lg:text-4xl text-foreground">
              {course.name}
            </h1>
            {course.description && (
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {htmlToPlainText(course.description)}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground mt-4">
              {course.difficulty && (
                <span className="inline-flex items-center gap-1.5 capitalize font-medium">
                  {course.difficulty}
                </span>
              )}
              {totalDuration && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {totalDuration} total
                </span>
              )}
              <span>
                {progress.completedLessons} of {progress.totalLessons} lessons ({progress.percent}%)
              </span>
              {completed && (
                <Badge variant="success" className="text-[10px]">
                  Completed
                </Badge>
              )}
            </div>
          </div>

          <div className="mt-6 space-y-3 pt-2">
            <Progress value={progress.percent} className="h-1.5" />
            {cta && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <Button
                  size="lg"
                  className="w-full sm:w-auto"
                  variant={completed ? "outline" : "default"}
                  render={
                    <Link href={SELF_PACED_ROUTES.LESSON(course.slug, cta.lessonId)}>
                      {cta.label}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  }
                />
                {!completed && next && progress.completedLessons > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Up next: <span className="font-medium text-foreground">{next.title}</span>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CourseSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-56 w-full rounded-2xl" />
      <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-6 space-y-4 lg:space-y-0">
        <Skeleton className="h-80 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    </div>
  );
}
