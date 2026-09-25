"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { coursesService } from "@/modules/courses/api/courses.service";
import {
  COURSES_QUERY_KEYS,
  type CourseBySlugResult,
} from "@/modules/courses/api/courses.queries";
import { normaliseEnrolledCourse } from "@/modules/courses/api/normalise";
import { normaliseAssignment, normaliseSubmission } from "./normalise";
import type { ApiModule } from "@/modules/courses/types/api.types";
import type { Course } from "@/modules/courses/types";
import type { Module } from "@/modules/learning/types";
import { assignmentsService, SubmissionPayload } from "./assignments.service";
import type { Assignment, Submission } from "../types";

export const ASSIGNMENTS_QUERY_KEYS = {
  my: ["assignments", "my"] as const,
  upcoming: ["assignments", "upcoming"] as const,
  detail: (id?: string, courseSlug?: string) =>
    courseSlug
      ? (["assignments", "detail", id, courseSlug] as const)
      : (["assignments", "detail", id] as const),
} as const;

interface AssignmentWithContext {
  course: Course;
  module: Module;
  assignment: Assignment;
}

export interface AssignmentDetailContext {
  assignment: Assignment;
  submission: Submission | null;
  course?: Course;
  module?: Module;
  /** Raw refs from the assignment itself — present even when the course
   *  isn't in the caller's enrolled list (e.g. an instructor viewing it). */
  courseId?: string;
  moduleId?: string;
}

type PopulatedRef =
  | string
  | { _id: string; title?: string; titleSlug?: string; description?: string }
  | undefined;

const refId = (ref: PopulatedRef): string | undefined =>
  typeof ref === "string" ? ref : ref?._id;

/**
 * Build the cross-course assignment list. The `/lms/assignments`
 * endpoint returns flat assignments; we hydrate course + module context
 * by matching the `course` and `module` refs against the enrolled
 * courses fetch.
 */
export function useMyAssignments() {
  return useQuery<AssignmentWithContext[]>({
    queryKey: ASSIGNMENTS_QUERY_KEYS.my,
    queryFn: async () => {
      const [assignmentsRaw, enrolledRaw] = await Promise.all([
        assignmentsService.getStudentAssignments(),
        coursesService.getEnrolled(),
      ]);

      const courses = enrolledRaw.map(normaliseEnrolledCourse);
      const courseById = new Map(courses.map((c) => [c.id, c]));

      const out: AssignmentWithContext[] = [];
      for (const a of assignmentsRaw) {
        const moduleRef = a.module as PopulatedRef;
        const courseRef = a.course as PopulatedRef;
        const moduleId = refId(moduleRef);
        const courseId = refId(courseRef);
        if (!moduleId || !courseId) continue;

        const course = courseById.get(courseId);
        if (!course) continue;

        const populated =
          typeof moduleRef === "object" ? moduleRef : undefined;
        const fromList = enrolledRaw
          .flatMap((ec) => ec.modules || [])
          .find((m) => m._id === moduleId);

        const moduleShape: Module = {
          id: moduleId,
          slug:
            populated?.titleSlug ||
            (fromList as ApiModule | undefined)?.titleSlug ||
            moduleId,
          courseId,
          order: (fromList as ApiModule | undefined)?.order ?? 0,
          title:
            populated?.title ||
            (fromList as ApiModule | undefined)?.title ||
            "Module",
          summary:
            populated?.description ||
            (fromList as ApiModule | undefined)?.description ||
            "",
          recordings: [],
          materials: [],
          assignments: [],
        };
        out.push({
          course,
          module: moduleShape,
          assignment: normaliseAssignment(a),
        });
      }
      return out;
    },
  });
}

export function useAssignmentDetail(id?: string, courseSlug?: string) {
  const qc = useQueryClient();
  return useQuery<AssignmentDetailContext | null>({
    queryKey: ASSIGNMENTS_QUERY_KEYS.detail(id, courseSlug),
    enabled: !!id,
    queryFn: async () => {
      if (!id) return null;
      const [assignmentRaw, submissionRaw] = await Promise.all([
        assignmentsService.getAssignmentById(id),
        assignmentsService.getMySubmission(id),
      ]);

      if (!assignmentRaw) return null;

      const assignment = normaliseAssignment(assignmentRaw);
      const submission = submissionRaw
        ? normaliseSubmission(submissionRaw)
        : null;

      const moduleRef = assignmentRaw.module as PopulatedRef;
      const courseRef = assignmentRaw.course as PopulatedRef;
      const moduleId = refId(moduleRef);
      const courseId = refId(courseRef);

      // Fast path: courseSlug provided or resolved
      if (courseSlug) {
        const cached = qc.getQueryData<CourseBySlugResult | null>(
          COURSES_QUERY_KEYS.bySlug(courseSlug),
        );
        const cachedMod = cached?.modules.find(
          (m) => m.id === moduleId || m.slug === moduleId,
        );
        if (cached && cachedMod) {
          return {
            assignment,
            submission,
            courseId,
            moduleId,
            course: cached.course,
            module: cachedMod,
          };
        }

        try {
          const detail = await coursesService.getEnrolledDetail(courseSlug);
          const course = normaliseEnrolledCourse(detail);
          const modulesArr =
            (detail.modules as unknown as Array<ApiModule>) || [];
          const apiMod = modulesArr.find(
            (m) => m._id === moduleId || m.titleSlug === moduleId,
          );
          if (apiMod) {
            return {
              assignment,
              submission,
              courseId,
              moduleId,
              course,
              module: {
                id: apiMod._id,
                slug: apiMod.titleSlug || apiMod._id,
                courseId: course.id,
                order: apiMod.order ?? 0,
                title: apiMod.title,
                summary: apiMod.description || "",
                recordings: [],
                materials: [],
                assignments: [],
              },
            };
          }
        } catch {
          // Fall back to scanning enrolled courses below
        }
      }

      const enrolledRaw = await coursesService.getEnrolled();
      const courses = enrolledRaw.map(normaliseEnrolledCourse);
      const courseById = new Map(courses.map((c) => [c.id, c]));

      // Assignments are filed under a module and often carry no `course`
      // ref, so fall back to the enrolled course that contains the module.
      const resolvedCourseId =
        courseId ??
        (moduleId
          ? courses[
              enrolledRaw.findIndex((ec) =>
                (ec.modules || []).some((m) => m._id === moduleId),
              )
            ]?.id
          : undefined);
      const course = resolvedCourseId ? courseById.get(resolvedCourseId) : undefined;
      let moduleShape: Module | undefined;
      if (moduleId && resolvedCourseId) {
        const fromList = enrolledRaw
          .flatMap((ec) => ec.modules || [])
          .find((m) => m._id === moduleId);
        moduleShape = {
          id: moduleId,
          slug: (fromList as ApiModule | undefined)?.titleSlug || moduleId,
          courseId: resolvedCourseId,
          order: (fromList as ApiModule | undefined)?.order ?? 0,
          title: (fromList as ApiModule | undefined)?.title || "Module",
          summary: (fromList as ApiModule | undefined)?.description || "",
          recordings: [],
          materials: [],
          assignments: [],
        };
      }

      return {
        assignment,
        submission,
        course,
        module: moduleShape,
        courseId: resolvedCourseId,
        moduleId,
      };
    },
  });
}

export function useUpcomingDeadlines(limit = 3) {
  const all = useMyAssignments();
  return {
    ...all,
    data: (all.data || [])
      .filter((a) => a.assignment.status !== "graded")
      .sort(
        (a, b) =>
          new Date(a.assignment.dueAt).getTime() -
          new Date(b.assignment.dueAt).getTime(),
      )
      .slice(0, limit),
  };
}

export function useSubmitAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SubmissionPayload) =>
      assignmentsService.createSubmission(input),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({
        queryKey: ASSIGNMENTS_QUERY_KEYS.detail(vars.assignmentId),
      });
      qc.invalidateQueries({ queryKey: ASSIGNMENTS_QUERY_KEYS.my });
    },
  });
}

export function useResubmitAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      submissionId,
      payload,
    }: {
      submissionId: string;
      payload: SubmissionPayload;
    }) => assignmentsService.resubmit(submissionId, payload),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({
        queryKey: ASSIGNMENTS_QUERY_KEYS.detail(vars.payload.assignmentId),
      });
      qc.invalidateQueries({ queryKey: ASSIGNMENTS_QUERY_KEYS.my });
    },
  });
}

export function useUploadAssignmentFile() {
  return useMutation({
    mutationFn: (file: File) =>
      assignmentsService.uploadAssignmentFile(file),
  });
}
