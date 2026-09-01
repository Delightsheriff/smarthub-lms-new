"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teachingService } from "./teaching.service";
import { normaliseCohort, normaliseCohortDetail } from "./normalise";
import type { TeachingCohort, TeachingCohortDetail } from "../types";

export const TEACHING_QUERY_KEYS = {
  cohorts: ["teaching", "cohorts"] as const,
  cohortDetail: (id: string) => ["teaching", "cohort", id] as const,
  roster: (id: string) => ["teaching", "cohort", id, "roster"] as const,
  assignments: (id: string) => ["teaching", "cohort", id, "assignments"] as const,
  submissions: (id: string) => ["teaching", "cohort", id, "submissions"] as const,
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
    },
  });
}

export function useUpdateAssignmentSchedule(scheduleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      attachmentId,
      patch,
    }: {
      attachmentId: string;
      patch: { dueDate?: string; isVisible?: boolean };
    }) => {
      return teachingService.updateAssignmentSchedule(attachmentId, patch);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEACHING_QUERY_KEYS.assignments(scheduleId) });
    },
  });
}
