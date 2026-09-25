"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teachingService } from "./teaching.service";
import { attendanceService } from "./attendance.service";
import { normaliseCohort, normaliseCohortDetail, normaliseInboxRow } from "./normalise";
import type { InboxRow, InstructorAssignmentRow, TeachingCohort, TeachingCohortDetail } from "../types";

export const TEACHING_QUERY_KEYS = {
  cohorts: ["teaching", "cohorts"] as const,
  cohortDetail: (id: string) => ["teaching", "cohort", id] as const,
  roster: (id: string) => ["teaching", "cohort", id, "roster"] as const,
  assignments: (id: string) => ["teaching", "cohort", id, "assignments"] as const,
  submissions: (id: string) => ["teaching", "cohort", id, "submissions"] as const,
  inbox: (limit?: number) =>
    limit !== undefined
      ? (["teaching", "inbox", limit] as const)
      : (["teaching", "inbox"] as const),
  recentSubmissions: (limit?: number) =>
    limit !== undefined
      ? (["teaching", "recent-submissions", limit] as const)
      : (["teaching", "recent-submissions"] as const),
  myAssignments: ["teaching", "my-assignments"] as const,
} as const;

export function useTeachingCohorts() {
  return useQuery<TeachingCohort[]>({
    queryKey: TEACHING_QUERY_KEYS.cohorts,
    queryFn: async () => {
      const raw = await teachingService.getCohorts();
      return (raw || []).map(normaliseCohort);
    },
  });
}

/** Top-N ungraded submissions across every cohort the caller teaches —
 *  the dashboard's "what needs my attention" feed. */
export function useInstructorInbox(limit = 5) {
  return useQuery<InboxRow[]>({
    queryKey: TEACHING_QUERY_KEYS.inbox(limit),
    queryFn: async () => {
      const rows = await teachingService.getInbox(limit, "ungraded");
      return rows.map(normaliseInboxRow);
    },
  });
}

/** Recent submissions across every cohort the caller teaches, regardless
 *  of grade state. Distinct query key from useInstructorInbox so the two
 *  dashboard tiles cache independently. */
export function useRecentSubmissions(limit = 5) {
  return useQuery<InboxRow[]>({
    queryKey: TEACHING_QUERY_KEYS.recentSubmissions(limit),
    queryFn: async () => {
      const rows = await teachingService.getInbox(limit, "all");
      return rows.map(normaliseInboxRow);
    },
  });
}

export function useTeachingCohortDetail(id: string) {
  return useQuery<TeachingCohortDetail>({
    queryKey: TEACHING_QUERY_KEYS.cohortDetail(id),
    enabled: !!id,
    queryFn: async () => {
      const raw = await teachingService.getCohortDetail(id);
      return normaliseCohortDetail(raw);
    },
  });
}

export function useCohortRoster(id: string) {
  return useQuery({
    queryKey: TEACHING_QUERY_KEYS.roster(id),
    enabled: !!id,
    queryFn: () => teachingService.getRoster(id),
  });
}

export function useCohortAssignments(id: string) {
  return useQuery({
    queryKey: TEACHING_QUERY_KEYS.assignments(id),
    enabled: !!id,
    queryFn: () => teachingService.getAssignments(id),
  });
}

export function useCohortSubmissions(id: string) {
  return useQuery({
    queryKey: TEACHING_QUERY_KEYS.submissions(id),
    enabled: !!id,
    queryFn: () => teachingService.getSubmissions(id),
  });
}

export function useGradeSubmission(scheduleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      submissionId,
      score,
      feedback,
    }: {
      submissionId: string;
      score: number;
      feedback?: string;
    }) => {
      return teachingService.gradeSubmission(submissionId, score, feedback);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEACHING_QUERY_KEYS.submissions(scheduleId) });
      queryClient.invalidateQueries({ queryKey: TEACHING_QUERY_KEYS.assignments(scheduleId) });
      queryClient.invalidateQueries({
        queryKey: ["teaching", "cohort", scheduleId, "student-assignments"],
      });
      queryClient.invalidateQueries({ queryKey: TEACHING_QUERY_KEYS.inbox() });
      queryClient.invalidateQueries({ queryKey: TEACHING_QUERY_KEYS.recentSubmissions() });
      queryClient.invalidateQueries({ queryKey: TEACHING_QUERY_KEYS.myAssignments });
    },
  });
}

/** One student's coursework on a cohort the caller teaches. Powers the
 *  student page's Coursework list. */
export function useCohortStudentAssignments(
  scheduleId: string | undefined,
  studentId: string | undefined,
) {
  return useQuery({
    queryKey: [
      "teaching",
      "cohort",
      scheduleId,
      "student-assignments",
      studentId,
    ] as const,
    queryFn: () =>
      teachingService.getCohortStudentAssignments(
        scheduleId as string,
        studentId as string,
      ),
    enabled: !!scheduleId && !!studentId,
  });
}

/** Per-student attendance history, scoped to one cohort the caller
 *  teaches. */
export function useCohortStudentAttendance(
  scheduleId: string | undefined,
  studentId: string | undefined,
) {
  return useQuery({
    queryKey: [
      "teaching",
      "cohort",
      scheduleId,
      "student-attendance",
      studentId,
    ] as const,
    queryFn: () =>
      attendanceService.getStudentAttendanceHistory(
        scheduleId as string,
        studentId as string,
      ),
    enabled: !!scheduleId && !!studentId,
  });
}

/** Every assignment across every cohort the caller teaches, with
 *  submission rollups — powers the instructor Tasks list. */
export function useInstructorAssignments() {
  return useQuery<InstructorAssignmentRow[]>({
    queryKey: TEACHING_QUERY_KEYS.myAssignments,
    queryFn: () => teachingService.getMyAssignments(),
  });
}

/** Grade a submission from a cross-cohort context (the dashboard's
 *  Needs-grading / Recent-submissions tiles) where there's no single
 *  `scheduleId` to invalidate against — invalidates the inbox queries
 *  themselves instead of one cohort's submissions list. */
export function useGradeSubmissionFromInbox() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      submissionId,
      score,
      feedback,
    }: {
      submissionId: string;
      score: number;
      feedback?: string;
    }) => {
      return teachingService.gradeSubmission(submissionId, score, feedback);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEACHING_QUERY_KEYS.inbox() });
      queryClient.invalidateQueries({ queryKey: TEACHING_QUERY_KEYS.recentSubmissions() });
      queryClient.invalidateQueries({ queryKey: TEACHING_QUERY_KEYS.myAssignments });
    },
  });
}

export function useUpdateAssignmentSchedule(scheduleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      assignmentId,
      patch,
    }: {
      assignmentId: string;
      patch: { dueDate?: string; isVisible?: boolean };
    }) => {
      return teachingService.updateAssignmentSchedule(
        assignmentId,
        scheduleId,
        patch,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TEACHING_QUERY_KEYS.assignments(scheduleId),
      });
      queryClient.invalidateQueries({
        queryKey: TEACHING_QUERY_KEYS.myAssignments,
      });
    },
  });
}
