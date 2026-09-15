"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  ExternalLink,
  FileText,
  PartyPopper,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { RichText } from "@/components/ui/rich-text";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useLessonPlayback,
  useSelfPacedCourse,
  useToggleLessonComplete,
} from "../api/self-paced.queries";
import { SELF_PACED_ROUTES } from "../config/endpoints";
import { useCertificateRefetch } from "../hooks/use-certificate-refetch";
import { formatDuration, looksLikeHtml } from "../lib/format";
import type { SelfPacedCourse, SelfPacedLesson } from "../types";
import { SelfPacedErrorState } from "./AccessStates";
import { CertificateCard } from "./CertificateCard";
import { LessonDownload } from "./LessonDownload";
import { LessonList } from "./LessonList";
import { LessonVideo } from "./LessonVideo";

/** The next lesson to offer: the one after this if it's still to do,
 *  otherwise the first unfinished lesson anywhere in the course. */
const nextToOffer = (
  course: SelfPacedCourse,
  lessonId: string
): SelfPacedLesson | undefined => {
  const i = course.lessons.findIndex((l) => l.id === lessonId);
  const after = course.lessons.slice(i + 1).find((l) => !l.completed);
  return after ?? course.lessons.find((l) => !l.completed && l.id !== lessonId);
};

export function LessonPlayerPageContent({
  slug,
  lessonId,
}: {
  slug: string;
  lessonId: string;
}) {
  const courseQuery = useSelfPacedCourse(slug);
  const playbackQuery = useLessonPlayback(lessonId);
  const toggle = useToggleLessonComplete(slug);
  const course = courseQuery.data;

  const [unmarking, setUnmarking] = useState<SelfPacedLesson | null>(null);
  const [upNext, setUpNext] = useState<SelfPacedLesson | null>(null);
  const [videoEnded, setVideoEnded] = useState(false);
  const [celebrating, setCelebrating] = useState(false);

  useCertificateRefetch(
    celebrating && !!course && !course.certificate,
    courseQuery.refetch
  );

  if (courseQuery.isLoading) return <PlayerSkeleton />;
  if (courseQuery.error || !course) {
    return (
      <SelfPacedErrorState
        error={courseQuery.error}
        onRetry={() => void courseQuery.refetch()}
      />
    );
  }

  const index = course.lessons.findIndex((l) => l.id === lessonId);
  const lesson = index >= 0 ? course.lessons[index] : undefined;
  if (!lesson) {
    return (
      <SelfPacedErrorState
        error={playbackQuery.error ?? new NotInCourseError()}
      />
    );
  }
  const prev = course.lessons[index - 1];
  const next = course.lessons[index + 1];
  const courseHref = SELF_PACED_ROUTES.COURSE(course.slug);

  const markComplete = async () => {
    if (toggle.isPending) return;
    setVideoEnded(false);
    const alreadyComplete = !!course.completedAt;
    try {
      const result = await toggle.mutateAsync({
        lessonId: lesson.id,
        complete: true,
      });
      if (result.courseCompleted && !alreadyComplete) {
        setCelebrating(true);
        return;
      }
      const offer = nextToOffer(
        { ...course, lessons: course.lessons.map((l) => (l.id === lesson.id ? { ...l, completed: true } : l)) },
        lesson.id
      );
      if (offer) setUpNext(offer);
    } catch {
      // Rolled back and toasted by the mutation hook.
    }
  };

  const confirmUnmark = async () => {
    if (!unmarking) return;
    try {
      await toggle.mutateAsync({ lessonId: unmarking.id, complete: false });
      toast.success(`"${unmarking.title}" marked as not done`);
      setUnmarking(null);
    } catch {
      // Toasted by the mutation hook; leave the dialog open to retry.
    }
  };

  return (
    <div className="space-y-4 -mt-2">
      <div className="flex items-center justify-between gap-3">
        <Link
          href={courseHref}
          className="inline-flex min-w-0 items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{course.name}</span>
        </Link>
        <div className="flex w-32 shrink-0 items-center gap-2 sm:w-44">
          <Progress value={course.progress.percent} className="h-1.5" />
          <span className="text-[11px] font-semibold tabular-nums text-muted-foreground">
            {course.progress.percent}%
          </span>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-6 space-y-4 lg:space-y-0">
        <div className="min-w-0 space-y-4">
          {playbackQuery.isLoading ? (
            <Skeleton className="aspect-video w-full rounded-2xl" />
          ) : playbackQuery.error ? (
            <SelfPacedErrorState
              error={playbackQuery.error}
              onRetry={() => void playbackQuery.refetch()}
            />
          ) : playbackQuery.data ? (
            <LessonVideo
              key={lesson.id}
              title={lesson.title}
              playback={playbackQuery.data}
              refresh={async () => (await playbackQuery.refetch()).data}
              onEnded={() => {
                if (!lesson.completed) setVideoEnded(true);
                else {
                  const offer = nextToOffer(course, lesson.id);
                  if (offer) setUpNext(offer);
                }
              }}
            />
          ) : null}

          {videoEnded && !lesson.completed && (
            <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-primary/20 bg-primary/[0.03]">
              <p className="text-sm font-medium">
                Finished watching? Mark it done to keep your place.
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => setVideoEnded(false)}>
                  Not yet
                </Button>
                <Button size="sm" onClick={() => void markComplete()} disabled={toggle.isPending}>
                  Mark complete
                </Button>
              </div>
            </Card>
          )}

          {upNext && (
            <UpNextPrompt
              lesson={upNext}
              href={SELF_PACED_ROUTES.LESSON(course.slug, upNext.id)}
              onDismiss={() => setUpNext(null)}
            />
          )}

          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Lesson {index + 1} of {course.lessons.length}
                {lesson.durationSeconds > 0 &&
                  ` · ${formatDuration(lesson.durationSeconds)}`}
              </p>
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight leading-tight mt-1">
                {lesson.title}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {lesson.completed ? (
                <Button
                  variant="outline"
                  className="border-emerald-500/40 text-emerald-700 hover:text-emerald-800 dark:border-emerald-500/30 dark:text-emerald-300"
                  onClick={() => setUnmarking(lesson)}
                  disabled={toggle.isPending}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Completed
                </Button>
              ) : (
                <Button onClick={() => void markComplete()} disabled={toggle.isPending}>
                  <Circle className="h-4 w-4" />
                  Mark complete
                </Button>
              )}
              <div className="ml-auto flex gap-2">
                <NavButton
                  href={prev && SELF_PACED_ROUTES.LESSON(course.slug, prev.id)}
                  label="Previous"
                  icon="prev"
                />
                <NavButton
                  href={next && SELF_PACED_ROUTES.LESSON(course.slug, next.id)}
                  label="Next"
                  icon="next"
                />
              </div>
            </div>

            {lesson.description &&
              (looksLikeHtml(lesson.description) ? (
                <RichText html={lesson.description} />
              ) : (
                <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
                  {lesson.description}
                </p>
              ))}
          </div>

          {course.completedAt && (
            <CertificateCard
              courseName={course.name}
              certificate={course.certificate}
              completedAt={course.completedAt}
            />
          )}

          <LessonAssets
            loading={playbackQuery.isLoading}
            assets={playbackQuery.data?.assets ?? []}
          />
          {playbackQuery.data?.kind === "direct" && (
            <LessonDownload key={lesson.id} lessonId={lesson.id} />
          )}
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <Card className="p-0 overflow-hidden lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto">
            <header className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="text-sm font-semibold">Lessons</h2>
              <span className="text-xs text-muted-foreground tabular-nums">
                {course.progress.completedLessons}/{course.progress.totalLessons}
              </span>
            </header>
            <LessonList
              slug={course.slug}
              lessons={course.lessons}
              currentLessonId={lesson.id}
              nextLessonId={course.completedAt ? undefined : course.nextLessonId}
              compact
            />
          </Card>
        </aside>
      </div>

      <AlertDialog
        open={!!unmarking}
        onOpenChange={(open) => !open && setUnmarking(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark this lesson as not done?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{unmarking?.title}</strong> will be un-ticked and your
              course progress will go down. A course you&apos;ve already
              completed stays completed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={toggle.isPending}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={toggle.isPending}
              onClick={() => void confirmUnmark()}
            >
              Mark as not done
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={celebrating} onOpenChange={setCelebrating}>
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <PartyPopper className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-center">Course complete</DialogTitle>
            <DialogDescription className="text-center">
              You finished every lesson in {course.name}. Well done.
            </DialogDescription>
          </DialogHeader>
          <CertificateCard
            courseName={course.name}
            certificate={course.certificate}
            completedAt={course.completedAt}
          />
          <DialogFooter>
            <Button
              variant="outline"
              render={<Link href={courseHref}>Back to course</Link>}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

class NotInCourseError extends Error {}

function NavButton({
  href,
  label,
  icon,
}: {
  href?: string;
  label: string;
  icon: "prev" | "next";
}) {
  const content =
    icon === "prev" ? (
      <>
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">{label}</span>
      </>
    ) : (
      <>
        <span className="hidden sm:inline">{label}</span>
        <ChevronRight className="h-4 w-4" />
      </>
    );
  if (!href) {
    return (
      <Button variant="outline" size="sm" disabled aria-label={label}>
        {content}
      </Button>
    );
  }
  return (
    <Button
      variant="outline"
      size="sm"
      render={
        <Link href={href} aria-label={label}>
          {content}
        </Link>
      }
    />
  );
}

const AUTO_ADVANCE_SECONDS = 8;

function UpNextPrompt({
  lesson,
  href,
  onDismiss,
}: {
  lesson: SelfPacedLesson;
  href: string;
  onDismiss: () => void;
}) {
  const router = useRouter();
  const [seconds, setSeconds] = useState(AUTO_ADVANCE_SECONDS);

  useEffect(() => {
    if (seconds <= 0) {
      router.push(href);
      return;
    }
    const id = window.setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [seconds, href, router]);

  return (
    <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-emerald-500/30 bg-emerald-500/5">
      <div className="min-w-0">
        <p className="text-sm font-semibold inline-flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          Lesson complete
        </p>
        <p className="text-sm text-muted-foreground truncate">
          Up next: {lesson.title} · starting in {seconds}s
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button size="sm" variant="ghost" onClick={onDismiss}>
          Stay here
        </Button>
        <Button
          size="sm"
          render={
            <Link href={href}>Next lesson</Link>
          }
        />
      </div>
    </Card>
  );
}

function LessonAssets({
  loading,
  assets,
}: {
  loading: boolean;
  assets: { label: string; url: string; format?: string }[];
}) {
  if (loading) return <Skeleton className="h-24 w-full rounded-2xl" />;
  if (!assets.length) return null;
  return (
    <Card className="p-0 overflow-hidden">
      <header className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Resources</h2>
      </header>
      <ul className="divide-y">
        {assets.map((asset) => (
          <li key={asset.url}>
            <a
              href={asset.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
            >
              <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">
                {asset.label}
              </span>
              {asset.format && (
                <Badge variant="secondary" className="text-[10px] uppercase">
                  {asset.format}
                </Badge>
              )}
              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            </a>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function PlayerSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-40" />
      <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-6 space-y-4 lg:space-y-0">
        <div className="space-y-4">
          <Skeleton className="aspect-video w-full rounded-2xl" />
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-10 w-40" />
        </div>
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    </div>
  );
}
