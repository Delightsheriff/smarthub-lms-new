"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { coursesService } from "@/modules/courses/api/courses.service";
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
  detail: (id?: string) => ["assignments", "detail", id] as const,
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

export function useAssignmentDetail(id?: string) {
  return useQuery<AssignmentDetailContext | null>({
    queryKey: ASSIGNMENTS_QUERY_KEYS.detail(id),
    enabled: !!id,
    queryFn: async () => {
      if (!id) return null;
      const [assignmentRaw, submissionRaw, enrolledRaw] = await Promise.all([
        assignmentsService.getAssignmentById(id),
        assignmentsService.getMySubmission(id),
        coursesService.getEnrolled(),
      ]);

      if (!assignmentRaw) return null;

      const assignment = normaliseAssignment(assignmentRaw);
      const submission = submissionRaw
        ? normaliseSubmission(submissionRaw)
        : null;

      const courses = enrolledRaw.map(normaliseEnrolledCourse);
      const courseById = new Map(courses.map((c) => [c.id, c]));

      const moduleRef = assignmentRaw.module as PopulatedRef;
      const courseRef = assignmentRaw.course as PopulatedRef;
      const moduleId = refId(moduleRef);
      const courseId = refId(courseRef);

      const course = courseId ? courseById.get(courseId) : undefined;
      let moduleShape: Module | undefined;
      if (moduleId && courseId) {
        const fromList = enrolledRaw
          .flatMap((ec) => ec.modules || [])
          .find((m) => m._id === moduleId);
        moduleShape = {
          id: moduleId,
          slug: (fromList as ApiModule | undefined)?.titleSlug || moduleId,
          courseId,
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
