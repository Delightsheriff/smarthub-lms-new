import { LMS_PREFIX } from "@/lib/api/constants";

export const TEACHING_ENDPOINTS = {
  COHORTS: `${LMS_PREFIX}/teaching/cohorts`,
  INBOX: `${LMS_PREFIX}/teaching/inbox`,
  MY_ASSIGNMENTS: `${LMS_PREFIX}/teaching/assignments`,
  COHORT_DETAIL: (id: string) => `${LMS_PREFIX}/teaching/cohorts/${id}`,
  ROSTER: (id: string) => `${LMS_PREFIX}/teaching/cohorts/${id}/roster`,
  ASSIGNMENTS: (id: string) => `${LMS_PREFIX}/teaching/cohorts/${id}/assignments`,
  SUBMISSIONS: (id: string) => `${LMS_PREFIX}/teaching/cohorts/${id}/submissions`,
  GRADE_SUBMISSION: (id: string) => `${LMS_PREFIX}/teaching/submissions/${id}/grade`,
  ASSIGNMENT_SCHEDULE: (assignmentId: string, scheduleId: string) =>
    `${LMS_PREFIX}/assignments/${assignmentId}/schedules/${scheduleId}`,
  ATTENDANCE_SESSION: (id: string) => `${LMS_PREFIX}/class-sessions/${id}/attendance`,
  MARK_ATTENDANCE: (id: string) => `${LMS_PREFIX}/class-sessions/${id}/attendance`,
  STUDENT_ATTENDANCE: (scheduleId: string, studentId: string) => `${LMS_PREFIX}/teaching/cohorts/${scheduleId}/students/${studentId}/attendance`,
  COHORT_STUDENT_ASSIGNMENTS: (scheduleId: string, studentId: string) =>
    `${LMS_PREFIX}/teaching/cohorts/${scheduleId}/students/${studentId}/assignments`,

  // ─── Authoring (routes verified against smarthub-api lms-routes) ───
  /** RecordingSchedule rows for one cohort: `{ recordingId, isVisible }`. */
  COHORT_RECORDINGS: (scheduleId: string) =>
    `${LMS_PREFIX}/teaching/cohorts/${scheduleId}/recordings`,
  /** `{ connected, channelName? }` — drives the attach Slack toggle. */
  COHORT_SLACK_STATUS: (scheduleId: string) =>
    `${LMS_PREFIX}/teaching/cohorts/${scheduleId}/slack-status`,
  /** Every assignment filed under a module + the schedules it's on. */
  MODULE_ASSIGNMENTS: (moduleId: string) =>
    `${LMS_PREFIX}/teaching/modules/${moduleId}/assignments`,
  /** Every module across cohorts the caller teaches (multi-cohort create). */
  MY_MODULES: `${LMS_PREFIX}/teaching/modules`,

  ASSIGNMENTS_BASE: `${LMS_PREFIX}/assignments`,
  ASSIGNMENT_BY_ID: (id: string) => `${LMS_PREFIX}/assignments/${id}`,

  RECORDINGS_BASE: `${LMS_PREFIX}/recordings`,
  RECORDING_BY_ID: (id: string) => `${LMS_PREFIX}/recordings/${id}`,
  RECORDINGS_BY_MODULE: (moduleId: string) =>
    `${LMS_PREFIX}/recordings/module/${moduleId}`,
  RECORDING_TO_SCHEDULE: (id: string, scheduleId: string) =>
    `${LMS_PREFIX}/recordings/${id}/schedules/${scheduleId}`,

  MATERIALS_BASE: `${LMS_PREFIX}/materials`,
  MATERIAL_BY_ID: (id: string) => `${LMS_PREFIX}/materials/${id}`,
  MATERIALS_BY_MODULE: (moduleId: string) =>
    `${LMS_PREFIX}/materials/module/${moduleId}`,
  /** Detach HIDES the material from one cohort; the material survives. */
  MATERIAL_TO_SCHEDULE: (id: string, scheduleId: string) =>
    `${LMS_PREFIX}/materials/${id}/schedules/${scheduleId}`,
} as const;
