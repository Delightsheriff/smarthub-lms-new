"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import { selfPacedService } from "./self-paced.service";
import {
  normaliseCompletion,
  normaliseCourseDetail,
  normaliseCourseSummary,
  normaliseNudge,
  normalisePass,
  normalisePlayback,
  normaliseUpgradeCredits,
} from "./normalise";
import { shouldRetry } from "../lib/access-denial";
import { STALE_TIME } from "@/lib/query-config";
import type {
  LessonCompletionResult,
  LessonPlayback,
  PassState,
  SelfPacedCourse,
  SelfPacedCourseSummary,
  SelfPacedNudge,
  UpgradeCredit,
} from "../types";

export const SELF_PACED_QUERY_KEYS = {
  all: ["self-paced"] as const,
  list: ["self-paced", "courses"] as const,
  course: (slug?: string) => ["self-paced", "course", slug] as const,
  playback: (lessonId?: string) => ["self-paced", "playback", lessonId] as const,
  nudges: ["self-paced", "nudges"] as const,
  upgradeCredit: ["self-paced", "upgrade-credit"] as const,
  pass: ["self-paced", "pass"] as const,
} as const;

/** Usable cohort upgrade credits; see `normaliseUpgradeCredits`. */
export function useUpgradeCredits({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery<UpgradeCredit[]>({
    queryKey: SELF_PACED_QUERY_KEYS.upgradeCredit,
    enabled,
    queryFn: async () =>
      normaliseUpgradeCredits(await selfPacedService.getUpgradeCredits()),
    staleTime: STALE_TIME.SLOW,
    retry: shouldRetry,
  });
}

export function useMyPass() {
  return useQuery<PassState>({
    queryKey: SELF_PACED_QUERY_KEYS.pass,
    queryFn: async () => normalisePass(await selfPacedService.getPass()),
    staleTime: STALE_TIME.SLOW,
    retry: shouldRetry,
  });
}

/** Sent, undismissed reminders. Only asked for by learners who hold a
 *  self-paced course — nobody else can have one. */
export function useSelfPacedNudges({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery<SelfPacedNudge[]>({
    queryKey: SELF_PACED_QUERY_KEYS.nudges,
    enabled,
    queryFn: async () =>
      (await selfPacedService.listNudges()).map(normaliseNudge),
    staleTime: STALE_TIME.DEFAULT,
    retry: shouldRetry,
  });
}

/** Dismiss, removed from the list at once and restored on failure. */
export function useDismissNudge() {
  const qc = useQueryClient();
  const key = SELF_PACED_QUERY_KEYS.nudges;
  return useMutation<void, unknown, string, { previous?: SelfPacedNudge[] }>({
    mutationFn: (id) => selfPacedService.dismissNudge(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<SelfPacedNudge[]>(key);
      if (previous) qc.setQueryData(key, previous.filter((n) => n.id !== id));
      return { previous };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) qc.setQueryData(key, context.previous);
      toast.error("Couldn't dismiss that reminder. Please try again.");
    },
  });
}

export function useSelfPacedCourses() {
  return useQuery<SelfPacedCourseSummary[]>({
    queryKey: SELF_PACED_QUERY_KEYS.list,
    queryFn: async () =>
      (await selfPacedService.listCourses()).map(normaliseCourseSummary),
    staleTime: STALE_TIME.DEFAULT,
    retry: shouldRetry,
  });
}

export function useSelfPacedCourse(slug: string | undefined) {
  return useQuery<SelfPacedCourse>({
    queryKey: SELF_PACED_QUERY_KEYS.course(slug),
    enabled: !!slug,
    queryFn: async () =>
      normaliseCourseDetail(await selfPacedService.getCourse(slug as string)),
    retry: shouldRetry,
  });
}

/**
 * A fresh playback reference per view. Never cached: a direct stream
 * token lapses in minutes, so a cached one is a broken one. The player
 * calls `refetch` itself when the token nears expiry or the video errors.
 */
export function useLessonPlayback(lessonId: string | undefined) {
  return useQuery<LessonPlayback>({
    queryKey: SELF_PACED_QUERY_KEYS.playback(lessonId),
    enabled: !!lessonId,
    queryFn: async () =>
      normalisePlayback(await selfPacedService.getPlayback(lessonId as string)),
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: shouldRetry,
  });
}

const withLessonState = (
  course: SelfPacedCourse,
  lessonId: string,
  completed: boolean
): SelfPacedCourse => {
  const lessons = course.lessons.map((l) =>
    l.id === lessonId ? { ...l, completed } : l
  );
  const done = lessons.filter((l) => l.completed).length;
  const total = lessons.length;
  return {
    ...course,
    lessons,
    progress: {
      totalLessons: total,
      completedLessons: done,
      percent: total ? Math.round((done / total) * 100) : 0,
    },
    nextLessonId: lessons.find((l) => !l.completed)?.id,
  };
};

interface ToggleInput {
  lessonId: string;
  complete: boolean;
}

/**
 * Mark / unmark a lesson against the self-paced endpoints.
 * Optimistic on the course detail cache, rolled back on failure.
 */
export function useToggleLessonComplete(slug: string | undefined) {
  const qc = useQueryClient();
  const key = SELF_PACED_QUERY_KEYS.course(slug);

  return useMutation<
    LessonCompletionResult,
    unknown,
    ToggleInput,
    { previous?: SelfPacedCourse }
  >({
    mutationFn: async ({ lessonId, complete }) =>
      normaliseCompletion(
        complete
          ? await selfPacedService.markComplete(lessonId)
          : await selfPacedService.unmarkComplete(lessonId)
      ),
    onMutate: async ({ lessonId, complete }) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<SelfPacedCourse>(key);
      if (previous) {
        qc.setQueryData(key, withLessonState(previous, lessonId, complete));
      }
      return { previous };
    },
    onError: (error, _input, context) => {
      if (context?.previous) qc.setQueryData(key, context.previous);
      toast.error(
        error instanceof ApiError && error.message
          ? error.message
          : "Couldn't update this lesson. Please try again."
      );
    },
    onSuccess: (result) => {
      const completedAt = (current?: string) =>
        result.courseCompleted === undefined
          ? current
          : result.courseCompleted
            ? (current ?? new Date().toISOString())
            : undefined;
      qc.setQueryData<SelfPacedCourse>(key, (current) =>
        current
          ? {
              ...current,
              progress: result.progress,
              completedAt: completedAt(current.completedAt),
            }
          : current
      );
      qc.invalidateQueries({ queryKey: SELF_PACED_QUERY_KEYS.list });
    },
  });
}
