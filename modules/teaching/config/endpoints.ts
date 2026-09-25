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
} as const;
