import { LMS_PREFIX } from "@/lib/api/constants";

export const TEACHING_ENDPOINTS = {
  COHORTS: `${LMS_PREFIX}/teaching/cohorts`,
  COHORT_DETAIL: (id: string) => `${LMS_PREFIX}/teaching/cohorts/${id}`,
  ROSTER: (id: string) => `${LMS_PREFIX}/teaching/cohorts/${id}/roster`,
  ASSIGNMENTS: (id: string) => `${LMS_PREFIX}/teaching/cohorts/${id}/assignments`,
  SUBMISSIONS: (id: string) => `${LMS_PREFIX}/teaching/cohorts/${id}/submissions`,
  GRADE_SUBMISSION: (id: string) => `${LMS_PREFIX}/teaching/submissions/${id}/grade`,
  UPDATE_ASSIGNMENT: (attId: string) => `${LMS_PREFIX}/teaching/assignments/${attId}`,
  ATTENDANCE_SESSION: (id: string) => `${LMS_PREFIX}/teaching/attendance/sessions/${id}`,
  MARK_ATTENDANCE: (id: string) => `${LMS_PREFIX}/teaching/attendance/sessions/${id}/mark`,
  STUDENT_ATTENDANCE: (studentId: string) => `${LMS_PREFIX}/teaching/attendance/students/${studentId}`,
} as const;
