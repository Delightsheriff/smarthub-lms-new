"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { coursesService } from "./courses.service";
import { normaliseEnrolledCourse } from "./normalise";
import { normaliseModuleContent } from "@/modules/learning/api/normalise";
import type { Course, ApiModule } from "../types";
import type { ApiEnrolledCourseDetails } from "../types/api.types";
import type { Module } from "@/modules/learning/types";

/**
 * Hook signatures preserved from the mock era so the existing
 * components don't need touching. Bodies talk to `/lms/*` through the
 * data-source seam, which resolves against the mock router in the
 * UI-first phase.
 */
export const COURSES_QUERY_KEYS = {
  enrolled: ["courses", "enrolled"] as const,
  bySlug: (slug?: string) => ["courses", "by-slug", slug] as const,
  module: (slug?: string, moduleSlug?: string) =>
    ["courses", "by-slug", slug, "module", moduleSlug] as const,
} as const;

/**
 * Download the course syllabus. A mutation (side effect + pending flag)
 * rather than a query; nothing is cached because the API renders from
 * live course data every time.
 */
export function useDownloadCurriculum() {
  return useMutation({
    mutationFn: (slug: string) => coursesService.downloadCurriculum(slug),
    onSuccess: () => toast.success("Curriculum downloaded"),
    onError: () =>
      toast.error("Couldn't download the curriculum. Please try again."),
  });
}

export function useCourses() {
  return useQuery<Course[]>({
    queryKey: COURSES_QUERY_KEYS.enrolled,
    queryFn: async () => {
      const data = await coursesService.getEnrolled();
      return data.map(normaliseEnrolledCourse);
    },
  });
}

interface CourseBySlugResult {
  course: Course;
  /** Fully normalised modules with recordings/materials/assignments
   *  embedded — the outline reads this directly. */
  modules: Module[];
}

function buildBySlugResult(
  detail: ApiEnrolledCourseDetails,
): CourseBySlugResult {
  const course = normaliseEnrolledCourse(detail);
  const modulesArr = (detail.modules as unknown as Array<ApiModule>) || [];
  const modules = modulesArr.map((m, idx) =>
    normaliseModuleContent(
      m,
      course.id,
      m.recordings || [],
      m.materials || [],
      m.assignments || [],
      idx,
    ),
  );
  return { course, modules };
}

export function useCourseBySlug(slug: string | undefined) {
  return useQuery<CourseBySlugResult | null>({
    queryKey: COURSES_QUERY_KEYS.bySlug(slug),
    enabled: !!slug,
    queryFn: async () => {
      const detail = await coursesService.getEnrolledDetail(slug as string);
      return buildBySlugResult(detail);
    },
  });
}

export function useCourseModule(
  slug: string | undefined,
  moduleSlug: string | undefined,
) {
  const qc = useQueryClient();
  return useQuery({
    queryKey: COURSES_QUERY_KEYS.module(slug, moduleSlug),
    enabled: !!slug && !!moduleSlug,
    queryFn: async () => {
      const cached = qc.getQueryData<CourseBySlugResult | null>(
        COURSES_QUERY_KEYS.bySlug(slug),
      );

      let result: CourseBySlugResult | null;
      if (cached) {
        result = cached;
      } else {
        const detail = await coursesService.getEnrolledDetail(slug as string);
        result = buildBySlugResult(detail);
        qc.setQueryData(COURSES_QUERY_KEYS.bySlug(slug), result);
      }

      if (!result) return null;

      const matched = result.modules.find(
        (m) => m.slug === moduleSlug || m.id === moduleSlug,
      );
      if (!matched) return null;

      return {
        course: result.course,
        module: matched,
        modules: result.modules,
      };
    },
  });
}
