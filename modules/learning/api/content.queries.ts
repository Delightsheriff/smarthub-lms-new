"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { learningService } from "./learning.service";
import { COURSES_QUERY_KEYS } from "@/modules/courses/api/courses.queries";
import {
  normaliseRecording,
  normaliseMaterial,
  normaliseRecordingWithContext,
  normaliseMaterialWithContext,
} from "./normalise";
import type { ContentProgressType } from "../types/api.types";

export const LEARNING_QUERY_KEYS = {
  recordingsByModule: (moduleId?: string) =>
    moduleId !== undefined
      ? (["learning", "recordings", "by-module", moduleId] as const)
      : (["learning", "recordings", "by-module"] as const),
  materialsByModule: (moduleId?: string) =>
    moduleId !== undefined
      ? (["learning", "materials", "by-module", moduleId] as const)
      : (["learning", "materials", "by-module"] as const),
  myRecordings: ["learning", "recordings", "mine"] as const,
  myMaterials: ["learning", "materials", "mine"] as const,
} as const;

/** Fire-and-forget tracking pings used by the recording dialog and
 *  the materials list. Real implementations live behind PATCH /lms/...
 *  endpoints; the mutations here are thin wrappers so the calling
 *  component code stays unchanged. */
export function useTrackRecordingView() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (recordingId: string) =>
      learningService.trackRecordingView(recordingId),
    // Flipping `watched` must refresh the course detail / module data so
    // the outline tick and the recordings "Watched" filter re-render.
    onSettled: () => {
      qc.invalidateQueries({ queryKey: COURSES_QUERY_KEYS.all });
      qc.invalidateQueries({ queryKey: LEARNING_QUERY_KEYS.myRecordings });
    },
  });
}

export function useTrackMaterialDownload() {
  return useMutation({
    mutationFn: (materialId: string) =>
      learningService.trackMaterialDownload(materialId),
    onError: () => toast.error("Couldn't record the download."),
  });
}

/** Recordings filed under a single module. Used by the instructor
 *  cohort module-detail page to list what's been published. The
 *  endpoint is course-scoped (returns every recording for the module
 *  regardless of cohort) which is fine for tutors managing content. */
export function useRecordingsByModule(moduleId: string | undefined) {
  return useQuery({
    queryKey: LEARNING_QUERY_KEYS.recordingsByModule(moduleId),
    queryFn: async () => {
      const rows = await learningService.getRecordingsByModule(
        moduleId as string,
      );
      return rows.map(normaliseRecording);
    },
    enabled: !!moduleId,
  });
}

export function useMaterialsByModule(moduleId: string | undefined) {
  return useQuery({
    queryKey: LEARNING_QUERY_KEYS.materialsByModule(moduleId),
    queryFn: async () => {
      const rows = await learningService.getMaterialsByModule(
        moduleId as string,
      );
      return rows.map(normaliseMaterial);
    },
    enabled: !!moduleId,
  });
}

/** Cross-course "All recordings" feed — every visible recording across
 *  the student's enrolments, tagged with course + module context.
 *  Backs the /recordings sidebar route. */
export function useMyRecordings() {
  return useQuery({
    queryKey: LEARNING_QUERY_KEYS.myRecordings,
    queryFn: async () => {
      const rows = await learningService.getMyRecordings();
      return rows.map(normaliseRecordingWithContext);
    },
  });
}

/** Cross-course "All materials" feed. Backs the /materials route. */
export function useMyMaterials() {
  return useQuery({
    queryKey: LEARNING_QUERY_KEYS.myMaterials,
    queryFn: async () => {
      const rows = await learningService.getMyMaterials();
      return rows.map(normaliseMaterialWithContext);
    },
  });
}

/** Cache key for one course's completion set. */
export const courseProgressKey = (courseId: string | undefined) =>
  ["learning", "progress", courseId] as const;

export const allProgressKey = ["learning", "progress", "all"] as const;

/**
 * Which items the student has marked complete in this course, as a Set
 * of contentIds for O(1) lookup from list rows.
 */
export function useCourseProgress(courseId: string | undefined) {
  return useQuery({
    queryKey: courseProgressKey(courseId),
    queryFn: async () => {
      const rows = await learningService.getCourseProgress(courseId as string);
      return new Set(rows.map((r) => r.contentId));
    },
    enabled: !!courseId,
  });
}

/**
 * Completion across every course, as a Set of contentIds. The
 * cross-course recordings feed spans courses, so a course-scoped
 * fetch would mean one request per course just to shade the rows.
 */
export function useAllProgress() {
  return useQuery({
    queryKey: allProgressKey,
    queryFn: async () => {
      const rows = await learningService.getAllProgress();
      return new Set(rows.map((r) => r.contentId));
    },
  });
}

/**
 * Toggle one item's completion (optimistic, with rollback).
 */
export function useToggleContentComplete(courseId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      contentType: ContentProgressType;
      contentId: string;
      completed: boolean;
    }) => {
      if (input.completed) {
        await learningService.unmarkContentComplete({
          contentType: input.contentType,
          contentId: input.contentId,
        });
      } else {
        await learningService.markContentComplete({
          courseId: courseId as string,
          contentType: input.contentType,
          contentId: input.contentId,
        });
      }
    },
    onMutate: async (input) => {
      const cKey = courseProgressKey(courseId);
      if (courseId) await qc.cancelQueries({ queryKey: cKey });
      await qc.cancelQueries({ queryKey: allProgressKey });

      const prevCourse = courseId
        ? qc.getQueryData<Set<string>>(cKey)
        : undefined;
      const prevAll = qc.getQueryData<Set<string>>(allProgressKey);

      if (courseId && prevCourse) {
        const nextCourse = new Set(prevCourse);
        if (input.completed) {
          nextCourse.delete(input.contentId);
        } else {
          nextCourse.add(input.contentId);
        }
        qc.setQueryData(cKey, nextCourse);
      }

      if (prevAll) {
        const nextAll = new Set(prevAll);
        if (input.completed) {
          nextAll.delete(input.contentId);
        } else {
          nextAll.add(input.contentId);
        }
        qc.setQueryData(allProgressKey, nextAll);
      }

      return { prevCourse, prevAll };
    },
    onError: (_err, _input, context) => {
      if (courseId && context?.prevCourse) {
        qc.setQueryData(courseProgressKey(courseId), context.prevCourse);
      }
      if (context?.prevAll) {
        qc.setQueryData(allProgressKey, context.prevAll);
      }
    },
    onSettled: () => {
      if (courseId) {
        qc.invalidateQueries({ queryKey: courseProgressKey(courseId) });
      }
      qc.invalidateQueries({ queryKey: allProgressKey });
      qc.invalidateQueries({ queryKey: COURSES_QUERY_KEYS.all });
    },
  });
}

