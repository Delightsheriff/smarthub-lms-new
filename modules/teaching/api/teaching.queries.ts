"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teachingService } from "./teaching.service";
import { attendanceService } from "./attendance.service";
import { assignmentsService } from "@/modules/assignments/api/assignments.service";
import {
  normaliseCohort,
  normaliseCohortDetail,
  normaliseInboxRow,
  normaliseInstructorModule,
  normaliseModuleAssignmentRow,
} from "./normalise";
import type {
  AttachAssignmentToSchedulePayload,
  CreateAssignmentPayload,
  CreateMaterialPayload,
  CreateRecordingPayload,
  InboxRow,
  InstructorAssignmentRow,
  TeachingCohort,
  TeachingCohortDetail,
  UpdateAssignmentPayload,
  UpdateAssignmentSchedulePayload,
  UpdateMaterialPayload,
  UpdateRecordingPayload,
} from "../types";

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
  myModules: ["teaching", "my-modules"] as const,
  cohortRecordings: (id: string) =>
    ["teaching", "cohort", id, "recordings"] as const,
  cohortSlackStatus: (id: string) =>
    ["teaching", "cohort", id, "slack-status"] as const,
  moduleAssignments: (moduleId: string) =>
    ["teaching", "module", moduleId, "assignments"] as const,
  moduleRecordings: (moduleId: string) =>
    ["teaching", "module", moduleId, "recordings"] as const,
  assignmentDetail: (id: string) =>
    ["teaching", "assignment-detail", id] as const,
  recording: (id: string) => ["teaching", "recording", id] as const,
  material: (id: string) => ["teaching", "material", id] as const,
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

/** Fetches full assignment details (description, instructions, link)
 *  for teaching and grading context. */
export function useTeachingAssignment(
  id: string | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: ["teaching", "assignment", id] as const,
    queryFn: () => assignmentsService.getAssignmentById(id as string),
    enabled: enabled && !!id,
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
      patch: UpdateAssignmentSchedulePayload;
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

// ─── Authoring: assignments ────────────────────────────────────────

/** The canonical assignment for the edit form (description, links,
 *  module, type…). Separate key from `useTeachingAssignment`, which
 *  reads the student-facing shape for the grading brief. */
export function useAssignmentDetail(id: string | undefined) {
  return useQuery({
    queryKey: TEACHING_QUERY_KEYS.assignmentDetail(id || ""),
    queryFn: () => teachingService.getAssignmentDetail(id as string),
    enabled: !!id,
  });
}

export function useCreateTeachingAssignment() {
  return useMutation({
    mutationFn: (payload: CreateAssignmentPayload) =>
      teachingService.createAssignment(payload),
  });
}

export function useUpdateTeachingAssignment(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateAssignmentPayload) =>
      teachingService.updateAssignment(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TEACHING_QUERY_KEYS.assignmentDetail(id) });
      qc.invalidateQueries({ queryKey: ["teaching", "assignment", id] });
    },
  });
}

/** Attach an assignment to one cohort with its per-cohort due date. */
export function useAttachAssignmentToSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      assignmentId: string;
      scheduleId: string;
      payload: AttachAssignmentToSchedulePayload;
    }) =>
      teachingService.attachAssignmentToSchedule(
        vars.assignmentId,
        vars.scheduleId,
        vars.payload,
      ),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({
        queryKey: TEACHING_QUERY_KEYS.assignments(vars.scheduleId),
      });
      qc.invalidateQueries({ queryKey: ["teaching", "module"] });
      qc.invalidateQueries({ queryKey: TEACHING_QUERY_KEYS.myAssignments });
    },
  });
}

export function useModuleAssignments(moduleId: string | undefined) {
  return useQuery({
    queryKey: TEACHING_QUERY_KEYS.moduleAssignments(moduleId || ""),
    queryFn: async () =>
      (await teachingService.getModuleAssignments(moduleId as string)).map(
        normaliseModuleAssignmentRow,
      ),
    enabled: !!moduleId,
  });
}

/** Every module the caller teaches, with its cohort fan-out — powers
 *  the multi-cohort create flow. */
export function useInstructorModules() {
  return useQuery({
    queryKey: TEACHING_QUERY_KEYS.myModules,
    queryFn: async () =>
      (await teachingService.getMyModules()).map(normaliseInstructorModule),
  });
}

export function useCohortSlackStatus(scheduleId: string | undefined) {
  return useQuery({
    queryKey: TEACHING_QUERY_KEYS.cohortSlackStatus(scheduleId || ""),
    queryFn: () => teachingService.getCohortSlackStatus(scheduleId as string),
    enabled: !!scheduleId,
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Authoring: recordings ─────────────────────────────────────────

export function useTeachingRecording(id: string | undefined) {
  return useQuery({
    queryKey: TEACHING_QUERY_KEYS.recording(id || ""),
    queryFn: () => teachingService.getRecordingDetail(id as string),
    enabled: !!id,
  });
}

export function useCreateTeachingRecording() {
  return useMutation({
    mutationFn: (payload: CreateRecordingPayload) =>
      teachingService.createRecording(payload),
  });
}

export function useUpdateTeachingRecording(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateRecordingPayload) =>
      teachingService.updateRecording(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TEACHING_QUERY_KEYS.recording(id) });
      qc.invalidateQueries({ queryKey: ["teaching", "module"] });
    },
  });
}

export function useModuleRecordings(moduleId: string | undefined) {
  return useQuery({
    queryKey: TEACHING_QUERY_KEYS.moduleRecordings(moduleId || ""),
    queryFn: () => teachingService.getModuleRecordings(moduleId as string),
    enabled: !!moduleId,
  });
}

/** Which recordings are attached (and visible) on this cohort. */
export function useCohortRecordings(scheduleId: string | undefined) {
  return useQuery({
    queryKey: TEACHING_QUERY_KEYS.cohortRecordings(scheduleId || ""),
    queryFn: () => teachingService.getCohortRecordings(scheduleId as string),
    enabled: !!scheduleId,
  });
}

export function useAttachRecordingToSchedule(scheduleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (recordingId: string) =>
      teachingService.attachRecordingToSchedule(recordingId, scheduleId),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: TEACHING_QUERY_KEYS.cohortRecordings(scheduleId),
      });
    },
  });
}

// ─── Authoring: materials ──────────────────────────────────────────

export function useTeachingMaterial(id: string | undefined) {
  return useQuery({
    queryKey: TEACHING_QUERY_KEYS.material(id || ""),
    queryFn: () => teachingService.getMaterialDetail(id as string),
    enabled: !!id,
  });
}

export function useCreateTeachingMaterial() {
  return useMutation({
    mutationFn: (payload: CreateMaterialPayload) =>
      teachingService.createMaterial(payload),
  });
}

export function useUpdateTeachingMaterial(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateMaterialPayload) =>
      teachingService.updateMaterial(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TEACHING_QUERY_KEYS.material(id) });
      qc.invalidateQueries({ queryKey: ["teaching", "module"] });
    },
  });
}

// ─── Detach (assignment | recording) ───────────────────────────────

/**
 * Detach content from ONE cohort. Hides rather than deletes, so
 * re-attaching restores it and other cohorts are untouched. Materials
 * have no per-cohort state (legacy 2a6285c), so they can't be detached.
 */
export function useDetachFromSchedule(scheduleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { kind: "recording" | "assignment"; id: string }) =>
      vars.kind === "recording"
        ? teachingService.detachRecordingFromSchedule(vars.id, scheduleId)
        : teachingService.detachAssignmentFromSchedule(vars.id, scheduleId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teaching"] });
    },
  });
}
