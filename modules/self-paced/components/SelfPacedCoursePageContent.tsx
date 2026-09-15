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
    <div className="space-y-5 -mt-2">
      <Link
        href={SELF_PACED_ROUTES.LIST}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Self-paced courses
      </Link>

      <CourseHero course={course} />

      <SelfPacedNudges courseId={course.id} />

      <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-6 space-y-5 lg:space-y-0">
        <div className="min-w-0 space-y-5">
          {course.overview && (
            <Card className="p-5">
              <h2 className="font-semibold mb-2">About this course</h2>
              <RichText html={course.overview} />
            </Card>
          )}

          <Card className="p-0 overflow-hidden">
            <header className="flex items-center justify-between px-4 py-3 border-b">
              <h2 className="font-semibold">Lessons</h2>
              <span className="text-xs text-muted-foreground tabular-nums">
                {course.progress.completedLessons}/{course.progress.totalLessons} done
              </span>
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
    <Card className="p-0 overflow-hidden">
      <div className="md:grid md:grid-cols-[260px_1fr]">
        <CourseCover
          imageUrl={course.imageUrl}
          name={course.name}
          sizes="(max-width: 768px) 100vw, 260px"
          className="h-36 md:h-full"
        />
        <div className="p-5 space-y-4">
          <div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              <Badge variant="secondary">Self-paced</Badge>
              {course.difficulty && (
                <Badge variant="outline" className="capitalize">
                  {course.difficulty}
                </Badge>
              )}
              {completed && (
                <Badge
                  variant="outline"
                  className="border-success/30 text-success bg-success/10"
                >
                  Completed
                </Badge>
              )}
            </div>
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight leading-tight">
              {course.name}
            </h1>
            {course.description && (
              <p className="text-sm text-muted-foreground mt-1.5 line-clamp-3">
                {htmlToPlainText(course.description)}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Progress value={progress.percent} />
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>
                {progress.completedLessons} of {progress.totalLessons} lessons ·{" "}
                <span className="font-semibold text-primary">{progress.percent}%</span>
              </span>
              {totalDuration && (
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {totalDuration} total
                </span>
              )}
            </div>
          </div>

          {cta && (
            <div className="space-y-1">
              <Button
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
                <p className="text-xs text-muted-foreground">Up next: {next.title}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
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
